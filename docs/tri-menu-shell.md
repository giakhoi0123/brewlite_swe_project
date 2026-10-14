# TRI-04 — Khung giao diện Menu

Ngày kiểm tra: 12/10/2026. Branch: `feature/vo-minh-tri-menu-products`.

## Cập nhật repository

Trước khi triển khai, `git status --short --branch` chỉ có `tmp/` chưa tracked. Sau `git fetch origin`, phát hiện `origin/main` đã merge PR #4 tại `15374e72`; branch của Tri vẫn ở `5e4900f6`. Đã chạy `git pull --ff-only origin main`, cập nhật branch tới `15374e72` mà không tạo merge commit mới hoặc ghi đè thay đổi cục bộ.

Đã đọc `frontend/AGENTS.md` và guide Next.js cục bộ trong `frontend/node_modules/next/dist/docs/01-app/01-getting-started/`: `03-layouts-and-pages.md`, `04-linking-and-navigating.md`, `05-server-and-client-components.md`, `11-css.md`. Cài dependency bằng `npm ci --no-audit --no-fund` theo lockfile. Giữ Next.js 16.3.8, React 19.2.8 và Tailwind v4 hiện có; không sửa dependency hoặc lockfile.

## Phạm vi và file thay đổi

| File | Trách nhiệm |
| --- | --- |
| [products/page.tsx](../frontend/src/app/products/page.tsx) | Server Component ghép khung Menu, metadata, ngôn ngữ Việt, breadcrumb, skip link và vùng danh sách |
| [menu-header.tsx](../frontend/src/components/menu/menu-header.tsx) | Client Component đọc auth store hiện có, chờ hydration riêng phần tài khoản, đăng nhập/đăng xuất và thông tin user |
| [menu-hero.tsx](../frontend/src/components/menu/menu-hero.tsx) | Hero espresso và liên kết cuộn tới vùng danh sách |
| [menu-footer.tsx](../frontend/src/components/menu/menu-footer.tsx) | Footer thương hiệu và liên kết tới route đang tồn tại |
| [menu-brand.tsx](../frontend/src/components/menu/menu-brand.tsx) | Nhãn thương hiệu và biểu tượng SVG dùng chung giữa header/footer |
| [menu.module.css](../frontend/src/components/menu/menu.module.css) | Token `--menu-*` scoped, khung 1200px, typography, CTA, focus và reduced motion |
| `docs/tri-menu-shell.md` | Khác biệt thiết kế, bằng chứng kiểm tra và phụ thuộc |

Menu cho khách xem trực tiếp `/products`. Header tiếp tục dùng `useAuthStore`, `clearSession()` và `router.push('/')`. Tên/email hiển thị từ user trong store; điểm chỉ hiển thị nếu là số nguyên không âm hợp lệ, không có giá trị mẫu dự phòng. Auth store, trang auth và root layout không bị sửa. Thông tin từ localStorage vẫn không phải bằng chứng xác thực phía server.

## Thiết kế áp dụng và khác biệt có chủ đích

Đã đọc `DESIGN.md`, `code3.html` và xem `screen3.png` tại thư mục thiết kế đã ghi trong [contract TRI-01](tri-menu-contract.md). Giữ canvas `#fcf9f3`, inset/footer `#f6f3ed`, card trắng, hero `#2b1810`, CTA `#070100`, accent `#8e4d2a`, hero text phụ `#e2bfb2`; radius panel 12px/pill 9999px. Dùng Inter/Plus Jakarta Sans đã nạp ở root. Header nền `rgba(252,249,243,.85)`, blur 12px. Token chỉ nằm trong CSS Module của Menu; không thay `:root`, CSS auth hoặc utility radius toàn cục.

- Giữ cấu trúc header → breadcrumb → hero → vùng danh sách → footer của screen3. Padding ngang 16/24/40px, max-width 1200px; font tiêu đề 32/40px mobile và 40/48px từ tablet.
- Hero dùng nội dung tiếng Việt và CTA “Xem thực đơn” cuộn tới vùng danh sách. Bỏ số liệu rang mộc/giá/đánh giá mẫu, thông tin JWT/session và dữ liệu cá nhân khỏi lời giới thiệu.
- Navigation chỉ chứa route hiện có. Không giả có trang chủ thương mại, khuyến mãi, giới thiệu, chính sách hoặc địa chỉ/giờ mở cửa từ export. Footer rút gọn còn thương hiệu, Thực đơn và Tài khoản; không có form newsletter chưa hoạt động.
- Header giữ dữ liệu tài khoản thật, bỏ avatar mẫu và cart badge mẫu. Mobile cho thông tin tài khoản xuống hàng; tên/email dài được xuống dòng thay vì làm tràn layout.
- Chưa dựng ProductCard/ProductGrid, chưa fetch API, chưa có search/filter/sort hoặc chi tiết/cart. Vùng danh sách hiển thị thông báo tạm “Thực đơn đang được chuẩn bị”, không giả danh sách sản phẩm, số kết quả, loading hoặc trạng thái API rỗng.
- Không dùng Tailwind CDN, font/icon CDN bổ sung, script DOM, inline onclick hoặc HTML export làm trang chạy thật.

