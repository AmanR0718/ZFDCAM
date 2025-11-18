# backend/app/routes/farmers_qr.py
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from app.utils.security import verify_qr_signature
from app.database import get_db
from app.dependencies.roles import require_role
from typing import Dict

import os

router = APIRouter(prefix="/farmers", tags=["Farmers QR & ID"])


@router.post("/verify-qr")
async def verify_qr(payload: Dict, db=Depends(get_db)):
    """Verify a QR payload signed with server secret."""
    farmer_id = payload.get("farmer_id")
    timestamp = payload.get("timestamp")
    signature = payload.get("signature")

    if not farmer_id or not timestamp or not signature:
        raise HTTPException(status_code=400, detail="Missing fields in payload")

    if not verify_qr_signature(payload):
        raise HTTPException(status_code=400, detail="Invalid or tampered QR signature")

    farmer = await db.farmers.find_one({"farmer_id": farmer_id})
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    return {
        "verified": True,
        "farmer_id": farmer_id,
        "name": f"{farmer['personal_info']['first_name']} {farmer['personal_info']['last_name']}",
        "province": farmer["address"].get("province_name"),
        "district": farmer["address"].get("district_name"),
    }


@router.get("/{farmer_id}/download-idcard",
            dependencies=[Depends(require_role(["ADMIN", "OPERATOR"]))])
async def download_idcard(farmer_id: str, db=Depends(get_db)):
    farmer = await db.farmers.find_one({"farmer_id": farmer_id})
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    file_path = farmer.get("documents", {}).get("id_card")
    if not file_path or not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="ID card not generated yet")

    return FileResponse(
        path=file_path,
        media_type="application/pdf",
        filename=f"{farmer_id}_card.pdf"
    )
