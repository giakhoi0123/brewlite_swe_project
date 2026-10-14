# TRI-09 — Báo cáo kiểm thử Menu và API danh sách

Ngày: 14/10/2026. Võ Minh Tri. Branch `feature/vo-minh-tri-menu-products`, HEAD đã commit `3bd83e5a`; TRI-06–10 đang trong working tree.

## Môi trường và phạm vi

Windows, Node 24.11.0; Next.js 16.3.8 / React 19.2.8 / Tailwind 4; NestJS 12 / Prisma 6.19.3. UI trên Edge: frontend 3011, HTTP fixture 3012. Fixture đọc `tmp/tri09/control.json`, không truy cập DB; dữ liệu lấy từ seed, không import vào source ứng dụng.

Backend HTTP tests chạy Nest/Supertest, kiểm tra status/body thực qua HTTP nhưng mock `PrismaService`. Phân biệt test này với HTTP fixture kiểm tra UI và API nối PostgreSQL thật. Không đánh dấu Pass DB/hiệu năng từ mock.

Tìm kiếm/sắp xếp, fetch, responsive và adapter phía Menu đã có bằng chứng. **Chưa đạt nghiệm thu end-to-end toàn bộ đồ án:** DB/backend thật, chi tiết/cart của Đông, auth thật và reduced-motion preference còn chờ kiểm chứng.

## Ma trận US-02 / US-03

Pass: đã chạy trong phạm vi bằng chứng. Blocked: chưa thể kiểm chứng. Không có lỗi chức năng Fail còn tái hiện trong các ca đã chạy.

| ID | Liên kết | Kiểm tra | Trạng thái | Bằng chứng / giới hạn |
| --- | --- | --- | --- | --- |
| API-01 | US-02 | HTTP 200, mảng bốn trường, price number | Pass | products.http.spec.ts: Nest/Supertest HTTP thật, mock Prisma |
| API-02 | US-02 | HTTP 200 với [] | Pass | HTTP test backend; fixture được gọi thực trả 200/[]; UI hiện Empty |
| API-03 | US-02 | Query lỗi trả 500 không lộ kết nối | Pass | Mock Prisma reject; HTTP body lỗi Nest chung, không [] |
| API-04 | US-02 | CORS, prefix /api và public catalog | Pass | HTTP test: origin 3001 được phép, thiếu prefix 404, không token vẫn 200 |
| API-05 | US-02 | PostgreSQL, migration/seed hai lần, bảo toàn User | Blocked | Thiếu env/DB; TCP 5433 ECONNREFUSED; Docker/psql không có PATH |
| API-06 | US-02 | Phản hồi dưới 500 ms | Blocked | Benchmark dự kiến 30 lần; warmup đầu ECONNREFUSED tại 3002, 0 request đo thành công |
| UI-01 | US-03 | UI lấy dữ liệu HTTP API | Pass | Frontend hiện 10 tên/giá đúng payload fixture, không source runtime hard-code |
| UI-02 | US-03 | Loading request chậm | Pass | hold: aria-busy true, 6 skeleton; giải phóng hold → 10 card |
| UI-03 | US-03 | Empty tách Error | Pass | 200 [] → Empty; 500 → Error chung, không lộ message fixture |
| UI-04 | US-03 | Mạng lỗi/response sai và retry | Pass | Đóng socket/envelope {data:...} → Error; Enter Thử lại → 10 món qua request mới |
| UI-05 | US-03 | Ảnh lỗi, tên dài, VND | Pass | 404 → fallback có nhãn; tên dài cả chuỗi liền giữ đủ tên, không tràn 375px; 0 ₫ và 2.147.483.647 ₫ |
| UI-06 | US-03 | Responsive 375/768/1440 | Pass | 1/2/3 cột; scrollWidth 360/753/1425 ≤ viewport; DOM và ảnh lưu |
| UI-07 | US-03 mở rộng | Tìm không dấu, hoa/thường, đ/Đ | Pass | CA PHE → Cà phê muối; TRA DAO → Trà đào; unit test NFD và Đ |
| UI-08 | US-03 mở rộng | Search + giá tăng/giảm, reset, count | Pass | Không khớp: 0/10; reset khôi phục API order; unit test frozen array/giá bằng nhau |
| UI-09 | US-03 | productId sau lọc/sắp xếp | Pass | Bộ nhận giả lập nhận UUID ...000002 và ...000003; TRI-07 kiểm tra ảnh/tên/nút cho 2 ID khác nhau |
| UI-10 | US-03 | Chi tiết thật, size/topping/cart/badge | Blocked | Đông chưa bàn giao component/route/store/API; /products khóa nút khi pending |
| A11Y-01 | US-03 | Bàn phím và focus | Pass | Tab search → select có outline/offset 4px; Enter reset/retry/chọn món hoạt động, không tương tác lồng nhau |
| A11Y-02 | US-03 | Tương phản các cặp màu Menu | Pass | Token CSS chạy: ink/surface 16.26, muted/card 9.40, CTA 20.72, secondary/card 6.47, error 7.24; chưa kiểm toán WCAG toàn app |
| A11Y-03 | US-03 | Reduced-motion CSS tải vào trang | Pass | CSSOM media reduce có animation-name none của skeleton, transition none của action |
| A11Y-04 | US-03 | Chạy với preference reduce | Blocked | OS/browser hiện false, công cụ không có emulation preference; đọc rule không chứng minh ca runtime này |
| AUTH-01 | Hồi quy | Login → /products, header, logout → / | Pass | HTTP auth fixture; tên tài khoản đúng; logout rồi mở Menu lại hiện Đăng nhập |
| AUTH-02 | Hồi quy | JWT/login/register backend/DB thật | Blocked | Token fixture không phải JWT thật; chưa có môi trường backend/DB |

