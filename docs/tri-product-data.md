# TRI-02: Product schema và dữ liệu mẫu

Phạm vi: dữ liệu sản phẩm theo [contract TRI-01](tri-menu-contract.md). Chưa triển khai API danh sách, chi tiết, Menu hoặc cart.

## Schema và migration

`backend/prisma/schema.prisma` thêm Product, map bảng `products`:

- `id`: UUID, giống kiểu id User; Prisma cấp UUID khi tạo thông thường.
- `name`: tên sản phẩm.
- `price`: PostgreSQL INTEGER, đơn vị đồng Việt Nam.
- `imageUrl`: string, map `image_url`.
- `stock`: PostgreSQL INTEGER, mặc định 0.

Migration Product có CHECK `price >= 0` và `stock >= 0`; đây là ràng buộc DB, vì Prisma schema không mô tả CHECK. Chạy `db push` không thay thế được việc áp dụng các ràng buộc SQL này. Không bổ sung category, description, badge hoặc size/topping. Model User giữ nguyên.

Repo trước TRI-02 dùng `prisma db push`, chưa có lịch sử migrations. Vì vậy chuẩn bị hai migration:

1. `0_baseline_users`: schema User trước TRI-02, sinh bằng Prisma 6.19.3 `migrate diff --from-empty --to-schema-datamodel`. Dùng để khởi tạo DB trống hoặc ghi nhận nền cho DB đã có users.
2. `20261006000100_add_products`: chỉ tạo bảng products và hai CHECK; không ALTER/DELETE/DROP User.

