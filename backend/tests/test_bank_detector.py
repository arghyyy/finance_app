import unittest

from service.statement_processing.bank_detector import (
    detect_bank_from_text,
    normalize_bank_name,
)


class BankDetectorTests(unittest.TestCase):
    def test_detects_all_supported_banks(self):
        samples = {
            "BCA": "PT Bank Central Asia Tbk REKENING TAHAPAN Halo BCA",
            "BRI": "Created By BRIMO - PT Bank Rakyat Indonesia (Persero) Tbk",
            "BNI": "PT Bank Negara Indonesia (Persero) Tbk BNI Direct",
            "MANDIRI": "PT Bank Mandiri (Persero) Tbk Mandiri Call",
            "BSI": "PT Bank Syariah Indonesia Tbk BSI Mobile",
            "BTN": "PT Bank Tabungan Negara (Persero) Tbk BTN Mobile",
        }

        for expected_bank, text in samples.items():
            with self.subTest(bank=expected_bank):
                self.assertEqual(detect_bank_from_text(text), expected_bank)

    def test_transaction_counterparty_does_not_override_issuer(self):
        bri_statement = """
            Created By BRIMO
            PT Bank Rakyat Indonesia (Persero) Tbk
            Transfer BI-Fast dari BANK MANDIRI (PERSERO), PT
            Transfer ke Bank BCA
        """
        self.assertEqual(detect_bank_from_text(bri_statement), "BRI")

    def test_repeated_issuer_marker_beats_counterparty_legal_name(self):
        bca_statement = """
            REKENING TAHAPAN BCA berhak melakukan koreksi
            Transfer dari PT Bank Mandiri (Persero), Tbk
            REKENING TAHAPAN BCA berhak melakukan koreksi
        """
        self.assertEqual(detect_bank_from_text(bca_statement), "BCA")

    def test_rejects_unknown_or_ambiguous_text(self):
        self.assertIsNone(detect_bank_from_text("Laporan transaksi bulanan"))
        self.assertIsNone(
            detect_bank_from_text(
                "PT Bank Central Asia PT Bank Rakyat Indonesia"
            )
        )

    def test_normalizes_supported_bank_names(self):
        self.assertEqual(normalize_bank_name("Mandiri"), "MANDIRI")
        self.assertEqual(normalize_bank_name("bank bca"), "BCA")
        self.assertIsNone(normalize_bank_name("Danamon"))


if __name__ == "__main__":
    unittest.main()
