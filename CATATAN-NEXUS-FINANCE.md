# CATATAN-NEXUS-FINANCE.md

> Backup konteks satu-satu untuk project **Nexus Finance** (`/home/vboxuser/Desktop/finance_app`).
> Dibuat 2026-08-04 dari analisis & diskusi. Versi backup chat, agar konteks tidak hilang
> meski session chat dihapus. Sumber: `analisis-nexus-finance.md`, `memory/2026-08-04.md`, `MEMORY.md`.

---

## 1. Identitas Project

| Item | Nilai |
|---|---|
| Nama app | **Nexus Finance** |
| Lokasi | `/home/vboxuser/Desktop/finance_app` |
| Backend | FastAPI + SQLAlchemy + PostgreSQL (via Docker) |
| Frontend | React (Vite) + Tailwind + recharts |
| Database | PostgreSQL (`finance_app`), port host `5433` |
| API container port | `8001` |
| Frontend dev | Vite `5173` |
| Struktur backend | Layered: `router/` → `service/` → `model/` (SOLID) |
| Catatan | Beda folder dari `project-aplikasi-pencatatan-keuangan/` (di MEMORY) walau fitur mirip |

---

## 2. Status saat analisis (2026-08-04)

**Kesimpulan inti:** fondasi arsitektur backend bagus, tapi **belum ada satu alur pun yang benar-benar terhubung end-to-end**, dan **frontend tidak bisa di-build**.

### 2.1 Blocker #1 — Frontend gagal build (`npm run build`)
```
src/pages/StatementReviewPage.tsx(95,99): Property 'title' does not exist on Lucide icon
src/pages/StatementsPage.tsx(148,32):  Property 'name' does not exist on type 'User'  (harusnya full_name)
src/pages/StatementsPage.tsx(148,44):  Property 'name' does not exist on type 'User'
```
→ `docker compose` akan gagal di stage build frontend.

### 2.2 Blocker #2 — Contract API frontend ↔ backend tidak sinkron
`src/services/api.ts` memanggil endpoint yang **TIDAK ada** di backend:
- `/users/me/dependents` (GET/POST/DELETE)
- `/cashflows` (backend-nya `/api/v1/portfolio/cashflow`)
- `/dashboard`
- `/emergency-fund` (backend-nya `/api/v1/portfolio/emergency-fund`)
- `/investments/portfolios`, `/investments/rebalance`
- `/research/compare`, `/research/news/feed`, `/research/top-stories`

`types.ts` juga beda field dengan backend:
- `target_name`/`timeline_years` vs backend `label`/`target_date`
- `transaction_date` vs `date`
- `AuthTokens {access_token, refresh_token}` vs backend **cuma** `access_token`
  (schema `TokenResponse` tidak punya `refresh_token`)

### 2.3 Blocker #3 — Token key tidak konsisten
- AuthContext simpan `localStorage.access_token` + `refresh_token`.
- Dashboard & StatementsPage baca `localStorage.getItem('token')` → selalu `null` → 401.
- Dashboard & Statements `fetch('http://127.0.0.1:8001/accounts')` **hardcoded** (tidak lewat proxy `/api`).

### 2.4 Blocker #4 — Statement upload TIDAK disimpan ke DB ⚠️
`router/statements.py` → parse & classify → **return JSON**, **tanpa** `db.add(Statement)` / `db.add(Transaction)`.
Model `Statement` & `Transaction` sudah ada tapi tidak pernah dipakai.
Frontend simpan ke `localStorage` (`uploaded_statements`, `user_persona`, `user_goals`, `user_budgets_*`).
→ Data hilang saat refresh; budget/goal/cashflow tidak punya sumber kebenaran.

### 2.5 Blocker #5 — Route & auth tidak konsisten
- `/statements` & `/accounts` tanpa prefix `/api/v1` & tanpa proteksi `get_current_user`.
- `accounts.py` punya fallback **auto-create user demo** (tanpa auth) → bug keamanan.

### 2.6 Blocker #6 — Keamanan dasar belum ada
- JWT secret **hardcoded** di `config.py`.
- CORS `allow_origins=["*"]`.
- Endpoint `/statements` & `/accounts` tidak diautentikasi.

### 2.7 Halaman frontend yang statis/mock (0 API call)
`GoalsPage`, `PortfolioPage`, `InvestmentPage`, `MarketsPage`, `ResearchPage`, `ManualEntryPage`, `SettingsPage` — semuanya data hardcoded/localStorage.
- Dashboard: mock transaction + account dari `localStorage.getItem('token')` (null).
- Goals: murni `localStorage.user_goals`.
- Portfolio: baca `uploaded_statements` dari localStorage.
- Investment & Markets: full hardcoded.
- Statements: upload → simpan ke `localStorage` (tidak ke DB).

---

## 3. Fitur Krusial yang Harusnya Ada Tapi Belum Ada (prioritas)

