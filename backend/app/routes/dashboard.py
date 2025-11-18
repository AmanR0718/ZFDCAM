# backend/app/routes/dashboard.py
from fastapi import APIRouter, Depends
from app.database import get_db
from app.dependencies.roles import require_role
from datetime import datetime

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get(
    "/stats",
    summary="Get dashboard stats",
    description="Returns key dashboard statistics for admin/operator. Auth required."
)
async def get_dashboard_stats(
    db = Depends(get_db),
    current_user = Depends(require_role(["ADMIN", "OPERATOR"]))
):
    total_farmers = await db.farmers.count_documents({})
    active_farmers = await db.farmers.count_documents({"registration_status": "approved"})
    pending_farmers = await db.farmers.count_documents({"registration_status": "pending"})
    rejected_farmers = await db.farmers.count_documents({"registration_status": "rejected"})
    total_users = await db.users.count_documents({})
    operators = await db.operators.count_documents({})
    recent_farmers = await db.farmers.find({}).sort("created_at", -1).limit(5).to_list(5)

    # Format recent farmer fields for summary
    recent_results = []
    for f in recent_farmers:
        recent_results.append({
            "farmer_id": f.get("farmer_id"),
            "name": f.get("personal_info", {}).get("first_name") + " " +
                    f.get("personal_info", {}).get("last_name"),
            "district": f.get("address", {}).get("district_name"),
            "created_at": f.get("created_at")
        })

    return {
        "farmers": {
            "total": total_farmers,
            "active": active_farmers,
            "pending": pending_farmers,
            "rejected": rejected_farmers,
            "recent": recent_results
        },
        "users": total_users,
        "operators": operators,
        "generated_at": datetime.now().isoformat()
    }
