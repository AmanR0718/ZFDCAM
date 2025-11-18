# backend/app/routes/reports.py
from fastapi import APIRouter, Depends
from datetime import datetime, timedelta
from app.database import get_db
from app.dependencies.roles import require_role

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/dashboard", dependencies=[Depends(require_role(["ADMIN"]))])
async def dashboard_summary(db=Depends(get_db)):
    """
    High-level admin dashboard summary:
     - total farmers
     - total operators
     - active users
     - farmers registered this month
    """
    total_farmers = await db.farmers.count_documents({})
    total_operators = await db.operators.count_documents({})
    total_users = await db.users.count_documents({})

    month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    farmers_this_month = await db.farmers.count_documents({"created_at": {"$gte": month_start}})

    return {
        "timestamp": datetime.utcnow(),
        "metrics": {
            "farmers_total": total_farmers,
            "operators_total": total_operators,
            "users_total": total_users,
            "farmers_registered_this_month": farmers_this_month,
        }
    }


@router.get("/farmers-by-region", dependencies=[Depends(require_role(["ADMIN"]))])
async def farmers_by_region(db=Depends(get_db)):
    """
    Aggregate farmer counts by province/district for admin geographic analytics.
    """
    pipeline = [
        {
            "$group": {
                "_id": {
                    "province": "$address.province_name",
                    "district": "$address.district_name",
                },
                "count": {"$sum": 1},
            }
        },
        {"$sort": {"_id.province": 1, "_id.district": 1}},
    ]
    results = await db.farmers.aggregate(pipeline).to_list(length=None)
    formatted = [
        {
            "province": r["_id"]["province"],
            "district": r["_id"]["district"],
            "farmer_count": r["count"],
        }
        for r in results
    ]
    return {"generated_at": datetime.utcnow(), "regions": formatted}


@router.get("/operator-performance", dependencies=[Depends(require_role(["ADMIN"]))])
async def operator_performance(db=Depends(get_db)):
    """
    Aggregate stats per operator: total farmers registered, recent registrations (30d).
    """
    cutoff = datetime.utcnow() - timedelta(days=30)
    pipeline = [
        {
            "$group": {
                "_id": "$created_by",
                "total_farmers": {"$sum": 1},
                "recent_farmers": {
                    "$sum": {
                        "$cond": [
                            {"$gte": ["$created_at", cutoff]},
                            1,
                            0,
                        ]
                    }
                },
            }
        },
        {"$sort": {"total_farmers": -1}},
    ]
    results = await db.farmers.aggregate(pipeline).to_list(length=None)

    out = []
    for r in results:
        op = await db.operators.find_one({"operator_id": r["_id"]}, {"full_name": 1, "email": 1})
        out.append(
            {
                "operator_id": r["_id"],
                "operator_name": op.get("full_name") if op else "Unknown",
                "email": op.get("email") if op else None,
                "total_farmers": r["total_farmers"],
                "recent_farmers_30d": r["recent_farmers"],
            }
        )
    return {"generated_at": datetime.utcnow(), "operators": out}


@router.get("/activity-trends", dependencies=[Depends(require_role(["ADMIN"]))])
async def activity_trends(db=Depends(get_db)):
    """
    Daily registration count for past 14 days for charting.
    """
    days = 14
    start = datetime.utcnow() - timedelta(days=days)
    pipeline = [
        {"$match": {"created_at": {"$gte": start}}},
        {
            "$group": {
                "_id": {
                    "year": {"$year": "$created_at"},
                    "month": {"$month": "$created_at"},
                    "day": {"$dayOfMonth": "$created_at"},
                },
                "count": {"$sum": 1},
            }
        },
        {"$sort": {"_id.year": 1, "_id.month": 1, "_id.day": 1}},
    ]
    results = await db.farmers.aggregate(pipeline).to_list(length=None)
    formatted = [
        {
            "date": f"{r['_id']['year']}-{r['_id']['month']:02d}-{r['_id']['day']:02d}",
            "registrations": r["count"],
        }
        for r in results
    ]
    return {"generated_at": datetime.utcnow(), "trends": formatted}
