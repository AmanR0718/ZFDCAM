# backend/app/services/photo_service.py
"""Photo upload and management service."""
import os
from fastapi import HTTPException, UploadFile
from app.config import settings


class PhotoService:
    """Handles farmer photo uploads."""

    @staticmethod
    async def upload(farmer_id: str, file: UploadFile, db):
        """Upload and save farmer photo."""
        # Verify farmer exists
        farmer = await db.farmers.find_one({"farmer_id": farmer_id})
        if not farmer:
            raise HTTPException(status_code=404, detail="Farmer not found")

        # Save photo to disk
        folder = os.path.join(settings.UPLOAD_DIR, "photos", farmer_id)
        os.makedirs(folder, exist_ok=True)
        file_path = os.path.join(folder, f"{farmer_id}_photo.jpg")

        with open(file_path, "wb") as f:
            f.write(await file.read())

        # Update database
        db_path = file_path.replace("/app", "").replace("\\", "/")
        await db.farmers.update_one(
            {"farmer_id": farmer_id},
            {"$set": {"photo_path": db_path}}
        )

        return {"message": "Photo uploaded successfully", "photo_path": db_path}