DB cũ cần được đối chiếu trước khi đánh dấu baseline đã áp dụng; nguyên tắc này theo [Prisma: baselining database](https://www.prisma.io/docs/orm/v7/prisma-migrate/workflows/baselining). Các lệnh bên dưới dùng CLI 6.19.3 đang có, không thay đổi sang API/CLI v7.

## Seed và nguồn ảnh

`backend/prisma/seed-products.ts` chứa 10 sản phẩm mẫu với UUID cố định. Bảng giá dưới là bộ dữ liệu phát triển được chọn cho TRI-02, không suy ra giá runtime từ ảnh thiết kế. Sau seed, database là nguồn giá và tồn kho thực tế.

| Tên | Giá (đồng) | Tồn kho ban đầu | Ảnh mẫu |
| --- | ---: | ---: | --- |
| Bạc xỉu 3 tầng Sài Gòn | 29000 | 40 | sample-milk-coffee.svg |
| Cà phê muối kem béo | 32000 | 30 | sample-latte.svg |
| Trà đào cam sả tươi mát | 35000 | 35 | sample-iced-tea.svg |
| Trà mãng cầu đậm vị | 35000 | 25 | sample-iced-tea.svg |
| Trà sữa Oolong nướng | 32000 | 30 | sample-milk-coffee.svg |
| Matcha latte kem trứng cháy | 39000 | 20 | sample-matcha.svg |
| Cold brew cam vàng hảo hạng | 39000 | 25 | sample-iced-tea.svg |
| Trà vải hoa hồng tinh tế | 35000 | 30 | sample-iced-tea.svg |
| Cacao sữa đá hạnh nhân | 30000 | 30 | sample-cacao.svg |
| Trà chanh giã tay Quảng Đông | 25000 | 50 | sample-iced-tea.svg |

Nguồn ảnh: năm SVG minh họa gốc tạo cho dữ liệu phát triển trong `frontend/public/images/products/`. Mỗi ảnh có viewBox 800x600, title tiếng Việt, không script hoặc nguồn ngoài. Đây là ảnh mẫu, không phải ảnh chụp sản phẩm thật; một số đồ uống cùng dùng ảnh minh họa nhóm. Đường dẫn lưu DB là `/images/products/<filename>`, được frontend phục vụ trên cùng origin; backend không cần phục vụ ảnh.

Đã thử tải ảnh từ `code3.html` do người dùng cung cấp: máy chủ ảnh trả HTTP 403 ngay ảnh đầu. Không lưu URL đó làm nguồn ảnh runtime phụ thuộc quyền truy cập. Các minh họa local đảm bảo tài liệu seed tham chiếu asset có trong repo; không thay giao diện frontend trong TRI-02.

`backend/prisma/seed.ts` giữ nguyên khối bcrypt/upsert tài khoản demo có trước. Sau đó gọi `product.createMany({ data: sampleProducts, skipDuplicates: true })`:

- UUID là khóa chính nên các sản phẩm đã seed được bỏ qua khi chạy lại; không nhân đôi theo lần chạy.
- Không đổi id, tên, giá, ảnh hoặc tồn kho của sản phẩm đã tồn tại; không tự restock. Thay giá seed không tự cập nhật dữ liệu hiện có.
- Không xóa bất kỳ User hoặc Product nào. Seed demo vẫn có hành vi trước đây: cập nhật tên và passwordHash cho `demo@brewlite.coffee`; không sửa user khác. Không cam kết passwordHash của demo giữ nguyên vì bcrypt sinh salt mới mỗi lần như seed cũ.
- Nếu DB đã có sản phẩm khác, tổng số Product có thể lớn hơn 10. Kiểm tra 10 UUID seed và số lượng toàn bảng không tăng ở lần chạy thứ hai, thay vì giả định DB dùng chung phải có đúng 10 dòng.
- Khi seed lỗi, in lỗi và trả exit code 1; luôn disconnect. Không có thêm dependency hoặc thay đổi package.json/lockfile.

## Cách áp dụng khi DB phát triển sẵn sàng

Chạy từ thư mục `backend/`. Cần Node dependencies được cài cho hệ điều hành hiện tại và `DATABASE_URL` trỏ DB phát triển. Có thể cấu hình trong `backend/.env` theo mẫu hoặc biến môi trường của shell; Prisma CLI không tự nạp `.env` ở root monorepo.

### DB hoàn toàn trống

```powershell
npx prisma migrate deploy
npm run prisma:generate
npm run prisma:seed
```

Deploy lần lượt baseline User rồi Product. Không cần shadow database hoặc reset.

### DB đã có User từ db push, chưa có lịch sử migration

1. Sao lưu DB phát triển theo quy trình nhóm; xác nhận đúng DB mục tiêu.
2. Đọc schema hiện có bằng `npx prisma db pull --print` (không ghi đè schema file); đối chiếu bảng users, kiểu cột, default, primary key và unique email với `prisma/migrations/0_baseline_users/migration.sql`.
3. Nếu schema khớp baseline và chưa có products/lịch sử migration, ghi nhận baseline đã tồn tại rồi áp migration Product:

```powershell
npx prisma migrate resolve --applied 0_baseline_users
npx prisma migrate deploy
npm run prisma:generate
npm run prisma:seed
```

Không áp lại SQL tạo users lên bảng đang tồn tại. Nếu DB có lịch sử migration khác, bảng products hoặc sai lệch schema: kiểm tra với nhóm và chuẩn bị migration hòa giải; không đánh dấu baseline là đã áp dụng khi chưa khớp. Không dùng reset, xóa dữ liệu hoặc `--accept-data-loss`.

### Kiểm chứng trên DB thật còn chờ

Trước khi seed, lưu snapshot User qua Prisma hoặc DB client của nhóm. Sau mỗi lần chạy seed, lấy `product.count()` và danh sách theo các UUID trong `sampleProducts`. Chạy seed hai lần để xác nhận số lượng sau hai lần bằng nhau, đủ 10 UUID mẫu, các Product có trước không đổi giá/tồn kho. So sánh toàn bộ User khác demo; với demo kiểm tra id/email/loyaltyPoints/createdAt vẫn giữ nguyên, xét riêng hành vi cập nhật tên/passwordHash đã có từ trước.

Kiểm tra hai CHECK bằng cách thử insert price/stock âm trong transaction của DB kiểm thử rồi rollback; lỗi phải được DB từ chối. Các bước này chưa chạy trên máy hiện tại, không được xem kiểm tra dữ liệu seed offline là bằng chứng DB.

## Kiểm tra thực tế ngày 06/10/2026

| Kiểm tra | Kết quả và giới hạn |
| --- | --- |
| Prisma 6.19.3 validate | PASS; dùng DATABASE_URL theo mẫu local cho việc validate, không chứng minh kết nối DB |
| Prisma generate | PASS; đã tải engine Windows khớp phiên bản để generate |
| Migration diff offline | PASS; baseline và Product SQL sinh được từ schema. CHECK được bổ sung thủ công; chưa thực thi SQL trên PostgreSQL |
| TypeScript | PASS: `node node_modules/typescript/bin/tsc --noEmit --incremental false`, bao gồm các file seed |
| Backend build | `npm run build` bị chặn vì thiếu shim Windows `nest`; chạy CLI có sẵn trực tiếp `node node_modules/@nestjs/cli/bin/nest.js build` PASS |
| Lint | Đã bổ sung binding Windows cho oxlint thực tế 1.86.0 vào thư mục tạm; lint prisma/src/test bằng CLI hiện có PASS. Không đổi dependency manifest/lockfile |
| Dữ liệu/ảnh offline | PASS: 10 UUID khác nhau, tên không rỗng, price/stock nguyên không âm, đường dẫn ảnh có file; SVG XML hợp lệ; block User schema không đổi |
| Jest hiện có | BLOCKED: `node --experimental-vm-modules node_modules/jest/bin/jest.js --runInBand` báo không tìm thấy ts-jest trong transform. Chưa dùng kết quả này để khẳng định hồi quy auth |
| Kết nối DB | BLOCKED: không có root/backend .env và DATABASE_URL trong shell; với URL mẫu local, Prisma migrate status lỗi schema engine. Kiểm tra TCP ngoài sandbox xác nhận `127.0.0.1:5433 ECONNREFUSED`; Docker/psql không có trong PATH |
| Apply migration, seed hai lần, bảo toàn User trên DB | BLOCKED bởi kết nối DB; chưa chạy migrate deploy/resolve hoặc seed lên DB thật |

Repo đang theo dõi cả `backend/dist`, `tsconfig.build.tsbuildinfo` và generated Prisma Client trong Git. Các thay đổi tự sinh trong lúc kiểm tra được khôi phục về HEAD sau khi kiểm tra để tách khỏi source TRI-02; cần chạy lại `prisma generate` trước khi typecheck/seed trên máy khác. Engine Windows được tải là công cụ local, không phải source chức năng. Không đưa công cụ tạm vào feature commit.

Chưa commit/push TRI-02. Việc xác nhận DB thật và review nhóm còn chờ; task không triển khai các API/UI hoặc nghiệp vụ ngoài dữ liệu sản phẩm.
