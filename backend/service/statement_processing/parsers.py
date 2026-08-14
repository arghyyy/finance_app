from abc import ABC, abstractmethod
from typing import List, Type, Dict
import pandas as pd
# pyrefly: ignore [missing-import]
import pdfplumber
import os
import re

from .models import Transaction

def parse_amount(val_str: str) -> float:
    if not val_str:
        return 0.0
    val_str = val_str.strip().replace('+', '').replace('-', '')
    if not val_str or val_str in ('0', '0.00', '0,00'):
        return 0.0
    
    # Handle BNI Corporate PDF font duplication bug (where chars are doubled: 2200,,000000..0000 -> 200000.00)
    if ',,' in val_str or '..' in val_str:
        val_str = re.sub(r'(.)\1', r'\1', val_str)
        val_str = re.sub(r',+', ',', val_str)
        val_str = re.sub(r'\.+', '.', val_str)
    
    # Handle European/Indonesian format: 125.895.763,25 or 120.000,00
    if '.' in val_str and ',' in val_str:
        if val_str.rfind(',') > val_str.rfind('.'):
            val_str = val_str.replace('.', '').replace(',', '.')
        else:
            val_str = val_str.replace(',', '')
    elif ',' in val_str:
        parts = val_str.split(',')
        if len(parts) == 2 and len(parts[1]) == 2:
            val_str = parts[0].replace('.', '') + '.' + parts[1]
        else:
            val_str = val_str.replace(',', '')
    elif '.' in val_str:
        parts = val_str.split('.')
        if len(parts) > 2:
            val_str = "".join(parts[:-1]) + "." + parts[-1]
        elif len(parts) == 2:
            if len(parts[1]) == 3:
                val_str = "".join(parts)
            else:
                pass
    try:
        return float(val_str)
    except ValueError:
        return 0.0

class StatementParser(ABC):
    @abstractmethod
    def parse(self, file_path: str, password: str = None) -> List[Transaction]:
        pass

class ExcelStatementParser(StatementParser):
    def parse(self, file_path: str, password: str = None) -> List[Transaction]:
        df = pd.read_excel(file_path)
        transactions = []
        for _, row in df.iterrows():
            transactions.append(
                Transaction(
                    date=str(row.get('Date', '')),
                    description=str(row.get('Description', '')),
                    type=str(row.get('Type', '')).upper(),
                    amount=float(row.get('Amount', 0.0)),
                    category=None
                )
            )
        return transactions

