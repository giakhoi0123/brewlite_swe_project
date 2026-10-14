# TRI-10 — Bàn giao Menu của Võ Minh Tri

Ngày 14/10/2026. Phạm vi Task 2–3, TRI-01–10. Hướng dẫn chạy môi trường thật ở [README](../README.md); kết quả và giới hạn nghiệm thu ở [TRI-09](tri-menu-test-report.md).

## Chức năng và ranh giới

Menu `/products` fetch GET `/api/products` qua URL API dùng chung với auth, kiểm tra contract bốn trường, có skeleton/empty/error/retry và ảnh fallback. Tìm kiếm tên không dấu, bao gồm đ/Đ, sắp xếp giá tăng/giảm chạy trên danh sách đầy đủ phía client. Mặc định giữ thứ tự API, giá bằng nhau giữ thứ tự tương đối; mảng gốc không bị sửa. Count hiển thị số khớp / số món tải được. Danh sách gốc [] và tìm không khớp có nội dung riêng, reset phục hồi cả query lẫn sort.

Khác biệt thiết kế có chủ đích: controls tại vùng danh sách để dùng được trên mobile; không tạo ô tìm kiếm header thứ hai, không hiển thị category/bán chạy/phổ biến khi thiếu dữ liệu. Dùng token TRI-01, layout 1/2/3 cột. UI không tính giá size/topping hoặc thêm nhanh vào giỏ.

“Chọn món” chỉ cấp callback khi adapter chi tiết ready. Hiện component/route/store của Đông chưa có, nên app thật khóa ảnh/tên/nút và giải thích chờ tích hợp. Không ghi nhận thêm thành công, không điều hướng 404, không có badge giả.

## Cấu trúc để tiếp tục phát triển

| File/module | Trách nhiệm |
| --- | --- |
| backend/prisma/schema.prisma, migrations, seed-products.ts | Product UUID, giá/tồn kho integer, CHECK SQL, 10 seed có id ổn định |
| backend/src/products | Nest module/controller/service GET danh sách; select bốn trường, thứ tự ổn định |
| frontend/src/lib/api.ts, products.ts, product-contract.ts | URL chung, fetch public, kiểm tra HTTP/JSON/contract |
| frontend/src/types/product.ts | Kiểu dữ liệu danh sách |
| frontend/src/app/products/page.tsx | Server page metadata và bố cục Menu |
| frontend/src/components/menu/menu-* | Header auth thật, hero/footer/token scope riêng |
| product-catalog.tsx | Fetch, abort/ignore request cũ, retry, trạng thái, state query/sort và adapter |
| product-catalog-controls.tsx, lib/product-filters.ts | Search/select/reset và hàm lọc/sắp xếp thuần |
| product-grid-skeleton.tsx | Placeholder controls/count/card, reduced-motion CSS |
| product-grid.tsx, product-card.tsx | Grid responsive, tên/ảnh/VND, callback chọn ID |
| types/product-details-adapter.ts | Interface ready/unavailable, opener nhận UUID |
| frontend/tests | Parser/filter tests, HTTP fixture và receiver kiểm thử; không import vào app thật |

Điểm nối Đông: Client Component chứa ProductCatalog và module chi tiết thật, truyền `detailsAdapter={{ status: 'ready', openProductDetails }}`. Callback nhận nguyên UUID. Đông cần cung cấp component/route, GET chi tiết (hoặc phối hợp người backend được nhóm chỉ định), size/topping, tính giá và cart/store selector. Badge tại MenuHeader chỉ nối khi selector thật và quy tắc đếm được chốt. Xem [interface và ví dụ kết nối](tri-menu-details-handoff.md); không tự gán API chi tiết cho phần API danh sách của Tri.

## Liên kết nghiệm thu US-02 / US-03

