import unittest
from types import SimpleNamespace
from unittest.mock import MagicMock, call

from router.statements import (
    TransactionSaveRequest,
    bulk_save_transactions,
    delete_all_transactions,
)
from model.statement import Statement as DBStatement
from model.transaction import Transaction as DBTransaction
from model.account import Account


class StatementLifecycleTests(unittest.TestCase):
    def test_bulk_save_marks_statement_uploaded(self):
        db = MagicMock()
        statement = SimpleNamespace(id="statement-1", status="pending")
        account = SimpleNamespace(id="account-1", current_balance=0)
        statement_query = MagicMock()
        account_query = MagicMock()
        statement_query.filter.return_value.first.return_value = statement
        account_query.filter.return_value.first.return_value = account
        db.query.side_effect = [statement_query, account_query]
        payload = TransactionSaveRequest(
            account_id="account-1",
            transactions=[],
            statement_id="statement-1",
        )

        result = bulk_save_transactions(
            payload=payload,
            db=db,
            current_user=SimpleNamespace(id="user-1"),
        )

        self.assertEqual(statement.status, "uploaded")
        self.assertEqual(result["statement_id"], "statement-1")
        self.assertEqual(result["account_id"], "account-1")
        self.assertEqual(result["status"], "uploaded")
        db.commit.assert_called_once()

    def test_bulk_save_creates_account_when_user_has_none(self):
        db = MagicMock()
        statement = SimpleNamespace(id="statement-1", status="pending")
        statement_query = MagicMock()
        account_query = MagicMock()
        statement_query.filter.return_value.first.return_value = statement
        account_query.filter.return_value.first.return_value = None
        db.query.side_effect = [statement_query, account_query]

        def assign_account_id(record):
            if isinstance(record, Account) and record.id is None:
                record.id = "new-account-1"

        db.add.side_effect = assign_account_id
        payload = TransactionSaveRequest(
            account_id=None,
            bank_name="BCA",
            transactions=[],
            statement_id="statement-1",
        )

        result = bulk_save_transactions(
            payload=payload,
            db=db,
            current_user=SimpleNamespace(id="user-1"),
        )

        self.assertEqual(result["account_id"], "new-account-1")
        self.assertEqual(result["status"], "uploaded")
        db.flush.assert_called_once()

    def test_reset_deletes_transactions_and_statements(self):
        db = MagicMock()
        transaction_query = MagicMock()
        statement_query = MagicMock()
        transaction_query.filter.return_value.delete.return_value = 4
        statement_query.filter.return_value.delete.return_value = 2
        db.query.side_effect = [transaction_query, statement_query]

        result = delete_all_transactions(
            db=db,
            current_user=SimpleNamespace(id="user-1"),
        )

        self.assertEqual(db.query.call_args_list, [call(DBTransaction), call(DBStatement)])
        self.assertEqual(result["deleted_transactions"], 4)
        self.assertEqual(result["deleted_statements"], 2)
        db.commit.assert_called_once()


if __name__ == "__main__":
    unittest.main()
