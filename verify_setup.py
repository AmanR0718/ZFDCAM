#!/usr/bin/env python3
"""
Verify Zambian Farmer System Setup
Run this script to check if everything is properly configured.
"""
import os
import sys
from pathlib import Path

def check_color(passed: bool) -> str:
    """Return colored status"""
    return "✅ PASS" if passed else "❌ FAIL"

def check_packages():
    """Check if required packages are installed"""
    print("\n📦 Checking Python Packages...")
    print("-" * 60)
    
    packages = {
        "fastapi": "FastAPI framework",
        "uvicorn": "ASGI server",
        "motor": "MongoDB async driver",
        "reportlab": "PDF generation",
        "qrcode": "QR code generation",
        "PIL": "Image processing (Pillow)",
    }
    
    results = {}
    for package, description in packages.items():
        try:
            if package == "PIL":
                __import__("PIL")
            else:
                __import__(package)
            print(f"{check_color(True)} {package:15} - {description}")
            results[package] = True
        except ImportError:
            print(f"{check_color(False)} {package:15} - {description} (MISSING!)")
            results[package] = False
    
    return all(results.values())

def check_directories():
    """Check if required directories exist"""
    print("\n📁 Checking Directory Structure...")
    print("-" * 60)
    
    base_dir = Path("uploads")
    required_dirs = [
        base_dir,
        base_dir / "photos",
        base_dir / "documents",
        base_dir / "idcards",
        base_dir / "qr",
    ]
    
    all_exist = True
    for directory in required_dirs:
        exists = directory.exists()
        all_exist = all_exist and exists
        print(f"{check_color(exists)} {str(directory):30} {'EXISTS' if exists else 'MISSING'}")
        
        if not exists:
            print(f"   → Creating: {directory}")
            directory.mkdir(parents=True, exist_ok=True)
    
    return True  # Always return True since we create missing dirs

def check_routes():
    """Check if route files exist"""
    print("\n🛣️  Checking Route Files...")
    print("-" * 60)
    
    route_files = [
        "app/routes/auth.py",
        "app/routes/farmers.py",
        "app/routes/uploads.py",
        "app/routes/farmer_photos.py",
        "app/routes/farmer_idcards.py",
        "app/routes/farmers_qr.py",
        "app/routes/users.py",
        "app/routes/health.py",
        "app/routes/sync.py",
    ]
    
    all_exist = True
    for route_file in route_files:
        exists = Path(route_file).exists()
        all_exist = all_exist and exists
        status = "EXISTS" if exists else "MISSING"
        print(f"{check_color(exists)} {route_file:40} {status}")
    
    return all_exist

def check_services():
    """Check if service files exist"""
    print("\n⚙️  Checking Service Files...")
    print("-" * 60)
    
    service_files = [
        "app/services/farmer_service.py",
        "app/services/photo_service.py",
        "app/services/idcard_service.py",
    ]
    
    all_exist = True
    for service_file in service_files:
        exists = Path(service_file).exists()
        all_exist = all_exist and exists
        status = "EXISTS" if exists else "MISSING (Optional)"
        print(f"{check_color(exists)} {service_file:40} {status}")
    
    return True  # Services are optional

def check_tasks():
    """Check if task files exist"""
    print("\n📋 Checking Task Files...")
    print("-" * 60)
    
    task_files = [
        "app/tasks/id_card_task.py",
    ]
    
    all_exist = True
    for task_file in task_files:
        exists = Path(task_file).exists()
        all_exist = all_exist and exists
        status = "EXISTS" if exists else "NEEDS CREATION"
        print(f"{check_color(exists)} {task_file:40} {status}")
    
    return all_exist

def check_permissions():
    """Check if uploads directory is writable"""
    print("\n🔐 Checking Permissions...")
    print("-" * 60)
    
    upload_dir = Path("uploads")
    
    if not upload_dir.exists():
        print(f"⚠️  Upload directory doesn't exist yet")
        return False
    
    # Try to create a test file
    test_file = upload_dir / ".write_test"
    try:
        test_file.write_text("test")
        test_file.unlink()
        print(f"{check_color(True)} Upload directory is writable")
        return True
    except Exception as e:
        print(f"{check_color(False)} Cannot write to uploads directory: {e}")
        return False

def test_imports():
    """Test if critical imports work"""
    print("\n🧪 Testing Critical Imports...")
    print("-" * 60)
    
    tests = {
        "FastAPI": lambda: __import__("fastapi"),
        "Motor (MongoDB)": lambda: __import__("motor.motor_asyncio"),
        "ReportLab": lambda: __import__("reportlab.pdfgen.canvas"),
        "QRCode": lambda: __import__("qrcode"),
        "PIL": lambda: __import__("PIL.Image"),
    }
    
    all_passed = True
    for name, test_func in tests.items():
        try:
            test_func()
            print(f"{check_color(True)} {name:20} imports successfully")
        except Exception as e:
            print(f"{check_color(False)} {name:20} import failed: {e}")
            all_passed = False
    
    return all_passed

def print_summary(results: dict):
    """Print summary of all checks"""
    print("\n" + "=" * 60)
    print("📊 SUMMARY")
    print("=" * 60)
    
    for check_name, passed in results.items():
        print(f"{check_color(passed)} {check_name}")
    
    all_passed = all(results.values())
    
    print("\n" + "=" * 60)
    if all_passed:
        print("🎉 ALL CHECKS PASSED!")
        print("=" * 60)
        print("\n✅ Your system is ready to run!")
        print("\nNext steps:")
        print("  1. Start backend: uvicorn app.main:app --reload")
        print("  2. Start frontend: cd frontend && npm run dev")
        print("  3. Open browser: http://localhost:5173")
    else:
        print("⚠️  SOME CHECKS FAILED")
        print("=" * 60)
        print("\nPlease fix the issues above and run this script again.")
        print("\nMissing packages? Install with:")
        print("  pip install reportlab qrcode[pil] Pillow")

def main():
    """Run all checks"""
    print("=" * 60)
    print("🌾 Zambian Farmer System - Setup Verification")
    print("=" * 60)
    
    results = {
        "Python Packages": check_packages(),
        "Directory Structure": check_directories(),
        "Route Files": check_routes(),
        "Service Files": check_services(),
        "Task Files": check_tasks(),
        "File Permissions": check_permissions(),
        "Import Tests": test_imports(),
    }
    
    print_summary(results)
    
    return 0 if all(results.values()) else 1

if __name__ == "__main__":
    sys.exit(main())