## Kiểm chứng thực tế

Môi trường: Windows, Node.js v24.11.0, Edge; kiểm tra bản production bằng `npm run start -- --port 3001`.

| Kiểm tra | Kết quả thực tế |
| --- | --- |
| `npm run lint` trong `frontend/` | PASS, exit 0, không có diagnostic |
| `npm run build` trong `frontend/` | PASS khi chạy với quyền mạng; compile, TypeScript, prerender `/` và `/products` thành công. Lần đầu trong sandbox lỗi tải Inter/Plus Jakarta Sans từ Google Fonts, chưa phải lỗi code |
| Guest Menu 375px | PASS: kiểm tra hình ảnh, title 32px; `scrollWidth = clientWidth = 360px` khi scrollbar chiếm 15px |
| Guest Menu 768px | PASS: kiểm tra hình ảnh, title 40px, footer chuyển hàng ngang; `scrollWidth = clientWidth = 753px` |
| Guest Menu 1440px | PASS: kiểm tra hình ảnh và DOM, container 1200px; `scrollWidth = clientWidth = 1425px` trước khi công cụ ảnh thay đổi scrollbar |
| Header với tên/email dài 375/768/1440px | PASS với user fixture: không tràn ngang, button logout cao 44px. 375px đo width 360px; 768/1440px đo scrollWidth bằng clientWidth 768/1440px sau reload của công cụ |
| Bàn phím | PASS: Tab đầu tới skip link có outline; Enter đưa focus tới `main#menu-content`. Tab tới “Xem thực đơn” có outline sáng; Enter tới `#menu-catalog`, vùng danh sách nằm dưới header |
| Vùng bấm | PASS: các link chính và logout đo được cao 44px; skip link cao 48px |
| Đăng nhập → Menu, hiển thị user và điểm | PASS ở mức UI với phản hồi API mẫu tạm thời; dữ liệu header đúng fixture, có chuyển `/products` và giữ dữ liệu qua reload |
| Đăng xuất | PASS ở mức UI: click Đăng xuất về `/`; mở/reload `/products` lại hiển thị Đăng nhập, không còn user fixture |
| Hồi quy style auth | PASS ở mức quan sát sau điều hướng: auth panel vẫn `rgb(246,243,237)`, card radius 24px, không kế thừa `--menu-primary`; quan sát bố cục desktop không bị style Menu ghi đè |
| Console Menu | Không có error/warn trong log công cụ tại thời điểm kiểm tra |

User fixture dùng tên/email dài, 1234 điểm và token không phải JWT thật. Server fixture chỉ tồn tại tại `tmp/tri04/auth-fixture.mjs`, trả phản hồi cho `/api/auth/login` để kiểm tra UI; không được import bởi ứng dụng, không commit, không sửa seed hay tài khoản DB. Đã đăng xuất fixture sau kiểm tra. Chưa kiểm chứng lại đăng nhập với NestJS/PostgreSQL thật, đăng ký hoặc xác thực JWT; không suy ra các chức năng đó PASS từ fixture.

Ảnh bằng chứng cục bộ nằm trong `tmp/tri04/` (không commit): `menu-375.jpg`, `menu-768.jpg`, `menu-1440.jpg`, `menu-auth-375.jpg`, `menu-auth-768.jpg`, `menu-auth-1440.jpg`, `auth-after-navigation.jpg`. Một số lần chụp full-page bị timeout CDP; ảnh viewport và kiểm tra DOM sau reload đã thực hiện được. Viewport thử nghiệm đã trả về mặc định.

Không thêm framework test hoặc test tự động cho khung tĩnh này. Reduced motion được khai báo bỏ transition CTA; chưa kiểm chứng bằng giả lập media trong trình duyệt. Kết quả responsive chỉ áp dụng cho khung hiện tại, chưa chứng minh grid/card ở task sau.

## Phần còn phụ thuộc

- TRI-05: ProductCard/ProductGrid và xử lý ảnh/tên/giá.
- TRI-06: dữ liệu API thật và đủ loading/success/empty/error/retry. Khung TRI-04 chưa gọi `/api/products`.
- TRI-07 và Đông: điểm chọn món, chi tiết và cart store/badge thật.
- TRI-08: search/category/sort khi được giao và dữ liệu hỗ trợ.
- Review nhóm và hồi quy auth với backend/DB thật còn chờ. Task này chỉ hoàn thiện khung Menu, chưa nghiệm thu toàn bộ US-03.
