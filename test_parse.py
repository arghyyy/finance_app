import sys
from backend.service.statement_processing.models import Transaction

try:
    tx = Transaction(
        date="01/01/2026",
        description="test",
        type="CREDIT",
        amount=100.0,
        category=None,
        raw_text="test raw"
    )
    print("Model init success")
    tx.description += " added"
    tx.raw_text += " added"
    print("Model modify success")
except Exception as e:
    print(f"Error: {e}")
