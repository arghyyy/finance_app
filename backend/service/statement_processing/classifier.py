from typing import List
from .models import Transaction

class HybridPersonaClassifier:
    EMPLOYEE_KEYWORDS = [
        "payroll", "gaji", "salary", "thr", "tunjangan", "bonus", 
        "honor", "insentif", "restitusi", "stipend","suzuki finance indonesia"
    ]
    CREATOR_KEYWORDS = [
        "tiktok", "meta", "threads", "adsense", "endorse", "collab", 
        "youtube", "affiliate", "shopee affiliate", "content", "sponsor", "instagram"
    ]
    # Removed generic 'pt ' and 'cv ' since receiving funds from a corporate entity does not make the user a Business Owner
    BUSINESS_KEYWORDS = [
        "qris", "midtrans", "xendit", "merchant", "edc", "settlement", 
        "toko", "warung", "store", "inv/", "invoice", "tokopedia merchant", "shopee seller", "drop dana"
    ]
    FREELANCE_KEYWORDS = [
        "freelance", "project", "client", "jasa", "consult", "fee", "pembayaran", "payment", "upwork", "fiverr"
    ]

    def classify(self, transactions: List[Transaction], max_income_gap: int = -1) -> str:
        # Filter incoming credit transactions
        credit_txs = [tx for tx in transactions if tx.type == "CREDIT" or tx.category in ["Income", "Transfer In / Refund"]]
        
        has_employee = False
        has_creator = False
        has_business = False
        has_freelancer = False
        
        business_count = 0
        misc_transfer_count = 0
        
        for tx in credit_txs:
            desc_lower = tx.description.lower()
            
            # Check Employee
            if any(kw in desc_lower for kw in self.EMPLOYEE_KEYWORDS):
                has_employee = True
                continue
                
            # Check Creator (endorse, collab, adsense, affiliate, etc.)
            if any(kw in desc_lower for kw in self.CREATOR_KEYWORDS):
                has_creator = True
                continue
                
            # Check Business (QRIS settlement, payment gateway, merchant store)
            if any(kw in desc_lower for kw in self.BUSINESS_KEYWORDS):
                business_count += 1
                continue
                
            # Any other incoming transfer/deposit without formal salary/merchant keywords
            misc_transfer_count += 1
            if any(kw in desc_lower for kw in self.FREELANCE_KEYWORDS):
                has_freelancer = True
            
        if business_count >= 1:
            has_business = True
            
            # Weighting Signal: Weak business signal but massive gap (rare income) -> downgrade to freelancer
            if business_count < 3 and max_income_gap > 15:
                has_business = False
                has_freelancer = True

        # Freelancer / Consultant: receives independent incoming transfers/deposits without formal employee salary
        if not has_employee and not has_business and (misc_transfer_count >= 1 or len(credit_txs) >= 1):
            has_freelancer = True
            
            # Weighting Signal: Highly frequent income (gap <= 3 days) and volume > 10 -> upgrade to Business Owner
            if 0 <= max_income_gap <= 3 and len(credit_txs) > 10:
                has_business = True
                has_freelancer = False
                
        elif has_freelancer:
            # Explicit freelance keyword matched
            pass
        elif (has_business or has_employee):
            # If they have significant independent side income transfers alongside business/salary.
            # 3 is too low (could be friends paying back). Let's use 10+ generic transfers to assume active side hustle.
            if misc_transfer_count >= 10:
                has_freelancer = True
            
        # String Resolution Builder
        personas = []
        if has_business:
            personas.append("Business Owner")
        if has_employee:
            personas.append("Employee")
        if has_freelancer:
            personas.append("Freelancer / Consultant")
        if has_creator:
            personas.append("Content Creator")
            
        if not personas:
            return "Personal Account"
            
        return " + ".join(personas)
