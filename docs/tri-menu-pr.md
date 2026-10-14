# Nội dung PR đề xuất — để Tri review

Áp dụng cho các thay đổi Menu TRI-06–10 hiện có trong working tree. Nếu cập nhật PR hiện chứa TRI-04/05, giữ phần mô tả bố cục/card đã có và dùng nội dung hợp nhất bên dưới. Tài liệu này chưa cập nhật GitHub, chưa tạo commit hoặc push.

## Tiêu đề đề xuất

feat(menu): connect product catalog, add search and sorting, document handoff

## Nội dung đề xuất

Trang `/products` tải danh sách từ GET `/api/products`, hiển thị trạng thái loading/empty/error và cho phép retry. Menu có card responsive theo screen3, tên/ảnh/giá VND từ response đã kiểm tra contract; người dùng tìm tên không dấu và sắp xếp theo giá trên danh sách đã tải. Khi tìm không khớp, UI hiện trạng thái riêng và nút khôi phục danh sách.

Thống nhất NEXT_PUBLIC_API_URL cho auth/catalog và env mẫu. Bổ sung adapter ready/unavailable để ảnh, tên và nút chọn món truyền productId sang phần chi tiết của Đông. Module chi tiết/cart chưa được bàn giao nên app giữ trạng thái pending, không thêm vào giỏ hoặc điều hướng giả. Lọc category chưa triển khai vì response chưa công bố trường này.

README và tài liệu kèm theo có hướng dẫn DB/migration/seed, phân biệt route trang/API, ma trận US-02/US-03, các điểm bàn giao và demo trạng thái qua HTTP fixture riêng.

### Validation

- Frontend lint và build: Pass; chỉ có routes /, /_not-found, /products, không có route fixture trong build.
- Frontend native tests: 9 Pass, gồm parser và tìm kiếm/sắp xếp không sửa mảng gốc.
- Backend Jest: 4 suite / 12 test Pass, gồm HTTP Nest/Supertest với mock Prisma; không chứng minh DB thật.
- Edge với HTTP fixture: loading/empty/error/retry, ảnh lỗi/tên dài/VND, search đ/Đ/sort/reset, keyboard/focus, 375/768/1440 không tràn ngang, UUID sau lọc và login/logout UI fixture.

### Dependencies before full acceptance

- PostgreSQL/backend thật chưa kết nối; migration/seed và benchmark <500 ms còn Blocked.
- Đông cần cung cấp chi tiết/API/store cart; chưa xác nhận end-to-end chọn món/thêm giỏ.
- Auth thật, reduced-motion runtime và review nhóm còn chờ; CSS reduced-motion đã kiểm tra rule tải vào trang.

Chi tiết bằng chứng: [tri-menu-test-report.md](tri-menu-test-report.md). Điểm nối: [tri-menu-details-handoff.md](tri-menu-details-handoff.md). Demo/DoD: [tri-menu-handoff.md](tri-menu-handoff.md).

## Gợi ý commit

Review/stage theo phạm vi, bảo toàn các thay đổi TRI-06/07 đang có:

- `feat(menu): fetch product catalog with loading empty error and retry`
- `feat(menu): add product details adapter for Dong`
- `feat(menu): add Vietnamese search and price sorting`
- `docs(menu): record verification and handoff demo`

Không stage toàn bộ `tmp/`, dependency/generated files hoặc route preview. TRI-08 phụ thuộc catalog TRI-06 và các types TRI-07 đang chưa commit; nếu tách commit, commit các nền đó trước để mỗi mốc có đủ import và build được.