`category` chưa có trong API: không triển khai/test danh mục hoặc suy đoán từ tên; đây là giới hạn mở rộng của TRI-08.

## Lệnh đã chạy

| Lệnh và cwd | Kết quả |
| --- | --- |
| node --test tests/*.test.mjs — frontend | Pass exit 0: 9 test, gồm 6 parser + 3 filter. Node cảnh báo MODULE_TYPELESS_PACKAGE_JSON, không test fail |
| npm run lint — frontend | Pass exit 0, không ESLint diagnostic |
| npm run build — frontend | Pass exit 0, compile/TypeScript; routes /, /_not-found, /products; preview đã gỡ |
| node --experimental-vm-modules node_modules/jest/bin/jest.js --runInBand — backend | Pass exit 0: 4 suite / 12 test, 47.885 s. NODE_PATH dùng binding Windows sẵn tại tmp/tri03/tools/node_modules; không đổi dependency |
| node test/products.benchmark.mjs http://localhost:3002/api/products 30 — backend | Blocked exit 1, fetch failed ECONNREFUSED; không số liệu ms |
| git diff --check — root | Pass; cảnh báo LF→CRLF theo Git Windows, không whitespace error |

Backend source không đổi trong TRI-08–10 nên không build/lint lại backend. Kết quả backend build/typecheck/lint trước đó ở [TRI-03](tri-products-api.md), không trình bày thành lần chạy mới.

## Bằng chứng và tái hiện

- `tmp/tri09/results.json`: assertion UI, giá, viewport, UUID, tương phản, giới hạn motion.
- `tmp/tri09/filtered-menu.jpg`, `edge-375.jpg`, `loading.jpg`, `empty.jpg`, `error.jpg`: ảnh thực tế. Ảnh responsive chụp nhanh có thể giữ scroll/khung vẽ cũ; số đo DOM là bằng chứng kích thước, ảnh edge-375 và filtered-menu chụp lượt sau để xác nhận bố cục.
- `tmp/tri07/results.json`, `receiver.jpg`: ảnh/tên/nút truyền đúng ID, unavailable khóa hành động; [bàn giao TRI-07](tri-menu-details-handoff.md).
- Hủy request khi rời Menu và không ghi đè response cũ đã kiểm tra TRI-06: [báo cáo](tri-menu-api-integration.md), `tmp/tri06/http-events.jsonl`. Fetch không sửa trong TRI-08–10; không chạy lại toàn bộ ca này.
- [Hướng dẫn fixture/demo](tri-menu-handoff.md#demo-trạng-thái-bằng-fixture-riêng) tái hiện bằng tool trong repo, không cần artefact tmp từ máy khác.

## Sửa lỗi và phần còn lại

TRI-09 thêm skeleton vùng điều khiển mới để giảm nhảy bố cục. Tool demo sửa nhận `--auth` khi output mặc định; lệnh sau sửa đã thành công.

Next.js dev cảnh báo ảnh card đầu là LCP nhưng lazy-load; chưa đo LCP production. Không dùng thời gian render/mock để suy ra API đạt 500 ms. Không đổi style auth toàn cục hoặc logic cart.

Các ca Blocked phải chạy lại khi DB/module Đông sẵn sàng. Review nhóm và chính sách catalog công khai còn chờ. Không commit/push lần này.
