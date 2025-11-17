# backend/app/routes/uploads.py (or create farmers_photos.py)
from fastapi import APIRouter, File, UploadFile, Depends
from app.database import get_database
import os

router = APIRouter(prefix="/api/farmers", tags=["Uploads"])

@router.post("/{farmer_id}/upload-photo")
async def upload_photo(
    farmer_id: str,
    file: UploadFile = File(...),
    db=Depends(get_database)
):
    """Upload farmer photo."""
    # Save file
    folder = f"/app/uploads/photos/{farmer_id}"
    os.makedirs(folder, exist_ok=True)
    file_path = f"{folder}/{file.filename}"
    
    with open(file_path, "wb") as f:
        f.write(await file.read())
    
    # Update database
    await db.farmers.update_one(
        {"farmer_id": farmer_id},
        {"$set": {"photo_path": file_path}}
    )
    
    return {"message": "Photo uploaded", "path": file_path}
