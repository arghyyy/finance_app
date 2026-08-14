from typing import List
from .models import Transaction

class TransactionCategorizer:
    # Priority order: Specific merchant/service categories FIRST, general transfers LAST
    CATEGORIES = {
        "Income": [
            "payroll", "gaji", "salary", "upah", "honor", "tiktok", "adsense", 
            "dividend", "inflow", "pemasukan", "bonus", "thr"
        ],
        "Food & Groceries": [
            "indomaret", "alfamart", "gofood", "shopeefood", "superindo", "mcdonalds", 
            "kfc", "resto", "warung", "kopi", "cafe", "dimsum", "ayam", "bakery", 
            "bistro", "food", "dapur", "culinary", "mart", "tacobell", "ombe kofie", "mcd",
            "sushi", "yoshinoya", "pizzahut", "chatime", "latte", "matcha"
        ],
        "Shopping & Retail": [
            "qris", "pembayaran qr", "ftqrs", "qrs", "shopee", "tokopedia", "lazada", 
            "blibli", "zalora", "merchant", "pay", "belanja", "matahari", "uniqlo", 
            "h&m", "miniso", "ikea", "ace hardware", "guardian", "watsons", "sociolla", 
            "petshop", "shop", "store", "fashion", "boutique", "farmers market"
        ],
        "Subscriptions": [
            "netflix", "spotify", "youtube", "zoom", "apple music", "capcut", "disney+", 
            "hbo max", "patreon", "adobe", "google", "viu"
        ],
        "Utilities": [
            "pln", "pdam", "telkomsel", "indihome", "token", "pajak", "pulsa", 
            "listrik", "air", "xl", "tri", "smartfren", "bpjs"
        ],
        "Transport": [
            "gojek", "grab", "maxim", "spbu", "pertamina", "toll", "parkir", "kai", 
            "tiket", "flight", "shell", "bbm"
        ],
        "E-Wallet": [
            "topup", "gopay", "ovo", "dana", "shopeepay", "flip", "e-money", 
            "linkaja", "ftfva", "va", "virtual account"
        ],
        "Transfer In / Refund": [
            "koreksi", "refund", "kembali", "transfer dari", "dari", "bi-fast cr", "bif cr"
        ],
        "Pencairan Klaim Asuransi": [
            "manulife", "asuransi", "prudential", "allianz", "axa", "bni life", "klaim"
        ],
        "Transfer to Others": [
            "transfer ke", "trsf", "trf", "trn", "db debit", "db", "bi-fast dr", 
            "bif dr", "bri", "bni", "mandiri", "bca", "cimb", "bsi", "fliptech", 
            "domestik", "transfer"
        ],
        "fee": [
            "biaya admin", "biaya adm", "bunga", "pajak bunga"
        ]
    }

    def categorize(self, transactions: List[Transaction]) -> List[Transaction]:
        for tx in transactions:
            desc_lower = tx.description.lower()
            assigned_category = "Uncategorized"
            
            if tx.type == "CREDIT":
                assigned_category = "Transfer In / Refund"
                for cat in ["Income", "Pencairan Klaim Asuransi", "Transfer In / Refund"]:
                    if any(kw in desc_lower for kw in self.CATEGORIES[cat]):
                        assigned_category = cat
                        break
                
                # Rule: Any incoming transaction >= 5,000,000 is considered Income
                if tx.amount >= 5000000:
                    assigned_category = "Income"
            else:
                # Substring matching for expense categories
                for category, keywords in self.CATEGORIES.items():
                    if category in ["Income", "Transfer In / Refund", "Pencairan Klaim Asuransi"]:
                        continue # Skip income categories for DEBIT
                    
                    if any(keyword in desc_lower for keyword in keywords):
                        assigned_category = category
                        break
                
                # Default fallback for DEBIT transactions if still uncategorized
                if assigned_category == "Uncategorized":
                    assigned_category = "Transfer to Others"
            
            tx.category = assigned_category
            
        return transactions
