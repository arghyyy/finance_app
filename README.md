# Nexus Finance

Aplikasi untuk membantu pengelolaan dan pemantauan keuangan.

## Struktur Project

- `frontend/` — aplikasi antarmuka pengguna
- `backend/` — API dan logika aplikasi
- `docker-compose.yml` — konfigurasi Docker
- `test_parse.py` — pengujian parsing data

## Persyaratan

Pastikan perangkat sudah memiliki:

- Git
- Docker
- Docker Compose

## Menjalankan Project

1. Clone repository:

   ```bash
   git clone https://github.com/USERNAME/finance_app.git
   cd finance_app

2. Buat file environment:
   ```cp .env.example .env

3. Jalankan Aplikasi:
   ```docker compose up --build

4. Untuk menghentikan aplikasi:
  ``` docker compose down
