# TRI-06 — Menu gọi API và trạng thái tải

Ngày kiểm tra: 14/10/2026. Branch: `feature/vo-minh-tri-menu-products`.

## Thay đổi và lựa chọn kiến trúc

- [products/page.tsx](../frontend/src/app/products/page.tsx) giữ Server Component/metadata và khung TRI-04, thay vùng placeholder bằng [ProductCatalog](../frontend/src/components/menu/product-catalog.tsx).
- `ProductCatalog` là Client Component, fetch khi mount, render loading/success/empty/error. Cách này phù hợp auth store phía client, ProductGrid có callback và retry tại chỗ; không thêm thư viện fetch.
- [api.ts](../frontend/src/lib/api.ts) là cấu hình dùng chung cho auth và Menu. Đọc `NEXT_PUBLIC_API_URL`, trim và bỏ dấu slash cuối. Mặc định `http://localhost:3002/api` theo contract/env backend; trước đây auth mặc định 3000. Luồng submit/session/redirect của auth giữ nguyên.
- [products.ts](../frontend/src/lib/products.ts) GET `${API_BASE_URL}/products`, `cache: no-store`, `credentials: omit`, không gửi Bearer token. Kiểm tra HTTP status và JSON trước khi nhận dữ liệu.
- [product-contract.ts](../frontend/src/lib/product-contract.ts) kiểm tra mảng trực tiếp, UUID duy nhất, tên không rỗng, giá nguyên 0..2147483647, imageUrl HTTP(S) hoặc path local từ `/`. Một dòng sai làm lỗi toàn response; không lọc thành danh sách rỗng. Chỉ chuyển bốn trường catalog cho UI.
- [ProductGridSkeleton](../frontend/src/components/menu/product-grid-skeleton.tsx) gồm sáu khung card theo grid 1/2/3 cột, tỷ lệ ảnh 4:3, vùng tên/giá/nút và khoảng dành cho số kết quả. [product-catalog.module.css](../frontend/src/components/menu/product-catalog.module.css) có pulse và tắt animation khi `prefers-reduced-motion: reduce`.
- HTTP 200 với `[]` mới là empty. Lỗi mạng, HTTP lỗi, JSON lỗi hoặc contract sai là error với lời nhắc thân thiện và nút “Thử lại”; không hiện chi tiết server/connection.
- Mỗi lần tải/retry có AbortController riêng. Cleanup abort request và đánh dấu kết quả không còn active; chỉ request còn active được cập nhật state. Retry đưa về loading và gọi lại API, không tạo delay giả.

Menu thật không chứa danh sách sản phẩm hard-code hoặc nút giả lập trạng thái. ProductGrid hiện hiển thị dữ liệu fetch được; chọn món vẫn disabled vì chưa nối callback của Đông (TRI-07). Không có cart/store/tổng tiền mới.

## Cấu hình để chạy với backend thật

Đã sửa `.env.example` ở root từ `FRONTEND_API_URL` sang `NEXT_PUBLIC_API_URL`, thêm [frontend/.env.example](../frontend/.env.example) và cho phép Git theo dõi riêng file mẫu đó. File `.env.local` chứa cấu hình máy vẫn bị ignore.