1. **Keamanan & auth hardening** — env secret, CORS ketat, proteksi semua endpoint, hapus fallback demo user, refresh token nyata.
2. **Persistensi + CRUD transaksi** — tambah/edit/hapus/rekategorisasi/rekonsiliasi dari DB (tulang punggung semua fitur).
3. **Rebalancing engine nyata** — dari `get_holdings()` (sudah kasih `overweight/underweight`) → saran jual/beli + nominal + skenario what-if.
4. **Rekonsiliasi & akurasi saldo akun** — sinkron `current_balance` dari transaksi, deteksi duplikat, verifikasi saldo akhir statement.
5. **Notifikasi & reminder** — budget warning/exceeded (backend sudah hitung tapi tak dikirim), EF target tercapai, goal dekat `target_date`, payday (parser sudah deteksi `payday_date`).
6. **Export & laporan** — CSV/PDF (tombol Export di Dashboard mati).
7. **Testing** — nol test; wajib untuk app yang proses uang orang (unit test `parse_amount`, `categorizer`, `classifier`, `budget_service`; integration upload→parse→simpan).

---

## 4. Fitur Inti dari SPEC yang Belum Dimulai

| Fitur | Status |
|---|---|
| E-Statement Parser & **Job/Persona Classifier** | ✅ backend ada (HybridPersonaClassifier) — hasilnya tidak dipersist/dipakai lanjut |
| **Dynamic Cashflow & Dependency Allocation** | ❌ cuma model `CashflowAllocation`, **tanpa logika hitung/alokasi** |
| Goal-Based Financial Schemes | ⚠️ CRUD goal ada, tapi tidak ada skema alokasi dari surplus |
| **Tactical Investment Recommendation & Rebalancing** | ❌ cuma schema `RebalanceRequest`, tidak ada engine |
| Research/Markets data real | ❌ halaman statis/hardcoded |

---

## 5. Dynamic Cashflow & Dependency Allocation (detail diskusi)

Dua konsep yang saling berkaitan:

**A. Dynamic Cashflow** — hitung otomatis per bulan dari transaksi, lalu bagi ke "bucket" bermakna:
- Income, Expense, **Fixed costs** (wajib/rutin: cicilan, sewa, listrik, langganan, asuransi — tak bisa dipangkas), **Discretionary** (fleksibel: makan di luar, hiburan, belanja), **Savings/surplus**.
- "Dynamic" = berubah otomatis mengikuti data transaksi terbaru, bukan angka statis.

**B. Dependency Allocation** — alokasikan surplus otomatis dengan prioritas berantai; tiap tujuan adalah prasyarat tujuan berikutnya:

```
Pendapatan
   │
   ▼
1. Fixed costs (wajib) ─► kurang → alert dulu
   │
   ▼
2. Emergency fund (3-6 bln) ─► belum penuh → top-up dulu
   │
   ▼
3. Goals prioritas (berdasarkan priority + jarak ke target_date)
   │
   ▼
4. Investasi / rebalancing
   │
   ▼
5. Sisa → discretionary / discretionary saving
```

**Kenapa pembeda:** bukan sekadar "surplus Rp X", tapi menjawab *"berapa yang harus ke EF dulu? goal mana paling mendesak? kalau discretionary dipangkas, berapa bulan lebih cepat DP rumah?"*.

### Implementasi di project (backend dulu, baru frontend)

**Sudah ada:**
- `model/cashflow.py` → tabel `CashflowAllocation` (income/expense/fixed/discretionary/savings per bulan, unique user+month).
- `model/emergency_fund.py` + `get_emergency_fund()` (sudah hitung `estimated_months`).
- `model/goal.py` punya `priority` & `target_date`.
- `categorizer.py` klasifikasi transaksi (Food, Utilities, Transport, dst).

**Belum ada:**
- Logika hitung cashflow dari transaksi.
- Pemetaan kategori → fixed vs discretionary (perlu flag `is_fixed`).
- Dependency engine alokasi surplus.

**Langkah:**
1. `service/cashflow_service.py` — hitung per bulan dari `Transaction`, simpan ke `CashflowAllocation`.
2. `service/allocation_service.py` — dependency engine (urutan bucket seperti diagram).
3. `router/cashflow.py` — `GET /api/v1/cashflows/{month}`, `POST /recalculate`, `PUT /emergency-fund`, `POST /emergency-fund/top-up`.
4. Frontend — Dashboard render hasil alokasi (pie chart 5 bucket; struktur `cashflow_allocation` sudah ada di `types.ts`), halaman Cashflow/Allocation + tombol recalculate.

**Contoh konkret:**
Income Rp 12 jt, expense Rp 9 jt → surplus Rp 3 jt. EF target 6×Rp 4 jt = Rp 24 jt, sekarang Rp 10 jt, top-up rutin Rp 1,5 jt.
→ Engine: EF belum penuh = Rp 1,5 jt ke EF; goals → Rp 1,2 jt DP rumah (priority 1), Rp 300 rb liburan; sisa Rp 0 ke investasi. Bulan depan surplus naik → otomatis tambah porsi investasi.

**Catatan:** alokasi ini **bergantung pada data transaksi riil di DB**, jadi harus menunggu persistensi transaksi (Fase 1-2) beres.

---

