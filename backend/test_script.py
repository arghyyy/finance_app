import asyncio
from httpx import AsyncClient
from database import SessionLocal
from model.user import User
from router.statements import get_transactions

# Simulate API call
db = SessionLocal()
user = db.query(User).filter(User.email == "demo@nexus.com").first()
try:
    res = get_transactions(account_id="9a0b780e-bb45-490a-967d-ce7ad0497ecc", db=db, current_user=user)
    print("Success:", len(res))
except Exception as e:
    import traceback
    traceback.print_exc()
db.close()
