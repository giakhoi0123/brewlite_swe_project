# ☕ BrewLite — Coffee Ordering System (Monorepo)

Dự án môn **Công nghệ Phần mềm (SWE)** xây dựng hệ thống đặt cà phê theo kiến trúc Monorepo, tích hợp Vertical Slice Architecture và quản lý bằng Git-flow.

---

## 🛠️ Tech Stack Chuẩn Hóa
- **Frontend:** Next.js (App Router), React, TypeScript, TailwindCSS
- **Backend:** NestJS (REST API, TypeScript)
- **Database & ORM:** PostgreSQL 15, Prisma ORM
- **DevOps:** Docker & Docker Compose
- **Auth:** JWT, Passport, Bcrypt hashing

---

## 📂 Cấu Trúc Monorepo
```text
brewlite_swe_project/
├── backend/                  # NestJS API Server
│   ├── prisma/               # Schema và migrations Prisma
│   └── src/                  # Controllers, Services, Modules (Auth,...)
├── frontend/                 # Next.js Web Client
│   └── src/                  # App router, Components, Store
├── docker-compose.yml        # Chạy PostgreSQL cục bộ
├── .env.example              # Mẫu biến môi trường
└── README.md