| Tiêu chí | Chức năng | Bằng chứng |
| --- | --- | --- |
| US-02 GET JSON danh sách | ProductsController/Service | TRI-09 API-01, API-04: HTTP Nest/Supertest |
| US-02 id/name/price/imageUrl | Prisma select, parser và Product type | API-01; 6 parser tests |
| US-02 lấy dữ liệu CSDL/mẫu | Prisma Product + seed | Code có; kiểm tra PostgreSQL thật Blocked API-05 |
| US-02 empty thành công | 200 [] | API-02 + UI-03 |
| US-02 lỗi/hiệu năng | Nest error chung, benchmark | API-03 Pass (mock DB); API-06 Blocked |
| US-03 gọi API khi mở Menu | ProductCatalog/fetchProducts | UI-01; HTTP fixture, không chứng minh DB thật |
| US-03 grid/ảnh/tên/giá/Add | ProductGrid/Card | UI-05/06/09; Add giữ pending, chi tiết/cart Blocked UI-10 |
| US-03 Loading/Empty | Skeleton và trạng thái | UI-02/03 |
| US-03 Error/retry | Kiểm tra HTTP/contract và nút Thử lại | UI-04 |
| US-03 responsive/accessibility | 1/2/3 cột, labels, keyboard, token tương phản | UI-06, A11Y-01/02/03; motion runtime Blocked A11Y-04 |
| Mở rộng TRI-08 | Search/sort/count/reset | UI-07/08 + 3 filter tests; category chưa công bố |
| Hồi quy auth | Cùng URL API, header/session/logout | AUTH-01 Pass UI fixture; AUTH-02 Blocked auth thật |

## Demo trạng thái bằng fixture riêng

Chỉ dùng khi phát triển/kiểm thử. Fixture không ghi DB hoặc xóa dữ liệu nhóm. URL 3012 là server fixture, không phải backend Nest. Tool demo dùng Node 24, lấy sản phẩm từ seed rồi ghi JSON trong workspace/tmp. Không dùng dữ liệu này để chứng minh kết nối DB hoặc hiệu năng API.

Từ thư mục `frontend`, tạo trạng thái và mở hai terminal:

```powershell
node tests/fixtures/menu-demo-control.mjs success
node tests/fixtures/products-api-server.mjs D:/brewlite_swe_project/tmp/tri09/control.json
```

```powershell
$env:NEXT_PUBLIC_API_URL = 'http://localhost:3012/api'
npm run dev -- --port 3011 --hostname 127.0.0.1
```

Mở `http://localhost:3011/products`. Trong terminal thứ ba cùng thư mục frontend, đổi trạng thái:

```powershell
node tests/fixtures/menu-demo-control.mjs loading
node tests/fixtures/menu-demo-control.mjs success
node tests/fixtures/menu-demo-control.mjs empty
node tests/fixtures/menu-demo-control.mjs error
node tests/fixtures/menu-demo-control.mjs network
node tests/fixtures/menu-demo-control.mjs invalid
node tests/fixtures/menu-demo-control.mjs edge
```

Chạy **mỗi lần một lệnh** phù hợp cảnh demo, không chạy cả khối liên tiếp. Sau loading/empty/error/network/invalid/edge, reload trang để có request mới. `loading` giữ request, chuyển `success` để giải phóng request đang chờ và xem card. `empty` trả HTTP 200 []; `error` trả 500; `network` đóng socket; `invalid` trả envelope sai contract; `edge` có tên dài/ảnh lỗi/giá 0 và giá Int tối đa. Error → chạy success → bấm Thử lại (không reload) để chứng minh retry.

Tùy chọn `success --auth` bật response auth giả lập cho kiểm tra giao diện bằng email `tri09@example.invalid` và mật khẩu thử `TestOnly123!`. Token là chuỗi fixture, không phải JWT; không dùng ca này để chứng minh xác thực thật. Fixture không lưu nội dung mật khẩu. Đăng xuất sau khi kiểm tra để không giữ phiên fixture; chạy lại `success` không cờ để tắt auth fixture.

