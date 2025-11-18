# backend/app/routes/farmer_photos.py
from fastapi import APIRouter, File, UploadFile, Depends, HTTPException, status
from app.database import get_db
from app.dependencies.roles import require_operator
from app.config import settings
from pathlib import Path

router = APIRouter(prefix="/farmers", tags=["Farmer Photos"])

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png"}
MAX_UPLOAD_SIZE_MB = settings.MAX_UPLOAD_SIZE_MB

def is_allowed_extension(filename: str) -> bool:
    ext = filename.rsplit('.', 1)[-1].lower()
    return ext in ALLOWED_EXTENSIONS

def get_photo_folder(farmer_id: str) -> Path:
    return Path(settings.UPLOAD_DIR) / farmer_id / "photos"

@router.post("/{farmer_id}/upload-photo", dependencies=[Depends(require_operator)])
async def upload_photo(
    farmer_id: str,
    file: UploadFile = File(...),
    db = Depends(get_db)
):
    if not is_allowed_extension(file.filename):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file extension. Allowed: {ALLOWED_EXTENSIONS}"
        )

    content = await file.read()
    if len(content) > MAX_UPLOAD_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Max {MAX_UPLOAD_SIZE_MB}MB allowed."
        )
    photo_folder = get_photo_folder(farmer_id)
    photo_folder.mkdir(parents=True, exist_ok=True)
    filename = f"photo.{file.filename.rsplit('.', 1)[-1].lower()}"
    file_path = photo_folder / filename

    with open(file_path, "wb") as f:
        f.write(content)
    db_path = f"/uploads/{farmer_id}/photos/{filename}"
    await db.farmers.update_one(
        {"farmer_id": farmer_id},
        {"$set": {"documents.photo": db_path}}
    )
    return {"message": "Photo uploaded", "photo_path": db_path}
