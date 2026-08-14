import os
import re
from typing import Dict, Optional, Sequence, Tuple

import pandas as pd
# pyrefly: ignore [missing-import]
import pdfplumber


SUPPORTED_BANKS = ("BCA", "BRI", "BNI", "MANDIRI", "BSI", "BTN")

# Only issuer-specific markers are used here. Generic transaction text such as
# "transfer ke Bank BCA" must not make a BRI statement look like a BCA one.
_BANK_SIGNATURES: Dict[str, Sequence[Tuple[str, int]]] = {
    "BCA": (
        (r"\bPT\s+BANK\s+CENTRAL\s+ASIA\b", 12),
        (r"\bBANK\s+CENTRAL\s+ASIA\b", 10),
        (r"\bWWW\.BCA\.CO\.ID\b", 8),
        (r"\bHALO\s+BCA\b", 7),
        (r"\bREKENING\s+TAHAPAN\b", 6),
        (r"\bKLIKBCA\b", 6),
        (r"\bBCA\s+BERHAK\b", 7),
        (r"\bM-BCA\b", 6),
    ),
    "BRI": (
        (r"\bPT\s+BANK\s+RAKYAT\s+INDONESIA\b", 12),
        (r"\bBANK\s+RAKYAT\s+INDONESIA\b", 10),
        (r"\bCREATED\s+BY\s+BRIMO\b", 9),
        (r"\bBANK\s+BRI\s+BUSINESS\s+UNIT\b", 8),
        (r"\bBRIMO\b", 6),
        (r"\bBANKBRI\.CO\.ID\b", 7),
    ),
    "BNI": (
        (r"\bPT\s+BANK\s+NEGARA\s+INDONESIA\b", 12),
        (r"\bBANK\s+NEGARA\s+INDONESIA\b", 10),
        (r"\bBNI\s+DIRECT\b", 8),
        (r"\bBNI\s+INTERNET\s+BANKING\b", 8),
        (r"\bBNI\s+CALL\b", 7),
        (r"\bBNI\.CO\.ID\b", 7),
    ),
    "MANDIRI": (
        (r"\bPT\s+BANK\s+MANDIRI\b", 12),
        (r"\bE-?STATEMENT.{0,100}\bBANK\s+MANDIRI\b", 10),
        (r"\bGENERATED\s+BY.{0,40}\bBANK\s+MANDIRI\b", 9),
        (r"\bMANDIRI\s+CALL\b", 7),
        (r"\bLIVIN['\u2019]?\s+(?:BY\s+)?MANDIRI\b", 7),
        (r"\bBANKMANDIRI\.CO\.ID\b", 7),
    ),
    "BSI": (
        (r"\bPT\s+BANK\s+SYARIAH\s+INDONESIA\b", 12),
        (r"\bBANK\s+SYARIAH\s+INDONESIA\b", 10),
        (r"\bBYOND\s+BY\s+BSI\b", 8),
        (r"\bBSI\s+MOBILE\b", 7),
        (r"\bBSI\s+CALL\b", 7),
        (r"\bBANKBSI\.CO\.ID\b", 7),
    ),
    "BTN": (
        (r"\bPT\s+BANK\s+TABUNGAN\s+NEGARA\b", 12),
        (r"\bBANK\s+TABUNGAN\s+NEGARA\b", 10),
        (r"\bBTN\s+MOBILE\b", 7),
        (r"\bBTN\s+CALL\b", 7),
        (r"\bBTN\.CO\.ID\b", 7),
    ),
}


def normalize_bank_name(bank_name: str) -> Optional[str]:
    normalized = re.sub(r"\s+", " ", (bank_name or "").strip()).upper()
    aliases = {
        "BANK BCA": "BCA",
        "BANK BRI": "BRI",
        "BANK BNI": "BNI",
        "BANK MANDIRI": "MANDIRI",
        "BANK BSI": "BSI",
        "BANK BTN": "BTN",
    }
    normalized = aliases.get(normalized, normalized)
    return normalized if normalized in SUPPORTED_BANKS else None


def detect_bank_from_text(text: str) -> Optional[str]:
    normalized_text = re.sub(r"\s+", " ", text or "").upper()
    if not normalized_text:
        return None

    scores = {}
    for bank, signatures in _BANK_SIGNATURES.items():
        score = 0
        for pattern, weight in signatures:
            occurrence_count = len(
                re.findall(pattern, normalized_text, re.IGNORECASE | re.DOTALL)
            )
            # Issuer headers/footers commonly repeat on every page. Cap the
            # contribution so repetition helps without dominating everything.
            score += min(occurrence_count, 3) * weight
        scores[bank] = score
    highest_score = max(scores.values(), default=0)
    winners = [bank for bank, score in scores.items() if score == highest_score]

    # A weak or ambiguous result is unsafe for upload validation.
    if highest_score < 6 or len(winners) != 1:
        return None
    return winners[0]


def _extract_pdf_text(file_path: str, password: str = None) -> str:
    with pdfplumber.open(file_path, password=password) as pdf:
        return "\n".join(page.extract_text() or "" for page in pdf.pages)


def _extract_spreadsheet_text(file_path: str, extension: str) -> str:
    if extension == ".csv":
        frame = pd.read_csv(file_path, header=None, dtype=str)
    else:
        frame = pd.read_excel(file_path, header=None, dtype=str)
    return "\n".join(
        str(value)
        for value in frame.fillna("").to_numpy().flatten()
        if str(value).strip()
    )


def detect_statement_bank(file_path: str, password: str = None) -> Optional[str]:
    _, extension = os.path.splitext(file_path)
    extension = extension.lower()

    if extension == ".pdf":
        text = _extract_pdf_text(file_path, password=password)
    elif extension in (".xlsx", ".xls", ".csv"):
        text = _extract_spreadsheet_text(file_path, extension)
    else:
        return None

    return detect_bank_from_text(text)
