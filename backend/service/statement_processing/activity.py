import re
from typing import List
from datetime import datetime, date
from .models import Transaction

class TransactionActivityAnalyzer:
    def analyze_income_gaps(self, transactions: List[Transaction]) -> int:
        """
        Calculates the maximum number of consecutive days without a CREDIT transaction.
        Returns the max gap in days. Returns 30 if there is 0 or 1 income transaction.
        """
        credit_dates = []
        for tx in transactions:
            if tx.type == "CREDIT" or tx.category in ["Income", "Transfer In / Refund"]:
                parsed_date = self._parse_date(tx.date.strip())
                if parsed_date:
                    credit_dates.append(parsed_date)
                    
        if len(credit_dates) <= 1:
            return 30 # Default max gap if no/single income is found
            
        credit_dates.sort()
        
        max_gap = 0
        for i in range(1, len(credit_dates)):
            gap = (credit_dates[i] - credit_dates[i-1]).days
            if gap > max_gap:
                max_gap = gap
                
        return max_gap

    def _parse_date(self, date_str: str) -> date:
        date_str = date_str.replace('-', '/')
        
        # format: dd/mm
        if re.match(r'^\d{2}/\d{2}$', date_str):
            try:
                return datetime.strptime(date_str + "/2026", "%d/%m/%Y").date()
            except ValueError:
                pass
                
        # format: dd/mm/yy
        elif re.match(r'^\d{2}/\d{2}/\d{2}$', date_str):
            try:
                return datetime.strptime(date_str, "%d/%m/%y").date()
            except ValueError:
                pass
                
        # format: dd/mm/yyyy
        elif re.match(r'^\d{2}/\d{2}/\d{4}$', date_str):
            try:
                return datetime.strptime(date_str, "%d/%m/%Y").date()
            except ValueError:
                pass
                
        # format: dd MMM yyyy (e.g. 01 Jun 2026)
        elif re.match(r'^\d{2}\s+[A-Za-z]{3}\s+\d{4}$', date_str):
            month_map = {
                "Jan":"Jan", "Feb":"Feb", "Mar":"Mar", "Apr":"Apr", "Mei":"May", 
                "May":"May", "Jun":"Jun", "Jul":"Jul", "Agu":"Aug", "Aug":"Aug", 
                "Sep":"Sep", "Okt":"Oct", "Oct":"Oct", "Nov":"Nov", "Des":"Dec", "Dec":"Dec"
            }
            parts = date_str.split()
            if len(parts) == 3:
                eng_month = month_map.get(parts[1][:3].capitalize(), "Jan")
                try:
                    return datetime.strptime(f"{parts[0]} {eng_month} {parts[2]}", "%d %b %Y").date()
                except ValueError:
                    pass
                    
        return None
