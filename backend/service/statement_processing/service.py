from typing import Dict, Any

from .parsers import ParserFactory
from .categorizer import TransactionCategorizer
from .classifier import HybridPersonaClassifier
from .activity import TransactionActivityAnalyzer

def process_and_classify_statement(file_path: str, password: str = None) -> Dict[str, Any]:
    """
    Master function that coordinates the entire flow from extraction to 
    final hybrid persona classification.
    """
    # Phase 2: Extensible Statement Parsers
    # This will raise a ValueError if the file format is not supported
    parser = ParserFactory.get_parser(file_path)
    transactions_raw = parser.parse(file_path, password=password)
    
    # Filter out initial balance (saldo awal)
    skip_keywords = ["saldo awal", "initial balance", "ledger balance", "previous balance", "saldo sebelumnya"]
    transactions = []
    for tx in transactions_raw:
        if not any(kw in tx.description.lower() for kw in skip_keywords):
            transactions.append(tx)

    
    # Phase 3: Transaction Categorization Engine
    categorizer = TransactionCategorizer()
    categorized_transactions = categorizer.categorize(transactions)
    # Phase 4: Activity Analysis
    activity_analyzer = TransactionActivityAnalyzer()
    max_income_gap = activity_analyzer.analyze_income_gaps(categorized_transactions)
    
    # Phase 5: Hybrid Persona Classifier
    classifier = HybridPersonaClassifier()
    persona = classifier.classify(categorized_transactions, max_income_gap=max_income_gap)
    
    # Convert Pydantic models to dicts for output
    tx_dicts = [tx.model_dump() for tx in categorized_transactions]
    
    # Phase 5: Category Statistical Analysis
    category_stats = {}
    for tx in categorized_transactions:
        cat = tx.category or "Uncategorized"
        if cat not in category_stats:
            category_stats[cat] = {"frequency": 0, "total_amount": 0.0}
        category_stats[cat]["frequency"] += 1
        category_stats[cat]["total_amount"] += tx.amount
        
    print("\n" + "="*50)
    print(f"📊 CATEGORY STATISTICAL ANALYSIS (Persona: {persona})")
    print("="*50)
    for cat, data in category_stats.items():
        freq = data["frequency"]
        avg_amount = data["total_amount"] / freq
        data["average_amount"] = avg_amount
        print(f"🔹 {cat:<22} | Freq: {freq:<3} | Avg: Rp {avg_amount:,.2f}")
    print("="*50 + "\n")
    # Phase 6: Payday / Salary Date Detection
    payday_date = None
    salary_keywords = ["payroll", "gaji", "salary", "thr", "tunjangan", "bonus", "honor", "insentif", "fee", "pembayaran"]
    salary_txs = []
    
    for tx in categorized_transactions:
        if tx.type == "CREDIT" or tx.category in ["Income", "Transfer In / Refund"]:
            desc_lower = tx.description.lower()
            if any(kw in desc_lower for kw in salary_keywords):
                salary_txs.append(tx)
                
    if salary_txs:
        # Jika ada beberapa, kita ambil yang nominalnya paling besar sebagai gaji utama bulanan
        main_salary_tx = max(salary_txs, key=lambda x: x.amount)
        payday_date = main_salary_tx.date
        print(f"💰 PAYDAY DETECTED: Tanggal Gaji Masuk pada {payday_date} (Rp {main_salary_tx.amount:,.2f}) - '{main_salary_tx.description}'\n")

    return {
        "status": "success",
        "file_path": file_path,
        "parsed_transactions_count": len(transactions),
        "persona": persona,
        "payday_date": payday_date,
        "category_stats": category_stats,
        "transactions": tx_dicts
    }
