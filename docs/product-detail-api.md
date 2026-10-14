# T4.2 — API chi tiết sản phẩm

Ngày kiểm tra: 14/10/2026. Theo [contract T4.1](product-customization-contract.md). Phạm vi chỉ dữ liệu và API chi tiết; chưa triển khai trang chi tiết, tùy chọn UI, cart, đặt đơn/thanh toán hoặc trừ tồn kho.

## Endpoint và response

- GET `/api/products/:id`, controller `products` tái sử dụng ProductsModule/PrismaService và global prefix `api`. GET `/api/products` vẫn trả mảng bốn trường như trước.
- ID qua ParseUUIDPipe của NestJS đang cài: UUID hợp lệ, chấp nhận chữ hoa/thường; sai định dạng → HTTP 400 trước khi gọi Prisma.
- Có sản phẩm/cấu hình hợp lệ → HTTP 200 với object trực tiếp: id, name, description, imageUrl, price, sizes, toppings, defaultSizeId. Không envelope, stock hoặc trường nội bộ isDefault/productId.
- UUID hợp lệ nhưng không có Product → 404, message `Product not found`.
- Query/DB lỗi → 500 qua exception handler Nest; không trả stack/connection details, không đổi lỗi thành 404 hoặc sản phẩm giả.
- Product tồn tại nhưng thiếu ba size, thiếu/nhiều default, default không khả dụng hoặc phí âm → lỗi cấu hình 500 chung. Không tự lấy size đầu, dùng phí 0 hay hard-code tùy chọn để che dữ liệu thiếu.
- Chi tiết công khai như catalog, không thêm JWT guard. Auth/đặt đơn không sửa.

`price` giữ nghĩa giá cơ bản chưa cộng size/topping. Mọi giá là integer VND; availability từ dữ liệu tùy chọn, không suy từ stock. Query size theo enum S/M/L và topping theo UUID để thứ tự ổn định; default lấy entry isDefault thuộc chính relation Product.sizes.

Response sau là ví dụ theo dữ liệu seed phát triển, **chưa phải response từ PostgreSQL đã chạy trên máy này**:

```json
{
  "id": "31a650c7-8597-4a01-a8e2-000000000001",
  "name": "Bạc xỉu 3 tầng Sài Gòn",
  "description": "Cà phê và sữa, phục vụ lạnh.",
  "imageUrl": "/images/products/sample-milk-coffee.svg",
  "price": 29000,
  "sizes": [
    { "id": "c075421a-1160-4e94-84d4-000000000001", "code": "S", "name": "Nhỏ (S)", "extraPrice": 0, "available": true },
    { "id": "c075421a-1160-4e94-84d4-000000000002", "code": "M", "name": "Vừa (M)", "extraPrice": 4000, "available": true },
    { "id": "c075421a-1160-4e94-84d4-000000000003", "code": "L", "name": "Lớn (L)", "extraPrice": 9000, "available": true }
  ],
  "toppings": [
    { "id": "b4151b67-4044-43ce-9cac-000000000001", "name": "Thêm espresso", "extraPrice": 7000, "available": true },
    { "id": "b4151b67-4044-43ce-9cac-000000000002", "name": "Kem cheese", "extraPrice": 6000, "available": true }
  ],
  "defaultSizeId": "c075421a-1160-4e94-84d4-000000000002"
}
```

## Nguồn dữ liệu và migration

Nguồn runtime duy nhất là PostgreSQL qua Prisma; service không import seed hoặc bảng giá trong HTML. Schema bổ sung:

- Product.description: string mặc định rỗng, giữ nguyên id/name/price/imageUrl/stock và model User.
- ProductSize: UUID, productId FK, enum code S/M/L, name, extraPrice, available, isDefault. Unique(productId, code).
- Topping: UUID/name ổn định dùng chung catalog.
- ProductTopping: khóa (productId, toppingId), phụ phí/availability áp dụng cho món đó; không tự gán toàn catalog topping cho mọi món.