Muốn kiểm tra adapter trước khi Đông bàn giao, mount route tạm theo [TRI-07](tri-menu-details-handoff.md#chạy-lại-kiểm-tra-tương-tác), chạy `/tri07-preview`. Đây là bộ nhận giả lập hiện UUID, không có size/topping/cart. Không dùng nó làm trang chi tiết thực tế.

Sau demo: dừng server/frontend bằng Ctrl+C, gỡ route preview tạm, xóa biến môi trường của terminal chạy fixture (`Remove-Item Env:NEXT_PUBLIC_API_URL`) hoặc đóng terminal. Chạy lại frontend theo README để quay về API 3002; không để URL fixture trong .env.local/production build. Không chạy đồng thời hai tiến trình Next trên cùng thư mục .next; dừng frontend thật trước khi đổi sang demo, hoặc dùng checkout phát triển riêng.

## Kịch bản demo khoảng 3 phút

Chuẩn bị trước terminal điều khiển fixture và các viewport 375/768/1440. API thật chỉ demo khi DB đã chạy và response được kiểm chứng; nếu chưa sẵn sàng, nói rõ Blocked và giới thiệu phiên kiểm thử HTTP fixture.

| Thời gian | Thao tác và nội dung trình bày |
| --- | --- |
| 0:00–0:35 | Mở Menu, gọi curl API thật và đối chiếu tên/giá với UI khi môi trường sẵn sàng. Nếu DB chưa có, công bố giới hạn rồi dùng fixture riêng; không gọi đó là dữ liệu DB thật |
| 0:35–1:00 | Tìm ca phe / TRA DAO, đổi giá tăng/giảm, xem count, xóa bộ lọc khôi phục danh sách |
| 1:00–1:20 | Trên frontend fixture: loading rồi reload → skeleton; chạy success để request đang chờ trả card |
| 1:20–1:35 | empty + reload → thông báo chưa có đồ uống; nhấn mạnh đây là 200 [] và không xóa DB |
| 1:35–2:00 | error + reload → Error; success rồi Thử lại → danh sách khôi phục |
| 2:00–2:25 | Chọn hai món khi module Đông có, kiểm tra đúng chi tiết. Hiện chưa có: chỉ demo bộ nhận UUID ở route kiểm thử và giải thích app thật vẫn pending; không trình bày như cart đã hoạt động |
| 2:25–3:00 | Viewport 375/768/1440: grid 1/2/3, không tràn ngang; thao tác keyboard/reset, giới thiệu logout và các ca còn Blocked |

## Definition of Done và phần còn chờ

- [x] Response tối thiểu, giá integer VND, empty HTTP 200 và lỗi chung có HTTP tests.
- [x] Menu lấy API, phân biệt Loading/Success/Empty/Error; retry thật, không sản phẩm hard-code runtime.
- [x] Card ảnh/tên/giá, fallback, responsive; callback UUID và adapter có receiver test.
- [x] Search không dấu/sort/count/reset, không thay đổi mảng gốc; bỏ category khi thiếu contract.
- [x] Frontend lint/build, 9 frontend test và 12 backend test đã chạy; ma trận bằng chứng có giới hạn rõ.
- [x] README, hướng dẫn fixture, demo và nội dung PR/gợi ý commit có để review.
- [ ] PostgreSQL thật: migration/seed hai lần/bảo toàn User, HTTP nối DB và benchmark dưới 500 ms.
- [ ] Component/API chi tiết và cart của Đông: mở đúng dữ liệu hai món, xác nhận thêm thật, badge selector thật.
- [ ] Auth backend thật và reduced-motion runtime được kiểm chứng.
- [ ] Nhóm review contract, chính sách public catalog, token/UX và integration.

Tài liệu bàn giao đã soạn theo hiện trạng và bằng chứng, không đồng nghĩa các ca còn chờ đã hoàn thành. Không tự commit/push hoặc cập nhật PR trong TRI-10; nội dung đề xuất ở [tri-menu-pr.md](tri-menu-pr.md).
