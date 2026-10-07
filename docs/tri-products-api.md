# TRI-03: API danh sách sản phẩm

Ngày kiểm tra: 06/10/2026. Phạm vi: Task 2, theo [contract TRI-01](tri-menu-contract.md), dùng [dữ liệu TRI-02](tri-product-data.md).

## Hành vi

- API công khai `GET /api/products`, không yêu cầu JWT. Giữ global prefix `api` của backend; trang Menu vẫn là `/products`.
- Query PostgreSQL qua `PrismaService.product.findMany`, select đúng `id`, `name`, `price`, `imageUrl`.
- Thứ tự DB: `name ASC`, sau đó `id ASC` để ổn định khi tên trùng.
- HTTP 200 với mảng trực tiếp; giá là number nguyên theo đồng Việt Nam. Không có envelope, stock hoặc các trường mở rộng.
- HTTP 200 với `[]` nếu query thành công nhưng không có sản phẩm.
- Lỗi query được chuyển tiếp đến cơ chế exception mặc định của NestJS; HTTP 500 có thông báo chung, không biến lỗi thành `[]` hoặc đưa thông tin kết nối vào response.
- Không có API chi tiết hoặc CRUD quản trị trong task này. CORS hiện có của `main.ts` được giữ nguyên.

Ví dụ minh họa cấu trúc, không phải response từ DB thật đã chạy:

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

## File và trách nhiệm

| File | Trách nhiệm |
| --- | --- |
| `backend/src/products/products.module.ts` | Import PrismaModule, đăng ký controller/service |
| `backend/src/products/products.controller.ts` | GET route products, trả kết quả service |
| `backend/src/products/products.service.ts` | Query select bốn trường, sắp xếp ổn định, kiểu ProductListItem |
| `backend/src/app.module.ts` | Đăng ký ProductsModule vào ứng dụng |
| `backend/src/products/products.service.spec.ts` | Kiểm tra query, dữ liệu rỗng và lỗi truy vấn |
| `backend/src/products/products.http.spec.ts` | HTTP thực qua Nest/Supertest, dùng DB mock |
| `backend/test/products.benchmark.mjs` | Phép đo chỉ đọc API đang chạy, không tạo dữ liệu hoặc mock |

## Kiểm tra thực tế

| Kiểm tra | Kết quả | Giới hạn |
| --- | --- | --- |
| ProductsService | PASS, 3 test | Prisma được mock; kiểm tra select/orderBy và lỗi, không xác minh query trên PostgreSQL |
| HTTP contract | PASS, 7 test | Nest routing/controller/service/exception/CORS chạy thật; database mock |
| Suite hiện có | PASS, tổng 4 suite / 12 test, gồm 2 test cũ | Test cũ là smoke, không chứng minh luồng đăng nhập end-to-end |
| TypeScript | PASS | `node node_modules/typescript/bin/tsc --noEmit --incremental false` |
| Build backend | PASS | `node node_modules/@nestjs/cli/bin/nest.js build`; dùng CLI trực tiếp vì dependencies có sẵn thiếu shim Windows |
| Lint | PASS, 0 diagnostic trên 25 file | `node node_modules/oxlint/bin/oxlint --format json src/ test/ prisma/` |
| Benchmark API thật | BLOCKED | `node test/products.benchmark.mjs http://localhost:3002/api/products 30`: fetch failed, ECONNREFUSED |

Bảy test HTTP xác nhận: truy cập không token trả mảng HTTP 200 đúng trường/giá number; rỗng trả 200 với []; lỗi query trả 500 không lộ chi tiết; origin frontend local được CORS cho phép; đường dẫn thiếu `/api` trả 404; chưa có route chi tiết; chưa có POST tạo sản phẩm.

Native binding Windows còn thiếu trong bản node_modules có sẵn làm Jest báo không tìm được ts-jest dù package đó tồn tại. Đã xác định nguyên nhân là binding của `unrs-resolver` và tải đúng 1.12.2 vào thư mục tạm; tương tự binding Windows cho oxlint 1.86.0. Không sửa package.json/lockfile, không nâng cấp framework. Các test dùng cấu hình Jest hiện có và import `jest` từ `@jest/globals` theo chế độ ESM của dự án.

Client Prisma được generate lại trước kiểm tra. Các file build/generated đã bị Git theo dõi từ trước được khôi phục sau kiểm tra để feature chỉ chứa source. Trên máy chạy ứng dụng, cần cài dependency đúng hệ điều hành và chạy `prisma generate` trước build/test.

## Tái chạy kiểm tra và phép đo

Từ thư mục `backend/`, với dependencies đúng hệ điều hành và Prisma Client đã generate:

```powershell
node --experimental-vm-modules node_modules/jest/bin/jest.js --runInBand
node node_modules/typescript/bin/tsc --noEmit --incremental false
node node_modules/@nestjs/cli/bin/nest.js build
node node_modules/oxlint/bin/oxlint --format json src/ test/ prisma/
```

Để đo trên dữ liệu thật:

1. Chuẩn bị DATABASE_URL, JWT_SECRET và PORT cho DB/backend phát triển. Áp migrations, generate và seed theo hướng dẫn TRI-02; không reset DB dùng chung.
2. Khởi động backend tại cổng tương ứng, ví dụ 3002. Frontend phát triển 3000/3001 nằm trong CORS hiện có; các origin khác cần FRONTEND_ORIGIN phù hợp.
3. Xác nhận `GET http://localhost:3002/api/products` trả dữ liệu DB thật. Chạy:

```powershell
node test/products.benchmark.mjs http://localhost:3002/api/products 30
```

Script thực hiện 3 request warmup rồi 30 request tuần tự, kiểm tra response không rỗng và đúng contract; xuất timestamp UTC, Node/OS, endpoint, số sản phẩm, số lần đo, min/mean/p50/p95/max theo ms và kết quả tất cả request dưới 500 ms. Thời gian bao gồm round trip, đọc body và parse JSON. Cần ghi thêm cấu hình máy, PostgreSQL/API chạy local hay remote khi lưu kết quả; đây không phải phép thử tải đồng thời.

Lần chạy hiện tại bị từ chối kết nối ngay warmup đầu tiên; không có request đo thành công, không có số liệu ms hoặc kết luận đạt mục tiêu <500 ms. Không dùng thời gian Jest/DB mock để suy ra hiệu năng thật.

## Phần còn phụ thuộc

- PostgreSQL/backend thật và cấu hình môi trường còn thiếu: chưa xác minh migration/seed trên DB, HTTP đến DB thật, sắp xếp thực tế hoặc mục tiêu phản hồi <500 ms.
- CORS và HTTP contract đã kiểm chứng trong test; chưa có frontend Menu gọi API hoặc kiểm thử trên trình duyệt. Việc nối UI thuộc các task sau.
- Public catalog tuân theo đề xuất TRI-01; nhóm vẫn cần review chính sách. Không đổi guard hoặc luồng auth.
- PR trên branch này bao gồm TRI-01, TRI-02 và TRI-03 vì hai commit trước chưa có PR riêng. Mở ở trạng thái draft để reviewer thấy rõ phần kiểm chứng DB/performance còn chờ. Chưa merge hoặc triển khai.