Migration `20261014000100_product_customization` chỉ thêm cột/bảng/index/FK. CHECK phụ phí không âm, tên tùy chọn không rỗng và default phải available; partial unique index chỉ cho một isDefault trên một Product. FK giữ size thuộc Product, API xác nhận default tồn tại trong ba size. Prisma schema không diễn tả CHECK/partial index, vì vậy không thay migration bằng db push. Khi tạo migration tiếp theo, giữ các ràng buộc SQL bổ sung này.

Không reset DB, không DROP/DELETE hoặc ALTER users, không đổi giá cơ bản/tồn kho hiện có. Migration không tự tạo tùy chọn cho các Product cũ; seed hoặc quy trình quản trị phải cung cấp trước khi GET chi tiết thành công. GET danh sách vẫn hoạt động với Product chưa có tùy chọn.

## Seed phát triển

`seed-product-customization.ts` là nguồn seed bổ sung, lấy bộ phụ phí minh họa T4.1 cho phát triển: S +0, M +4000 (default), L +9000; espresso +7000, cheese +6000. Đây không phải bảng giá kinh doanh được nhóm nghiệm thu, không lấy từ hình ảnh thiết kế.

10 UUID Product mẫu có description, tổng 30 size UUID ổn định; ID size dựa vào UUID seed cố định của Product và code, không dựa vào vị trí danh sách. Hai topping UUID giữ đúng ví dụ T4.1. Espresso được gán rõ bằng Product ID cho Bạc xỉu/Cà phê muối/Cold brew; cheese cho 10 món (13 quan hệ tổng). Đây là lựa chọn dữ liệu phát triển, không suy danh mục từ tên.

Mỗi cấu hình Product chạy trong transaction; description chỉ điền nếu đang rỗng. Chỉ tạo bộ size khi Product chưa có size nào; giữ nguyên cấu hình đã sửa. Topping/catalog và quan hệ dùng createMany skipDuplicates nên không đổi tên/phí/availability đã có hoặc nhân đôi theo lần chạy. Nếu cấu hình cũ không đầy đủ, seed không tự sửa/ghi đè: cần kiểm tra riêng, API trả lỗi cấu hình.

Script riêng `seed-customization.ts` thêm Product mẫu còn thiếu theo UUID (skipDuplicates), rồi seed tùy chọn; **không đọc/ghi User**. `seed.ts` toàn dự án được nối gọi helper sau block seed cũ; block auth giữ nguyên và vẫn có hành vi cũ rehash/update tài khoản demo. Vì vậy với DB đã có auth, dùng lệnh seed riêng dưới đây, không chạy lại seed toàn dự án chỉ để thêm tùy chọn.

## Chạy khi PostgreSQL sẵn sàng

Cần DATABASE_URL được cấu hình đúng DB phát triển tại backend/.env hoặc shell. Với DB cũ chưa có baseline migrations, đối chiếu theo [TRI-02](tri-product-data.md) trước deploy; không đánh dấu baseline khi schema chưa khớp.

Từ thư mục backend:

```powershell
node node_modules/prisma/build/index.js migrate deploy
node node_modules/prisma/build/index.js generate
npm run prisma:seed-customization
npm run start:dev
```

Nếu dependencies Windows thiếu shim tsx/nest, dùng entry point package đã cài:

```powershell
node node_modules/tsx/dist/cli.mjs prisma/seed-customization.ts
node node_modules/@nestjs/cli/bin/nest.js start --watch
```

Kiểm tra API thật:

```powershell
curl.exe -i http://localhost:3002/api/products
curl.exe -i http://localhost:3002/api/products/31a650c7-8597-4a01-a8e2-000000000001
curl.exe -i http://localhost:3002/api/products/not-a-uuid
curl.exe -i http://localhost:3002/api/products/31a650c7-8597-4a01-a8e2-000000000999
```

Với DB kiểm thử đã chuẩn bị, chạy seed riêng hai lần và so counts/UUID/giá/tồn kho, snapshot User trước/sau để kiểm chứng bảo toàn. Với DB có thêm dữ liệu, không giả định toàn bảng chỉ có 10 Product. Các phép kiểm tra CHECK/default SQL cần chạy trên DB kiểm thử và rollback, không thử phá dữ liệu dùng chung.

## Kiểm chứng thực tế T4.2