Đặt tại **frontend/.env.local** (Next.js không tự đọc `.env` ở root monorepo):

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:3002/api
```

Restart Next.js khi đổi env; production cần build lại vì biến public được inline vào bundle. Cấu hình backend PORT=3002 và frontend 3001 phù hợp CORS hiện có. Chuẩn bị DB/migration/seed theo [TRI-02](tri-product-data.md), rồi kiểm tra GET `/api/products` theo [TRI-03](tri-products-api.md). Nếu frontend dùng origin khác, backend cần FRONTEND_ORIGIN tương ứng.

Task này không tạo `.env` chứa mật khẩu, không cài/reset PostgreSQL hoặc chạy migration/seed lên DB chưa xác định.

## Kiểm chứng thực tế

Windows, Node.js v24.11.0, Next.js 16.3.8, Edge. Đã đọc AGENTS.md và guide Next.js cục bộ về Server/Client Components, Fetching Data và Environment Variables.

| Kiểm tra | Kết quả thực tế |
| --- | --- |
| `node --test tests/product-contract.test.mjs` tại frontend | PASS: 6 test cho dữ liệu hợp lệ/rỗng, sai dòng, sai giá, thiếu trường/URL và UUID trùng |
| `npm run lint` tại frontend | PASS, exit 0 |
| `npm run build` tại frontend | PASS: compile, TypeScript, prerender; chỉ `/`, `/_not-found`, `/products` |
| Bundle production sau test | PASS: không có URL fixture `localhost:3012/api`; auth và Menu dùng mặc định backend 3002 khi không cấu hình env |
| Loading | PASS: HTTP fixture giữ request; aria-busy=true, 6 skeleton, không có article dữ liệu |
| Skeleton → success | PASS: hai tên/giá 41000 và 27000 trùng response; UI hiện 2 món; giá 41.000 ₫/27.000 ₫. Card và skeleton đầu đều 352 × 490.4px, grid top theo document đều khoảng 531.975px trong mẫu thử |
| Empty | PASS: HTTP 200 với [] hiện “Thực đơn chưa có đồ uống”, không có card hoặc error |
| HTTP 500 | PASS: Error State, không biến thành empty và không hiện chuỗi thông tin nội bộ của response test |
| Retry | PASS: Enter trên Thử lại → loading → success với dữ liệu mới “API phục hồi thành công”, giá 41001, 1 món; HTTP fixture ghi nhận request mới |
| Response sai | PASS: envelope `{data:[]}`, JSON hỏng và giá chuỗi đều hiện error, không có card/empty |
| Lỗi mạng | PASS: endpoint không kết nối được và fixture đóng socket đều hiện Error State |
| Hủy khi rời Menu | PASS: request đang giữ được abort khi điều hướng Đăng nhập; log request id 11 ghi aborted. Quay lại nhận tên “API mới sau điều hướng” từ request mới, không bị kết quả cũ ghi đè |
| Public catalog | PASS với HTTP fixture: các request không có Authorization/cookie; env test có slash cuối vẫn gọi đúng `/api/products` |
| Skeleton responsive | PASS ở 375/768/1440px: 1/2/3 cột, scrollWidth = clientWidth lần lượt 360/753/1425px |
| Reduced motion | CSSOM trình duyệt xác nhận rule media đã nạp và đặt animation none cho skeleton. Chưa giả lập preference reduce để kiểm tra computed animation trong chế độ đó |
| Auth | Trang auth mở được sau điều hướng. Chưa kiểm thử lại login/register với backend/DB thật; chỉ thay nguồn URL dùng chung |

Frontend test chạy cổng 3011, API fixture cổng 3012, cấu hình env chỉ áp dụng cho process test. Đây là request HTTP thật và component Menu thật với **response kiểm thử**, không phải dữ liệu PostgreSQL hoặc phép đo hiệu năng API thật. Không suy ra performance <500ms từ các kiểm tra này.

Công cụ browser ban đầu lỗi tải policy kết nối; đã khôi phục sau khi đọc hướng dẫn và kiểm tra tab. Server HTTP test chạy trong sandbox ban đầu không truy cập được từ browser; chạy ngoài sandbox trên localhost đã kiểm chứng được các trạng thái. Không sửa app để bỏ qua lỗi môi trường.

Ảnh và log cục bộ (không commit): `tmp/tri06/loading.jpg`, `success.jpg`, `empty.jpg`, `error.jpg`, `results.json`, `http-events.jsonl`. Server test đã dừng, viewport đã reset; không để env fixture vào production build. Node test có warning MODULE_TYPELESS_PACKAGE_JSON khi import TS; cả 6 test vẫn exit 0, không đổi module type của dự án chỉ để tắt warning.

## Tái chạy kiểm tra các trạng thái

Không cần thêm dependency. Test contract dùng Node native test runner và hỗ trợ đọc TypeScript trực tiếp (đã chạy trên Node 24):

```powershell
cd frontend
node --test tests/product-contract.test.mjs
npm run lint
npm run build
```

HTTP fixture độc lập ở [tests/fixtures/products-api-server.mjs](../frontend/tests/fixtures/products-api-server.mjs), không import vào app. Tạo file JSON điều khiển riêng, ví dụ `D:/brewlite_swe_project/tmp/tri06/control.json`. Khởi chạy từ root:

```powershell
node frontend/tests/fixtures/products-api-server.mjs D:/brewlite_swe_project/tmp/tri06/control.json
```

Terminal khác tại root:

```powershell
$env:NEXT_PUBLIC_API_URL='http://localhost:3012/api/'
npm run dev --prefix frontend -- --hostname 127.0.0.1 --port 3011
```

Mở `/products` trên localhost:3011. File điều khiển nhận:

- `{"hold":true,"status":200,"body":[...]}` để giữ loading; bỏ hold để trả response.
- `{"status":200,"body":[]}` để empty.
- `{"status":500,"body":{"message":"test-only"}}` để error; đổi về body Product[] hợp lệ rồi bấm Thử lại.
- `{"status":200,"body":{"data":[]}}` hoặc `{"status":200,"rawBody":"{"}` để thử sai định dạng.
- `{"networkError":true}` để đóng socket. Chế độ này chỉ có trong fixture.

Dừng cả hai process sau test. Biến NEXT_PUBLIC_API_URL test chỉ dùng trong terminal riêng; bỏ biến/restart/build lại với URL backend thật. Không thay dữ liệu DB dùng chung để tạo empty/error.

## Phần còn phụ thuộc

PostgreSQL 5433/backend 3002 chưa chạy, DATABASE_URL/env thật chưa có tại lúc khảo sát; kiểm chứng toàn luồng NestJS → PostgreSQL → Menu còn BLOCKED. Khi môi trường sẵn sàng, cần so sánh UI với response API DB thật. Tích hợp chọn món/cart thuộc TRI-07 và Đông; TRI-06 không triển khai phần đó. Chưa commit/push thay đổi TRI-06.
