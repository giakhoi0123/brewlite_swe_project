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
```

## Phần Menu của Võ Minh Tri

Task 2–3 đã có API danh sách và chi tiết sản phẩm, gồm dữ liệu size/topping. Menu tải dữ liệu API với loading/empty/error/retry, tìm kiếm không dấu và sắp xếp giá. Cart và thanh toán còn chờ module của Đông; chưa nghiệm thu toàn bộ luồng end-to-end.

| Thành phần | Địa chỉ phát triển theo mẫu |
| --- | --- |
| Frontend auth | `http://localhost:3001/` |
| Trang Menu | `http://localhost:3001/products` |
| API danh sách công khai | `http://localhost:3002/api/products` |
| PostgreSQL | `localhost:5433`, database `brewlite` |

`/products` là route trang; backend có global prefix `/api`. Frontend đọc `NEXT_PUBLIC_API_URL` có chứa `/api` từ `frontend/.env.local`, dùng chung tại `frontend/src/lib/api.ts`. Menu không cần token. CUSTOMER đăng nhập về `/products`, BARISTA về `/barista/dashboard`. Logout xóa cookie phiên và trạng thái auth rồi về `/`.

## Chạy môi trường phát triển

Cần Node.js/npm tương thích lockfile, Docker Compose hoặc PostgreSQL riêng. Máy kiểm tra dùng Node 24.11.0, Next.js 16.3.8, React 19.2.8, Prisma 6.19.3. Dùng Node 24 để chạy test/demo frontend có import TypeScript trực tiếp; không nâng cấp framework để chạy các lệnh này.

Từ root, chuẩn bị env nếu file đích chưa có (giữ cấu hình nhóm đang dùng):

```powershell
Copy-Item .env.example .env
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env.local
docker compose up -d postgres
docker compose ps
```

Đặt `DATABASE_URL` backend trỏ đúng DB, `PORT=3002`, `FRONTEND_ORIGIN=http://localhost:3001`; thay `JWT_SECRET` mẫu bằng secret phát triển. Root `.env` phục vụ Compose và được backend `main.ts` đọc thêm: giữ các giá trị trùng tên nhất quán với `backend/.env`. Prisma CLI trong `backend/` đọc env tại đó; Next.js trong `frontend/` không đọc root `.env`.

Terminal backend:

```powershell
cd backend
npm ci
npx prisma migrate deploy
npm run prisma:generate
npm run prisma:seed
npm run start:dev
```

Lệnh migration trên dành cho DB trống hoặc DB có lịch sử migration tương ứng. **DB đã có users từ db push, chưa có migrations:** đối chiếu schema và baseline theo [TRI-02](docs/tri-product-data.md) trước deploy. Không reset DB hoặc dùng `--accept-data-loss`. Seed 10 UUID ổn định, không xóa dữ liệu; seed lại không nhân đôi Product. Seed không ghi đè tài khoản người dùng hiện có.

Terminal frontend:

```powershell
cd frontend
npm ci
npm run dev -- --port 3001
```

Mở `/products`. Tài khoản Barista phát triển được tạo có kiểm soát theo phần Auth/RBAC bên dưới. Khi đổi URL API, restart frontend; bản production cần build lại. Dependencies phải được cài đúng hệ điều hành. Nếu thiếu shim `nest` trên Windows, lệnh backend tương đương: `node node_modules/@nestjs/cli/bin/nest.js start --watch`.

## Kiểm tra API và response

```powershell
curl.exe -i http://localhost:3002/api/products
```

Ví dụ cấu trúc thành công, không phải response DB đã được xác nhận trên máy kiểm tra:

```json
[
  {
    "id": "31a650c7-8597-4a01-a8e2-000000000001",
    "name": "Bạc xỉu 3 tầng Sài Gòn",
    "price": 29000,
    "imageUrl": "/images/products/sample-milk-coffee.svg"
  }
]
```

Danh sách rỗng: HTTP 200 với `[]`. Query lỗi: HTTP 500 thông báo chung, không biến thành []. Response chỉ có bốn trường, `price` number nguyên theo đồng, thứ tự DB `name ASC`, `id ASC`. SVG seed là ảnh minh họa local do frontend phục vụ, không phải ảnh chụp sản phẩm thật.

Đo khi API/DB thật sẵn sàng, từ thư mục backend:

```powershell
node test/products.benchmark.mjs http://localhost:3002/api/products 30
```

Có 3 warmup và 30 request đo. Lần kiểm tra 14/10/2026 không kết nối được cổng 3002/5433, chưa có bằng chứng đạt dưới 500 ms.

## Kiểm thử và tài liệu bàn giao

Frontend:

```powershell
cd frontend
node --test tests/*.test.mjs
npm run lint
npm run build
```

Backend trên Windows (npm test hiện dùng cú pháp env POSIX, gọi Jest trực tiếp):

```powershell
cd backend
node --experimental-vm-modules node_modules/jest/bin/jest.js --runInBand
```

HTTP tests dùng Nest/Supertest thật nhưng mock Prisma; không chứng minh PostgreSQL hoặc hiệu năng thật.

- [Ma trận kiểm thử US-02/US-03](docs/tri-menu-test-report.md)
- [Bàn giao, Definition of Done và demo 3 phút](docs/tri-menu-handoff.md)
- [Nội dung PR và gợi ý commit để review](docs/tri-menu-pr.md)
- [Contract/token](docs/tri-menu-contract.md), [schema/seed/migration](docs/tri-product-data.md), [API](docs/tri-products-api.md)
- [Fetch và trạng thái Menu](docs/tri-menu-api-integration.md), [adapter cho Đông](docs/tri-menu-details-handoff.md)

Demo loading/empty/error dùng HTTP fixture riêng trong `frontend/tests/fixtures/`, không đổi/xóa DB dùng chung. Lọc danh mục chưa có vì API chưa công bố `category`. Tìm kiếm/sắp xếp chạy phía client trên danh sách nhỏ đã tải đầy đủ; mặc định giữ thứ tự API. Chọn món còn khóa cho đến khi có chi tiết thật; chưa hiển thị badge cart giả.

## Auth/RBAC: CUSTOMER và BARISTA

Đăng ký công khai (`POST /api/auth/register`) luôn tạo `CUSTOMER` và từ chối trường `role`. Đăng nhập chung (`POST /api/auth/login`) trả role từ backend và đặt cookie HttpOnly, SameSite=Lax. Frontend chỉ giữ hồ sơ trong bộ nhớ, đọc lại bằng `GET /api/auth/me` khi tải trang, và gọi `POST /api/auth/logout` khi đăng xuất. JWT chứa ID; backend lấy role và trạng thái mới nhất từ PostgreSQL trên mỗi request được bảo vệ. Thiếu/hết hạn token trả 401; CUSTOMER truy cập `GET /api/barista/dashboard` trả 403. Các route `/barista/dashboard`, `/barista/orders`, `/barista/preparing`, `/barista/ready`, `/barista/history` hiện là placeholder được bảo vệ; chưa có API vận hành đơn hàng.

Migration `backend/prisma/migrations/20261014000000_add_rbac` đổi `users.name` thành `full_name`, thêm `role`, `status`, `phone` tại chỗ. User cũ mặc định `CUSTOMER` và `ACTIVE`; ID, hash mật khẩu và điểm tích lũy được giữ nguyên. Sao lưu DB trước khi áp dụng lên dữ liệu thật. Migration này chưa được chạy trên PostgreSQL của môi trường phát triển hiện tại.

Seed sản phẩm chạy không cần tài khoản nhân viên. Để tạo Barista phát triển, đặt `BARISTA_EMAIL`, `BARISTA_PASSWORD` (ít nhất 8 ký tự), tùy chọn `BARISTA_NAME` trong `backend/.env`, rồi chạy `npx prisma db seed` sau khi migrate và generate Prisma Client. Seed bỏ qua Barista nếu cả hai biến credential đều vắng mặt, từ chối thiếu một biến, không đổi tài khoản CUSTOMER thành BARISTA, không đặt lại mật khẩu Barista đã có và không cấp tài khoản trong `NODE_ENV=production`. Không commit mật khẩu thật.

Kiểm tra Auth/RBAC: từ `backend` chạy `npm test -- --runInBand`, `npm run lint`, `npm run build`; từ `frontend` chạy `npm run lint`, `npx tsc --noEmit`, `npm run build`. Frontend build cần truy cập Google Fonts vì layout dùng `next/font/google`. Triển khai production cần frontend và backend cùng site qua HTTPS để cookie phiên hoạt động.
