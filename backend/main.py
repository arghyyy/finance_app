# pyrefly: ignore [missing-import]
from fastapi import FastAPI
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from router import auth, users, goals, portfolio, statements, budgets, accounts, emergency_fund, cashflow, dependents
import model  # pyrefly: ignore [unused-import]

# Create all tables (safe — uses IF NOT EXISTS)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Nexus Finance API",
    version="1.0.0",
    docs_url="/docs",
)

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(goals.router)
app.include_router(portfolio.router)
app.include_router(statements.router)
app.include_router(budgets.router)
app.include_router(accounts.router)
app.include_router(emergency_fund.router)
app.include_router(cashflow.router)
app.include_router(dependents.router)


@app.get("/")
def root():
    return {"message": "Nexus Finance API is running"}


@app.get("/health")
def health():
    return {"status": "ok"}
