# backend/app/tasks/id_card_task.py
from celery import shared_task
from fpdf import FPDF
import qrcode
from datetime import datetime
import os
from pymongo import MongoClient
from app.config import settings

UPLOAD_DIR = "/app/uploads/idcards"
QR_DIR = "/app/uploads/qr"

@shared_task(name="app.tasks.id_card_task.generate_id_card")
def generate_id_card(farmer_id: str):
    # Create MongoDB client (sync)
    client = MongoClient(settings.MONGODB_URL)
    db = client[settings.MONGODB_DB_NAME]
    farmer = db.farmers.find_one({"farmer_id": farmer_id})

    if not farmer:
        client.close()
        raise Exception(f"Farmer {farmer_id} not found in DB.")

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    os.makedirs(QR_DIR, exist_ok=True)

    # Generate QR code
    qr_data = {
        "farmer_id": farmer_id,
        "verified": True,
        "timestamp": datetime.utcnow().isoformat()
    }
    qr_img = qrcode.make(qr_data)
    qr_path = os.path.join(QR_DIR, f"{farmer_id}_qr.png")
    qr_img.save(qr_path)

    # Handle photo path
    photo_path = farmer.get("photo_path")
    photo_abs_path = f"/app{photo_path}" if photo_path else None

    # Create PDF ID card
    pdf_path = os.path.join(UPLOAD_DIR, f"{farmer_id}_card.pdf")
    pdf = FPDF("P", "mm", (90, 60))
    pdf.add_page()
    pdf.set_font("Helvetica", "B", 14)
    pdf.cell(0, 10, "🌾 ZAMBIAN FARMER SUPPORT SYSTEM", ln=True, align="C")

    # Insert photo if available
    if photo_abs_path and os.path.exists(photo_abs_path):
        try:
            pdf.image(photo_abs_path, x=5, y=20, w=25, h=25)
        except Exception:
            # fallback if image embedding fails
            pdf.set_fill_color(200, 200, 200)
            pdf.rect(5, 20, 25, 25, style="F")
            pdf.set_font("Helvetica", "I", 8)
            pdf.set_xy(6, 35)
            pdf.cell(20, 10, "No Photo")
    else:
        # Placeholder for missing photo
        pdf.set_fill_color(200, 200, 200)
        pdf.rect(5, 20, 25, 25, style="F")
        pdf.set_font("Helvetica", "I", 8)
        pdf.set_xy(6, 35)
        pdf.cell(20, 10, "No Photo")

    # Add QR code
    qr_img = ImageReader(qr_path)
    pdf.image(qr_img, x=60, y=20, w=25, h=25)

    # Add farmer information
    name = f"{farmer['personal_info']['first_name']} {farmer['personal_info']['last_name']}"
    pdf.set_xy(5, 50)
    pdf.set_font("Helvetica", size=10)
    pdf.multi_cell(0, 5, f"Name: {name}\nID: {farmer_id}", align="L")
    pdf.output(pdf_path)

    # Update farmer record
    db.farmers.update_one(
        {"farmer_id": farmer_id},
        {
            "$set": {
                "id_card_path": pdf_path,
                "qr_code_path": qr_path,
                "id_card_generated_at": datetime.utcnow()
            }
        }
    )

    client.close()
    return {"message": "ID card generated", "id_card_path": pdf_path}
