# backend/app/services/idcard_service.py (COMPLETE)
"""ID card generation service with QR code."""

import os
import qrcode
from io import BytesIO
from pathlib import Path
from fastapi import HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from datetime import datetime
import json

class IDCardService:
    """Handles ID card generation with QR code."""

    @staticmethod
    def generate_qr_code(farmer_data: dict, farmer_id: str) -> str:
        """Generate QR code containing farmer info."""
        # Create QR data payload
        qr_data = {
            "farmer_id": farmer_id,
            "name": f"{farmer_data.get('personal_info', {}).get('first_name', '')} {farmer_data.get('personal_info', {}).get('last_name', '')}",
            "phone": farmer_data.get('personal_info', {}).get('phone_primary', ''),
            "district": farmer_data.get('address', {}).get('district_name', ''),
            "farm_size": farmer_data.get('farm_info', {}).get('farm_size_hectares', 0),
        }
        
        # Generate QR code
        qr = qrcode.QRCode(version=1, box_size=10, border=4)
        qr.add_data(json.dumps(qr_data))
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Save QR code
        qr_folder = Path(f"uploads/{farmer_id}/qr")
        qr_folder.mkdir(parents=True, exist_ok=True)
        qr_path = qr_folder / f"{farmer_id}_qr.png"
        img.save(qr_path)
        
        return str(qr_path)

    @staticmethod
    def generate_id_card_pdf(farmer_data: dict, farmer_id: str, qr_path: str) -> str:
        """Generate PDF ID card with QR code."""
        # Create ID card folder
        idcard_folder = Path(f"uploads/{farmer_id}/idcards")
        idcard_folder.mkdir(parents=True, exist_ok=True)
        pdf_path = idcard_folder / f"{farmer_id}_card.pdf"
        
        # Create PDF
        c = canvas.Canvas(str(pdf_path), pagesize=letter)
        width, height = letter
        
        # Title
        c.setFont("Helvetica-Bold", 20)
        c.drawCentredString(width / 2, height - 50, "🌾 ZAMBIAN FARMER SUPPORT SYSTEM")
        
        # Farmer ID
        c.setFont("Helvetica-Bold", 16)
        c.drawString(50, height - 100, f"Farmer ID: {farmer_id}")
        
        # Personal Info
        c.setFont("Helvetica", 12)
        y_position = height - 140
        personal = farmer_data.get('personal_info', {})
        address = farmer_data.get('address', {})
        farm = farmer_data.get('farm_info', {})
        
        info_lines = [
            f"Name: {personal.get('first_name', '')} {personal.get('last_name', '')}",
            f"Phone: {personal.get('phone_primary', 'N/A')}",
            f"Province: {address.get('province_name', 'N/A')}",
            f"District: {address.get('district_name', 'N/A')}",
            f"Village: {address.get('village', 'N/A')}",
            f"Farm Size: {farm.get('farm_size_hectares', 0)} hectares",
            f"Crops: {', '.join(farm.get('crops_grown', []))}",
        ]
        
        for line in info_lines:
            c.drawString(50, y_position, line)
            y_position -= 25
        
        # Add QR Code
        if os.path.exists(qr_path):
            qr_img = ImageReader(qr_path)
            c.drawImage(qr_img, width - 200, height - 300, width=150, height=150)
        
        # Footer
        c.setFont("Helvetica-Italic", 10)
        c.drawCentredString(width / 2, 50, f"Generated on {datetime.now().strftime('%Y-%m-%d %H:%M')}")
        c.drawCentredString(width / 2, 35, "Valid for official identification at agricultural offices")
        
        c.save()
        return str(pdf_path)

    @staticmethod
    async def generate(farmer_id: str, background_tasks: BackgroundTasks, db):
        """Queue ID card generation."""
        farmer = await db.farmers.find_one({"farmer_id": farmer_id})
        if not farmer:
            raise HTTPException(status_code=404, detail="Farmer not found")
        
        try:
            # Generate QR code
            qr_path = IDCardService.generate_qr_code(farmer, farmer_id)
            
            # Generate PDF ID card
            pdf_path = IDCardService.generate_id_card_pdf(farmer, farmer_id, qr_path)
            
            # Update database
            await db.farmers.update_one(
                {"farmer_id": farmer_id},
                {
                    "$set": {
                        "qr_code_path": qr_path,
                        "id_card_path": pdf_path,
                        "id_card_generated_at": datetime.utcnow()
                    }
                }
            )
            
            return {
                "message": "ID card generated successfully",
                "farmer_id": farmer_id,
                "id_card_path": pdf_path,
                "qr_code_path": qr_path
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"ID card generation failed: {str(e)}")

    @staticmethod
    async def download(farmer_id: str, db):
        """Download generated ID card PDF."""
        farmer = await db.farmers.find_one({"farmer_id": farmer_id})
        if not farmer or not farmer.get("id_card_path"):
            raise HTTPException(status_code=404, detail="ID card not found")
        
        file_path = farmer["id_card_path"]
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found on disk")
        
        return FileResponse(
            file_path,
            media_type="application/pdf",
            filename=os.path.basename(file_path)
        )