class PdfStatementParser(StatementParser):
    def parse(self, file_path: str, password: str = None) -> List[Transaction]:
        transactions = []
        with pdfplumber.open(file_path, password=password) as pdf:
            current_date = "01/01/2026"
            
            header_noise_regex = re.compile(
                r'^(halaman\s+\d+|page\s+\d+|dicetak\s+pada|periode\s*:|laporan\s+mutasi|laporan\s+transaksi|e-statement|'
                r'no\s+tanggal\s+keterangan|no\s+date\s+remarks|tanggal\s+transaksi\s+uraian|'
                r'pt\s+bank\s+mandiri|mandiri\s+call|serta\s+merupakan|terbilang\s+/|biaya\s+materai|'
                r'salinan\s+rekening|rekening\s+tahapan\s+kcp|informasi\s+rekening|'
                r'catatan:|saldo\s+awal|saldo\s+akhir|posting date|effective date|account information|account statement|account no|account type|ledger balance|ending balance|total debet|total credit)'
                r'|(apabila\s+terdapat|apabila\s+nasabah|bca\s+berhak|koreksi\s+apabila|nasabah\s+dianggap|karena\s+alasan\s+apapun|dengan\s+ini\s+nasabah)',
                re.IGNORECASE
            )
            
            for page in pdf.pages:
                text = page.extract_text()
                if not text:
                    continue
                
                lines = text.split('\n')
                pending_desc = []
                
                for line in lines:
                    line = line.strip()
                    if not line:
                        continue

                    if header_noise_regex.search(line):
                        pending_desc = []
                        continue

                    # Update date if present in line
                    dt_search = re.search(r'(\d{2}[/-]\d{2}(?:[/-]\d{2,4})?|\d{2}\s+[A-Za-z]{3}(?:\s+\d{2,4})?)', line)
                    if dt_search:
                        current_date = dt_search.group(1)

                    # 1. BNI/BRI 3-Column Amount Pattern: Date [Time] Desc [Teller] Debit Credit Balance
                    bni_3col = re.search(r'^(\d{2}[/-]\d{2}[/-]\d{2,4})\s+(.+?)\s+([\d.,]{3,})\s+([\d.,]{3,})\s+([\d.,]{3,})$', line)
                    if bni_3col:
                        date_str = bni_3col.group(1)
                        desc_str = bni_3col.group(2)
                        debit_val = parse_amount(bni_3col.group(3))
                        credit_val = parse_amount(bni_3col.group(4))
                        bal_val = parse_amount(bni_3col.group(5))

                        if credit_val > 0 and debit_val == 0:
                            tx_type = 'CREDIT'
                            amt_val = credit_val
                        elif debit_val > 0:
                            tx_type = 'DEBIT'
                            amt_val = debit_val
                        else:
                            continue

                        full_desc = " ".join(pending_desc + [desc_str])
                        transactions.append(Transaction(
                            date=date_str,
                            description=full_desc.strip(),
                            type=tx_type,
                            amount=amt_val,
                            category=None,
                            raw_text=line,
                            balance=bal_val
                        ))
                        pending_desc = []
                        continue

                    # 2. BNI Corporate / BNI Direct Pattern: e.g. 25/02/2025 09.12.54 ... 553384 440000,,000000..0000 D 491,583,013.00
                    # Supports D (Debet) and K (Kredit) as well as CR, DB, C
                    bni_corp = re.search(r'^(\d{2}[/-]\d{2}[/-]\d{2,4})\s+[\d.]+\s+\d{2}[/-]\d{2}[/-]\d{2,4}\s+[\d.]+\s+\w+\s+([\d.,]+)\s+([DKCRB]+)\s+([\d.,]+)$', line, re.IGNORECASE)
                    if bni_corp:
                        date_str = bni_corp.group(1)
                        amt_str = bni_corp.group(2)
                        indicator = bni_corp.group(3).upper()
                        bal_str = bni_corp.group(4)

                        amt_val = parse_amount(amt_str)
                        bal_val = parse_amount(bal_str)
                        tx_type = 'CREDIT' if indicator in ('K', 'CR', 'C') else 'DEBIT'

                        full_desc = " ".join(pending_desc)
                        if not full_desc:
                            full_desc = f"BNI Direct Transaction {date_str}"
                        transactions.append(Transaction(
                            date=date_str,
                            description=full_desc.strip(),
                            type=tx_type,
                            amount=amt_val,
                            category=None,
                            raw_text=line,
                            balance=bal_val
                        ))
                        pending_desc = []
                        continue

                    # Fallback BNI Corp without full date prefix: Desc Amount (D|K|CR|DB) Balance
                    bni_corp_fb = re.search(r'(.+?)\s+([\d.,]{4,})\s+([DKCRB]{1,2})\s+([\d.,]{5,})$', line)
                    if bni_corp_fb and not line.startswith('Total '):
                        desc_str = bni_corp_fb.group(1).strip()
                        amt_str = bni_corp_fb.group(2)
                        indicator = bni_corp_fb.group(3).upper()
                        bal_str = bni_corp_fb.group(4)

                        if indicator in ('D', 'K', 'CR', 'DB', 'C'):
                            amt_val = parse_amount(amt_str)
                            bal_val = parse_amount(bal_str)
                            if amt_val > 0 and bal_val > 0 and len(desc_str) > 2 and not desc_str.replace('.', '').isdigit():
                                tx_type = 'CREDIT' if indicator in ('K', 'CR', 'C') else 'DEBIT'
                                full_desc = " ".join(pending_desc + [desc_str])
                                transactions.append(Transaction(
                                    date=current_date,
                                    description=full_desc.strip(),
                                    type=tx_type,
                                    amount=amt_val,
                                    category=None,
                                    raw_text=line,
                                    balance=bal_val
                                ))
                                pending_desc = []
                                continue

                    # 3. Mandiri Amount line pattern: e.g. 1 +5.760.000,00 6.305.171,24
                    amt_match = re.match(r'^(\d+)\s+(.*?)\s*([+-][\d.,]+)\s+([\d.,]+)$', line)
                    if amt_match:
                        desc_part = amt_match.group(2).strip()
                        amount_str = amt_match.group(3)
                        balance_str = amt_match.group(4)
                        
                        full_desc = " ".join(pending_desc + ([desc_part] if desc_part else []))
                        tx_type = 'CREDIT' if amount_str.startswith('+') else 'DEBIT'
                        amt_val = parse_amount(amount_str)
                        bal_val = parse_amount(balance_str)
                            
                        transactions.append(Transaction(
                            date=current_date,
                            description=full_desc.strip() or "Transaction",
                            type=tx_type,
                            amount=amt_val,
                            category=None,
                            raw_text=line,
                            balance=bal_val
                        ))
                        pending_desc = []
                        continue

                    # 4. Pola Bank BCA Single-Amount
                    bca_match = re.search(r'^(\d{2}[/-]\d{2}(?:[/-]\d{2,4})?)\s+(.+?)\s+([+-]?[\d.,]{3,})\s*(CR|DB|C|D|Cr|Db|K|D)?(?:\s+([\d.,]{4,}))?$', line, re.IGNORECASE)
                    if bca_match:
                        date_str = bca_match.group(1)
                        desc_str = bca_match.group(2)
                        amount_str = bca_match.group(3)
                        indicator = (bca_match.group(4) or "").upper()
                        balance_str = bca_match.group(5)
                        
                        amt_val = parse_amount(amount_str)
                        if amt_val == 0:
                            continue

                        desc_upper = (desc_str + " " + line).upper()
                        if indicator in ('CR', 'C', 'K', 'CREDIT') or amount_str.startswith('+') or ' CR ' in desc_upper or ' TRANSFER DARI ' in desc_upper or ' DARI ' in desc_upper:
                            tx_type = 'CREDIT'
                        else:
                            tx_type = 'DEBIT'
                                
                        bal_val = parse_amount(balance_str) if balance_str else None
                        
                        # Any accumulated text belongs to the PREVIOUS transaction
                        if pending_desc and transactions:
                            extra_desc = " ".join(pending_desc).strip()
                            if extra_desc:
                                transactions[-1].description += f" {extra_desc}"
                                transactions[-1].raw_text += f" {extra_desc}"
                                
                        transactions.append(Transaction(
                            date=date_str,
                            description=desc_str.strip(),
                            type=tx_type,
                            amount=amt_val,
                            category=None,
                            raw_text=line,
                            balance=bal_val
                        ))
                        pending_desc = []
                        continue

                    if len(line) >= 3:
                        pending_desc.append(line)
                        
        def parse_date_for_sort(d_str: str) -> str:
            match = re.search(r'(\d{2})[/-](\d{2})(?:[/-](\d{2,4}))?', d_str)
            if match:
                dd, mm = match.group(1), match.group(2)
                yy = match.group(3) or "9999"
                if len(yy) == 2: yy = "20" + yy
                return f"{yy}{mm}{dd}"
            match2 = re.search(r'(\d{2})\s+([A-Za-z]{3})(?:\s+(\d{2,4}))?', d_str)
            if match2:
                dd, mon_str = match2.group(1), match2.group(2).lower()
                yy = match2.group(3) or "9999"
                if len(yy) == 2: yy = "20" + yy
                months = {"jan":"01", "feb":"02", "mar":"03", "apr":"04", "may":"05", "mei":"05", "jun":"06", "jul":"07", "aug":"08", "sep":"09", "oct":"10", "okt":"10", "nov":"11", "des":"12"}
                mm = months.get(mon_str, "00")
                return f"{yy}{mm}{dd}"
            return d_str

        # Sort transactions chronologically
        transactions.sort(key=lambda tx: parse_date_for_sort(tx.date))
                            
        # Interpolate missing balances
        # 1. Backwards interpolation (for intra-day transactions ending with a balance)
        for i in range(len(transactions) - 2, -1, -1):
            if transactions[i].balance is None and transactions[i+1].balance is not None:
                next_tx = transactions[i+1]
                if next_tx.type == 'CREDIT':
                    transactions[i].balance = round(next_tx.balance - next_tx.amount, 2)
                else:
                    transactions[i].balance = round(next_tx.balance + next_tx.amount, 2)
                    
        # 2. Forwards interpolation (for trailing transactions without a printed balance)
        for i in range(1, len(transactions)):
            if transactions[i].balance is None and transactions[i-1].balance is not None:
                prev_tx = transactions[i-1]
                curr_tx = transactions[i]
                if curr_tx.type == 'CREDIT':
                    transactions[i].balance = round(prev_tx.balance + curr_tx.amount, 2)
                else:
                    transactions[i].balance = round(prev_tx.balance - curr_tx.amount, 2)

        return transactions

class ParserFactory:
    _parsers: Dict[str, Type[StatementParser]] = {
        '.xlsx': ExcelStatementParser,
        '.xls': ExcelStatementParser,
        '.pdf': PdfStatementParser
    }

    @classmethod
    def get_parser(cls, file_path: str) -> StatementParser:
        _, ext = os.path.splitext(file_path)
        parser_class = cls._parsers.get(ext.lower())
        if not parser_class:
            raise ValueError(f"Unsupported file extension: {ext}. Supported formats are: {', '.join(cls._parsers.keys())}")
        return parser_class()
