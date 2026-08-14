/* ─── User & Auth ─── */
export interface User {
  id: string;
  email: string;
  full_name: string;
  age: number;
  risk_profile?: string | null;
  occupation_type?: string | null;
  onboarding_completed?: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

/* ─── Dependents ─── */
export interface Dependent {
  id: string;
  user_id: string;
  name: string;
  relation: string;
  birth_year?: number | null;
}

/* ─── Financial Goals ─── */
export interface FinancialGoal {
  id: string;
  user_id: string;
  target_name: string;
  target_amount: number;
  current_savings: number;
  timeline_years: number;
  priority: number;
}

/* ─── Bank Statements ─── */
export interface BankStatement {
  id: string;
  user_id: string;
  bank_name: string;
  file_path?: string | null;
  uploaded_at: string;
  statement_period?: string | null;
  parse_status: string;
  raw_data?: any;
}

/* ─── Transactions ─── */
export interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  transaction_date: string;
  confidence?: number;
}

/* ─── Cashflow ─── */
export interface MonthlyCashflow {
  id: string;
  user_id: string;
  month: string;
  total_income: number;
  total_expense: number;
  fixed_costs: number;
  discretionary: number;
  savings_rate: number;
}

/* ─── Emergency Fund ─── */
export interface EmergencyFund {
  id: string;
  user_id: string;
  target_months: number;
  target_amount: number;
  current_amount: number;
  instrument_type: string;
  monthly_top_up: number;
  completed: boolean;
}

/* ─── Investment ─── */
export interface PortfolioItem {
  id: string;
  asset_class: string;
  instrument_name: string;
  allocation_pct: number;
  current_value: number;
  cost_basis: number;
}

/* ─── Dashboard ─── */
export interface DashboardData {
  financial_health_score: number;
  monthly_income: number;
  monthly_expense: number;
  fixed_costs: number;
  savings_rate: number;
  cashflow_allocation: {
    fixed_costs_pct: number;
    emergency_fund_pct: number;
    goals_pct: number;
    investment_pct: number;
    discretionary_pct: number;
  };
  emergency_fund?: EmergencyFund | null;
  goals: FinancialGoal[];
  portfolios: PortfolioItem[];
  recent_transactions: Transaction[];
}

/* ─── Research ─── */
export interface NewsArticle {
  id: string;
  title: string;
  source: string;
  category: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  significance: 'breaking' | 'hot' | 'regular';
  published_at: string;
  summary: string;
}

export interface AssetCompareData {
  symbol: string;
  name: string;
  price: number;
  change_pct: number;
  asset_type: string;
}

/* ─── Review Transactions ─── */
export interface PersonaResult {
  type: string;
  confidence: number;
  reasoning: string;
}

export interface StatementReviewData {
  bank: string;
  period: string;
  persona: PersonaResult;
  income: number;
  expenses: number;
  transactions: Transaction[];
}
