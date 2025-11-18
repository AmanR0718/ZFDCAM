# backend/app/routes/health.py
from fastapi import APIRouter, status
from pymongo import MongoClient
from redis import Redis
from celery import Celery
import os

router = APIRouter(tags=["Health"])

# Initialize Celery app for health checks
celery_app = Celery("farmer_sync", broker=os.getenv("REDIS_URL", "redis://redis:6379/0"))


@router.get(
    "",
    summary="Basic health check",
    description="Simple health check for uptime and Docker probes."
)
def basic_health():
    return {"status": "ok"}


@router.get(
    "/full",
    summary="Full system health diagnostics",
    description="Check status of MongoDB, Redis, Celery, disk writes."
)
def full_health_check():
    status_report = {
        "mongo": False,
        "redis": False,
        "celery": False,
        "disk": False,
        "mongo_error": None,
        "redis_error": None,
        "celery_error": None,
        "disk_error": None
    }

    # MongoDB check
    try:
        mongo_url = os.getenv("MONGODB_URL")
        client = MongoClient(mongo_url, serverSelectionTimeoutMS=2000)
        client.server_info()
        status_report["mongo"] = True
    except Exception as e:
        status_report["mongo_error"] = str(e)

    # Redis check
    try:
        redis_url = os.getenv("REDIS_URL", "redis://redis:6379/0")
        redis_client = Redis.from_url(redis_url)
        redis_client.ping()
        status_report["redis"] = True
    except Exception as e:
        status_report["redis_error"] = str(e)

    # Celery worker check
    try:
        ping = celery_app.control.ping(timeout=2)
        status_report["celery"] = bool(ping)
    except Exception as e:
        status_report["celery_error"] = str(e)

    # Disk write check
    try:
        test_path = os.path.join(os.getenv("UPLOAD_DIR", "/app/uploads"), "health_test.txt")
        with open(test_path, "w") as f:
            f.write("ok")
        os.remove(test_path)
        status_report["disk"] = True
    except Exception as e:
        status_report["disk_error"] = str(e)

    all_ok = all(status_report[k] for k in ["mongo", "redis", "celery", "disk"])
    return {
        "status": "ok" if all_ok else "degraded",
        "components": status_report
    }