| Kiểm tra | Kết quả | Giới hạn |
| --- | --- | --- |
| Prisma validate 6.19.3 | Pass | Schema hợp lệ; URL mẫu local chỉ dùng validate, không chứng minh kết nối |
| Prisma generate 6.19.3 | Pass | Client mới đã generate để typecheck/build/test |
| Prisma migrate diff offline | Pass | Diff schema trước/sau có cột/bảng/FK/index đúng; CHECK/partial index bổ sung trong SQL. Chưa thực thi SQL |
| TypeScript --noEmit --incremental false | Pass, exit 0 | Kiểm tra source và seed với Client đã generate |
| Nest build (CLI trực tiếp) | Pass, exit 0 | Không thay package/dependency để sửa shim |
| Oxlint source/test/prisma | Pass, 0 diagnostic trên 32 file | Binding Windows có sẵn ở tmp/tri03/tools/node_modules |
| Jest toàn backend | Pass, 7 suite/32 test, exit 0 | HTTP Nest/Supertest thật; Prisma mock. 10 service detail, 8 HTTP detail, 2 seed + 12 test trước |
| UUID sai/không tồn tại/lỗi query | Pass qua HTTP | 400 không gọi Prisma; 404 null; 500 generic không stack/password/host DB |
| Contract/default/phụ phí/availability | Pass qua service/HTTP và seed tests | Định dạng/bộ seed offline; chưa đọc PostgreSQL thật |
| API danh sách hồi quy | Pass | Mảng bốn trường, 200 [], 500, CORS/prefix và query select/orderBy giữ nguyên |
| Prisma migrate status với URL mẫu | Blocked | Schema engine error; probe TCP ngoài sandbox xác nhận localhost:5433 ECONNREFUSED |
| migrate deploy, seed DB hai lần, GET nối PostgreSQL | Blocked / chưa chạy | Không root/backend .env hoặc DATABASE_URL shell; Docker/psql không có PATH. Không tự tạo DB/config auth hoặc dùng reset |

Lần test đầu có một kỳ vọng message viết hoa khác với exception mặc định của Nest; đã sửa expectation của lỗi cấu hình thành `Internal Server Error` và chạy lại toàn suite đạt 32/32. Lỗi query ngoài HttpException vẫn được Nest trả message chung `Internal server error`. Không lộ chi tiết ở cả hai.

Repo đang track dist và generated Prisma Client. Artefact tracked tự sinh sau build/generate được khôi phục về trạng thái trước task để thay đổi chỉ chứa source; cần generate/build lại theo lệnh trên trước khi chạy/typecheck, kể cả ở checkout hiện tại. Engine Windows/cache và build Product không tracked được giữ tại tmp/t42/runtime, không đưa vào feature. Không xem kết quả mock là API/DB thật đã chạy. Web test Menu hiện có vẫn dùng HTTP fixture danh sách, chưa có UI chi tiết và không được đổi thành API tùy chọn thật trong task này.

## File thay đổi và phần còn phụ thuộc

| File | Vai trò |
| --- | --- |
| backend/src/products/products.controller.ts | GET :id và UUID pipe |
| backend/src/products/products.service.ts, product-detail.ts | Query/response mapping và kiểm tra cấu hình |
| backend/prisma/schema.prisma, migrations/20261014000100_product_customization/migration.sql | Description và model/ràng buộc tùy chọn |
| backend/prisma/seed-product-customization.ts, seed-customization.ts, seed.ts | Dữ liệu bổ sung, seed riêng không auth và kết nối seed cũ |
| backend/package.json | Lệnh prisma:seed-customization, không thêm dependency |
| product-detail.service.spec.ts, product-detail.http.spec.ts, products.http.spec.ts, test/fixtures/product-detail.ts | Test chi tiết và hồi quy collection |
| backend/prisma/seed-product-customization.spec.ts | Test dữ liệu seed và giữ cấu hình đã có |
| docs/product-detail-api.md | Hướng dẫn/bằng chứng và phần Blocked |

Để nghiệm thu DB/end-to-end cần môi trường PostgreSQL, áp migration, seed và kiểm tra ràng buộc/HTTP thực. Giá phát triển và chính sách public detail còn cần review nhóm. Không triển khai task UI/cart tiếp theo và không commit/push trong T4.2.