## 6. Rencana Fase Pengembangan

**Fase 1 — Stabilkan integrasi (1-2 minggu, tanpa fitur baru):**
1. Fix 3 error `tsc` → build hijau.
2. Sinkronkan contract: buat endpoint `/api/v1/dashboard`, `/api/v1/emergency-fund` (PUT + top-up), `/api/v1/cashflows`, dependents — atau hapus dari api.ts yang tidak dipakai.
3. Samakan `types.ts` ke schema backend (bisa codegen dari OpenAPI `/docs`).
4. Pindahkan semua fetch ke axios `api` (proxy `/api`), hapus `http://127.0.0.1:8001` hardcoded, seragamkan `access_token`.
5. **Persistensi statement**: simpan `Statement` + `Transaction` (assign `account_id`/`user_id`), tambah auth + prefix `/api/v1`.
6. Hapus fallback demo user di `accounts.py`; env secret + CORS ketat.

**Fase 2 — Hubungkan data (fitur inti nyata):**
7. Auto-generate `CashflowAllocation` bulanan dari transactions.
8. Budget & Goals baca realisasi dari DB transactions (bukan localStorage).
9. Dashboard pakai `/api/v1/portfolio/summary`.

**Fase 3 — Fitur pembeda (Smart Advisor):**
10. Rebalancing: endpoint dari data `get_holdings` → suggestions (schema sudah disiapkan) + nominal target.
11. Goal-based schemes: petakan surplus ke goal sesuai `priority`.
12. Research/Markets real: integrasi data pasar (IDX/dll).

**Fase 4 — Kelengkapan produk:**
13. Export CSV/PDF, notifikasi (budget warning, goal, due date), onboarding → auto-create EF+goals (sudah ada `complete_onboarding`), testing.

---

## 7. Prioritas Main yang Disepakati (untuk diskusi lanjut)

Tiga yang **paling krusial** (di luar integrasi dasar):
1. **Keamanan/auth hardening** (#1) — prasyarat, app keuangan tanpa ini tidak layak rilis.
2. **Persistensi + CRUD transaksi** (#2) — tulang punggung semua data.
3. **Rebalancing engine** (#3) — pembeda produk, bahan-bahannya 80% sudah ada.

Rencana lanjut yang tertunda: mulai implementasi **Fase 1** (fix build + sinkron contract + persistensi statement); Arghy belum menginstruksikan untuk mengerjakan — tunggu konfirmasi.

---

## 8. Perintah / Konvensi yang Perlu Diingat

- **Jangan jalankan scraping otomatis** — hanya saat Arghy eksplisit meminta.
- Arghy suka kerja project **didokumentasikan step-by-step** agar tahap terakhir mudah dilanjut.
- Backup konteks ini sengaja dibuat agar insight tidak hilang meski session chat dihapus.

---
*Dibuat 2026-08-04 oleh Ambrose. Sinkron dengan `analisis-nexus-finance.md`, `memory/2026-08-04.md`, `MEMORY.md`.*

---

## 9. UPDATE 2026-08-08 — Kelengkapan CRUD Backend ✅

Melanjutkan prioritas #2 (CRUD transaksi). Backend CRUD sekarang **lengkap** untuk semua resource utama. Detail lengkap di `memory/2026-08-08.md`.

**Perubahan backend:**
- **Accounts** (`router/accounts.py`, `schema/account.py`): tambah `GET /{id}` + `PUT /{id}` (partial, bisa update `current_balance`). Schema baru `AccountUpdate`.
- **Transactions** (`router/statements.py`): **bug keamanan diperbaiki** — `PUT` & `DELETE /{tx_id}` dulu tanpa auth (siapapun bisa edit/hapus tx orang lain), sekarang `get_current_user` + filter `user_id`. Tambah `GET /transactions/{tx_id}` & `POST /transactions` (create single).
- **Cashflow** (router BARU `router/cashflow.py` + `schema/cashflow.py`): prefix `/api/v1/cashflows`, full CRUD per-bulan (GET list, GET/{month}, POST upsert, PUT, DELETE). Sebelumnya cuma bisa dibaca via `/portfolio/cashflow`.
- **Dependents** (router BARU `router/dependents.py` + `model/dependent.py` + `schema/dependent.py`): prefix `/api/v1/users/me/dependents`, full CRUD. Frontend sudah lama panggil ini tapi backend belum punya. `dependents_count` user disinkron otomatis.

**Perubahan frontend** (`src/services/api.ts`):
- `usersApi` + `updateDependent`.
- Baru: `transactionsApi` & `accountsApi` (full CRUD).
- `cashflowsApi` diperluas (get/create/remove, `update` pakai `month`).
- `npx tsc --noEmit` PASS.

**Verified live** (uvicorn port 8001, `--reload`): semua endpoint baru aktif & smoke-test OK. no-auth tx PUT/DELETE sekarang **401** (sebelumnya bocor).

**Belum:** halaman frontend masih pakai `fetch` hardcoded `http://127.0.0.1:8001/...` — integrasi frontend ke `api.ts` + sambung halaman = lanjutan berikutnya.
