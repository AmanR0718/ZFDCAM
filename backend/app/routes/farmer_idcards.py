# backend/app/routes/farmer_idcards.py
"""ID card generation endpoints."""
from fastapi import APIRouter, Depends, BackgroundTasks
from app.database import get_database
from app.dependencies.roles import require_role
from app.services.idcard_service import IDCardService

router = APIRouter(prefix="/api/farmers", tags=["Farmer ID Cards"])


@router.post("/{farmer_id}/generate-idcard")
async def generate_idcard(
    farmer_id: str,
    background_tasks: BackgroundTasks,
    db=Depends(get_database),
    _=Depends(require_role(["ADMIN", "OPERATOR"]))
):
    """Generate ID card for farmer (async)."""
    return await IDCardService.generate(farmer_id, background_tasks, db)


@router.get("/{farmer_id}/download-idcard")
async def download_idcard(
    farmer_id: str,
    db=Depends(get_database),
    _=Depends(require_role(["ADMIN", "OPERATOR", "VIEWER"]))
):
    """Download generated ID card PDF."""
    return await IDCardService.download(farmer_id, db)
