# TRI-01: Hợp đồng dữ liệu và thiết kế Menu BrewLite

Ngày khảo sát: 06/10/2026. Người phụ trách: Võ Minh Tri.
Branch: `feature/vo-minh-tri-menu-products`. Mốc code khảo sát: `25b572b0`.

## 1. Phạm vi và cách đọc

TRI-01 chỉ tạo tài liệu thiết kế kỹ thuật cho Task 2 (API danh sách sản phẩm) và Task 3 (trang Menu). Các quyết định dưới đây chưa phải chức năng đã triển khai hoặc đã được nhóm nghiệm thu.

- **Đã có trong code**: kết luận từ việc đọc repository, có đường dẫn làm bằng chứng; không đồng nghĩa đã kiểm thử chạy thực tế.
- **Yêu cầu tài liệu**: tiêu chí từ đề bài, phân công hoặc yêu cầu TRI-01.
- **Đề xuất**: lựa chọn kỹ thuật cho lần triển khai tiếp theo. Các điểm liên quan chính sách và module của thành viên khác cần thống nhất với nhóm.

Nguồn đã đối chiếu:

- `C:/Users/VÕ MINH TRI/Downloads/Phân việc SWE-Brewlite.pdf`, trang PDF 4-6: mục Tri, US-02, US-03. Tri phụ trách danh sách và hiển thị; Đông phụ trách chi tiết và giỏ hàng.
- `C:/Users/VÕ MINH TRI/Downloads/BrewLite-CongNghePhanMem.pdf`, mục 4-8, 10 và 12: luồng xem menu trước đăng nhập, tiêu chí Task 2-3, các endpoint và thực thể tối thiểu.
- `C:/Users/VÕ MINH TRI/Downloads/stitch_brewlite_menu2/DESIGN.md`, `screen3.png`, `code3.html`: chuẩn Menu. Đã xem ảnh và đọc HTML như dữ liệu tham khảo, không chạy script export.
- `screen4.png`, `code4.html` trong cùng thư mục: tham khảo kết nối chi tiết/cart, không thay chuẩn Menu. `screen2/code2` thuộc chi tiết và `screen/code` thuộc auth.

Các tài liệu thiết kế nằm ngoài repo; đường dẫn trên là vị trí nguồn trên máy của Tri.

## 2. Hiện trạng repository

**Đã có trong code:**

| Thành phần | Phiên bản/cấu trúc được khảo sát | Bằng chứng |
| --- | --- | --- |
| Frontend | Next.js 16.3.8, React/React DOM 19.2.8, Tailwind CSS 4.3.3, Zustand 5.0.15, TypeScript 5.9.3 | `frontend/package.json`, `frontend/package-lock.json` |
| Backend | NestJS core 12.1.2, Prisma/client 6.19.3, TypeScript 6.0.3 | `backend/package.json`, `backend/package-lock.json` |
| Database | PostgreSQL image `15-alpine`; cổng host mặc định 5433, container 5432 | `docker-compose.yml` |
| Module dữ liệu | `PrismaModule` global, xuất `PrismaService`; schema chỉ có `User`, id UUID; seed chỉ có tài khoản demo | `backend/src/prisma.module.ts`, `backend/src/prisma.service.ts`, `backend/prisma/schema.prisma`, `backend/prisma/seed.ts` |
| Module nghiệp vụ | `AuthModule`; chưa có ProductsModule, model Product, API danh sách/chi tiết, cart store hay route chi tiết | `backend/src/app.module.ts`, cây `backend/src` và `frontend/src` |
| Giao diện | `/` là auth; `/products` là placeholder với thông tin người dùng và đăng xuất | `frontend/src/app/page.tsx`, `frontend/src/app/products/page.tsx` |
| Theme | CSS biến toàn cục chủ yếu phục vụ auth; Tailwind v4 qua PostCSS; font Inter và Plus Jakarta Sans được nạp ở root layout | `frontend/src/app/globals.css`, `frontend/postcss.config.mjs`, `frontend/src/app/layout.tsx` |

Phiên bản bảng trên lấy từ lockfile, không phải xác nhận phiên bản một server đang chạy. Docker Compose hiện chỉ chạy DB. Chưa thấy thư mục Prisma migrations; scripts hiện có `prisma:generate`, `prisma:push`, `prisma:seed`. TRI-01 không thay đổi schema, seed, framework hoặc dependency.

`frontend/AGENTS.md` đã được đọc: trước khi viết frontend cần đọc guide Next.js tương ứng tại `frontend/node_modules/next/dist/docs/`. Task này chỉ viết Markdown, chưa viết frontend.

## 3. Đối chiếu US-02 và US-03

Các hàng dưới là **yêu cầu tài liệu**, cột hiện trạng là **đã có trong code**, cột hướng thực hiện là **đề xuất**.

| Tiêu chí | Hiện trạng | Hướng thực hiện theo contract |
| --- | --- | --- |
| US-02: GET /products trả JSON danh sách | Chưa có endpoint | GET `/api/products`, trả mảng trực tiếp |
| US-02: có id, name, price, imageUrl | Chưa có model/response Product | Bốn trường bắt buộc theo mục 5 |
| US-02: lấy từ dữ liệu mẫu hoặc CSDL | Chỉ seed User | Chọn PostgreSQL qua Prisma, seed dữ liệu phát triển; UI lấy từ API |
| US-02: thành công khi có dữ liệu; xử lý danh sách rỗng | Chưa triển khai | HTTP 200 với `Product[]`; rỗng là `[]` |
| US-03: mở Menu gọi GET /products | `/products` không fetch sản phẩm | Fetch endpoint trên, dữ liệu API là nguồn duy nhất |
| US-03: grid, ảnh, tên, giá, nút Add | Có placeholder, chưa có card/grid | Grid 1/2/3 cột, card theo screen3; Add mở bước chọn món của Đông |
| US-03: loading skeleton | Chỉ có loading chống hydration mismatch của auth state | Skeleton cho request sản phẩm, phân biệt với hydration |
| US-03: empty state | Chưa có | Chỉ hiện khi response hợp lệ là `[]` |
| US-03: responsive/mobile | Chưa có Menu để đánh giá | Khung tối đa 1200px, các breakpoint ở mục 7 |
| US-03: dữ liệu UI từ API, không hard-code | Chưa có dữ liệu Menu | Không đưa danh sách trong HTML export thành nguồn runtime |

**Yêu cầu tài liệu:** đề bài đặt mục tiêu phản hồi API dưới 500 ms với dữ liệu mẫu. Chưa có API để đo; đây là mục tiêu cần kiểm chứng khi triển khai, không phải kết quả TRI-01.

## 4. Route, API URL và auth

### 4.1 Đã có trong code

- Route Menu hiện có: `/products` tại [products/page.tsx](../frontend/src/app/products/page.tsx); route `/` render `AuthPage`. Đăng nhập thành công gọi `setSession(user, accessToken)` rồi `router.push('/products')` tại [auth-page.tsx](../frontend/src/components/auth/auth-page.tsx). Đăng ký thành công chuyển form về đăng nhập.
- Backend dùng `app.setGlobalPrefix('api')` tại `backend/src/main.ts`. Route controller `products` sau này tương ứng `/api/products`; `/products` trong đề bài là tên endpoint chưa tính global prefix.
- Auth frontend dùng `process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api'`, rồi nối `/auth/login` hoặc `/auth/register` tại `frontend/src/components/auth/auth-page.tsx`. Chưa có cấu hình API dùng chung.
- `.env.example` ở root có `FRONTEND_API_URL=http://localhost:3002/api`, `PORT=3002`; tên biến đầu tiên không khớp biến mà frontend đọc. File root `.env` cũng không tự được Next.js ở `frontend/` đọc vào client.
- `backend/.env.example` có `PORT=3002`, `FRONTEND_ORIGIN=http://localhost:3001`. Backend mặc định 3000 nếu không có PORT; `main.ts` nạp `../.env` theo cwd. Chưa xác nhận giá trị môi trường đang chạy.
- CORS cho phép `FRONTEND_ORIGIN`, `http://localhost:3000`, `http://localhost:3001`. ValidationPipe dùng whitelist, forbidNonWhitelisted và transform.
- `useAuthStore` lưu `user`, `token` trong localStorage với key `brewlite-auth` qua Zustand persist. `remember` trong auth form chưa thay đổi cách persist. `clearSession()` xóa dữ liệu phiên trong store; đăng xuất điều hướng về `/`.
- Có `JwtAuthGuard` và JWT strategy đọc Bearer token, kiểm tra expiration. Chưa thấy guard global hoặc `@UseGuards` được gắn vào route hiện tại.
- `/products` cho khách xem và có nút Sign In; kiểm tra `mounted` để đọc state phía client, không xác minh JWT. Banner “Session Authenticated” vẫn xuất hiện cho khách nên không được xem là bằng chứng xác thực.

### 4.2 Đề xuất chốt cho Menu

| Quyết định | Contract đề xuất |
| --- | --- |
| Route trang | Giữ `/products`; giữ `/` cho auth và redirect sau đăng nhập hiện có |
| API base URL client | `NEXT_PUBLIC_API_URL` bao gồm `/api`, ví dụ `http://localhost:3002/api`; đặt trong `frontend/.env.local` khi phát triển. Nối `/products` đúng một lần, xử lý dấu `/` cuối base URL |
| Địa chỉ phát triển | Frontend đề xuất `http://localhost:3001`, backend `http://localhost:3002`; khớp CORS mẫu. Đây là cấu hình đề xuất, cần cung cấp env và cổng chạy thực tế |
| Điểm lệch env | Khi task kết nối API được thực hiện, thống nhất tên biến frontend và mẫu env; không dựa vào `FRONTEND_API_URL` để client đọc được |
| Cách fetch | Ưu tiên client fetch qua cấu hình API dùng chung, phù hợp trang client hiện có, skeleton và retry; không thêm thư viện fetch chỉ cho danh sách nhỏ |
| Khách chưa đăng nhập | Cho phép xem `/products` và GET `/api/products`, không bắt buộc token, không gửi Bearer cho API danh sách |
| Auth khi xem Menu | Header lấy user thật từ store, khách có đăng nhập; logout vẫn dùng `clearSession()` và về `/`. Không coi user trong localStorage là xác thực phía server |

**Yêu cầu tài liệu:** luồng nghiệp vụ xem menu, chọn món, giỏ hàng rồi mới đăng nhập nếu chưa có; Task 7 yêu cầu guard cho đặt đơn.

**Đề xuất cần đối chiếu chính sách nhóm:** Menu/API danh sách công khai phù hợp luồng trên và hành vi trang hiện tại, nhưng hiện chưa có API danh sách để xác nhận chính sách server. Khôi/team leader cần xác nhận phân biệt public catalog với route đặt đơn/lịch sử cần JWT. TRI-01 không đổi auth hoặc áp guard lên API khác.

## 5. Contract API danh sách

**Đã có trong code:** chưa có quy ước envelope response chung. Auth trả `{ user, accessToken }`, endpoint hello trả chuỗi; chưa có interceptor bao response.

**Yêu cầu tài liệu:** mỗi sản phẩm tối thiểu có `id`, `name`, `price`, `imageUrl`; trả JSON và xử lý được danh sách rỗng.

**Đề xuất:**

- Method/path thực tế: `GET /api/products`.
- Không yêu cầu body hoặc token; phiên bản đầu chưa có query tìm kiếm, phân trang hoặc lọc.
- HTTP 200, `Content-Type: application/json`, body là mảng `Product[]` trực tiếp, không có `{ data: ... }`.
- Thứ tự ổn định: `name ASC`, rồi `id ASC` làm tiêu chí phụ. Không gọi thứ tự này là bán chạy/phổ biến.
- Trả toàn bộ danh sách mẫu nhỏ; không suy ra còn hàng từ việc xuất hiện trong catalog. Quyết định tồn kho tại đặt đơn thuộc module khác.

Kiểu dữ liệu dưới là hợp đồng đề xuất, chưa phải file TypeScript được tạo:

```ts
type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
};
```

| Trường bắt buộc | Kiểu và ràng buộc đề xuất | Ý nghĩa |
| --- | --- | --- |
| `id` | String UUID ổn định, duy nhất; chọn nhất quán User hiện có | ProductId dùng xuyên suốt menu/chi tiết/cart; không dùng index hoặc id `PROD_01` từ demo |
| `name` | String không rỗng sau trim | Tên đồ uống; ưu tiên nội dung tiếng Việt |
| `price` | JSON number, số nguyên không âm, nằm trong giới hạn Prisma Int (0..2147483647) | Giá cơ bản theo đồng Việt Nam; `29000`, không phải `"29.000đ"`, không nhân/chia 100 |
| `imageUrl` | String không rỗng; URL HTTP(S) ảnh hoặc đường dẫn từ `/` đến asset frontend đã cung cấp | Ảnh sản phẩm; seed phải có nguồn xác định, frontend có fallback khi ảnh tải lỗi |

Giá cơ bản chưa ngầm chọn size/topping: không ghi “Size M chuẩn” hoặc phụ phí từ bản export nếu Đông chưa cung cấp quy ước. Đông sở hữu tính giá tùy chọn; backend đơn hàng xác nhận giá cuối, không tin giá client. UI format `price` bằng `Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })` khi render.

Ví dụ minh họa cấu trúc, không phải dữ liệu đã có trong DB hoặc response đã chạy:

```json
[
  {
    "id": "3f624f3a-4c26-4b74-b5d1-0d9fb0df5221",
    "name": "Bạc xỉu",
    "price": 29000,
    "imageUrl": "/images/products/bac-xiu.jpg"
  }
]
```

Đường dẫn ảnh ví dụ chưa tồn tại và cần được cung cấp khi chuẩn bị dữ liệu. Không sao chép ví dụ thành danh sách hard-code trên Menu.

### 5.1 Dữ liệu mở rộng và ranh giới response

**Đề xuất:** lần đầu chỉ công bố bốn trường trên; query select rõ trường, không tự trả toàn bộ model.

| Trường | Vai trò | Quyết định đề xuất cho phiên bản đầu |
| --- | --- | --- |
| `category` | Lọc và nhãn danh mục | Mở rộng, chưa công bố. Cần enum/id/tên do nhóm chốt; không đoán từ tên sản phẩm |
| `description` | Mô tả card/chi tiết | Mở rộng, không bắt buộc US-02/03; ẩn vùng mô tả nếu chưa có |
| `stock` | Kiểm soát tồn kho | Có trong thực thể Product tối thiểu của đề bài; đề xuất số nguyên không âm ở DB, không thuộc response catalog đầu tiên. Điệp sở hữu kiểm soát đồng thời |
| `badge` | Nhãn nổi bật | Mở rộng; chỉ hiện khi có dữ liệu/quy tắc thật |
| rating, reviewCount, discount, size/topping | Đánh giá, khuyến mãi và tùy chọn | Không thuộc response tối thiểu; không dùng con số demo như dữ liệu thật |

Stock cần cho model nghiệp vụ không có nghĩa stock là trường bắt buộc công khai của US-02. Khi mở rộng response, cập nhật contract và kiểu dữ liệu hai phía trước khi dùng UI phụ thuộc trường đó.

### 5.2 Danh sách rỗng và lỗi

**Đề xuất:**

- Thành công có dữ liệu: HTTP 200 với mảng đúng contract.
- Thành công không có dữ liệu: HTTP 200 với `[]`, không trả 404, 204 hoặc null.
- Query/DB lỗi: HTTP 500 theo cơ chế exception mặc định NestJS hiện có; không biến lỗi thành `[]`, không lộ chi tiết DB/connection cho client. Backend ghi log phù hợp khi triển khai.
- Frontend kiểm tra `response.ok` và cấu trúc mảng/trường bắt buộc. Response sai định dạng là error; không lọc âm thầm thành empty.
- Ảnh tải lỗi sau khi response hợp lệ: fallback ảnh ở card, giữ tên và giá; khác với lỗi request danh sách.

| Trạng thái Menu | Điều kiện đề xuất | Hành vi |
| --- | --- | --- |
| Loading | Request chưa xong | Skeleton cùng khung card; reduced motion bỏ shimmer |
| Success | HTTP thành công, mảng hợp lệ có phần tử | Render dữ liệu API, số kết quả là độ dài danh sách |
| Empty | HTTP thành công, mảng hợp lệ `[]` | Thông báo chưa có đồ uống; không giả sản phẩm |
| Error | Mạng lỗi, HTTP lỗi, JSON/contract không hợp lệ | Thông báo tải thất bại; Thử lại gọi API thật |

Request mới/retry cần hủy hoặc bỏ kết quả request cũ để tránh ghi đè; không thêm delay giả hoặc nút giả lập trên trang thật. Đây là thiết kế vòng đời dữ liệu, chưa triển khai trong TRI-01.

## 6. Bàn giao cho Đông

**Đã có trong code:** chưa có component/route chi tiết, cart store hoặc selector badge; `useAuthStore` chỉ có dữ liệu auth. Hàm `openCustomModal`, `quickAddToCart`, cart tray trong code3 và panel tùy chỉnh code4 chỉ là demo export.

**Yêu cầu tài liệu:** Đông sở hữu Task 4-5: chi tiết, size/topping, tính giá, cart. API `GET /products/:id` có trong endpoint tối thiểu của đề bài nhưng không nằm trong tiêu chí API danh sách Task 2 của Tri.

**Đề xuất điểm bàn giao:**

| Điểm kết nối | Contract đề xuất | Bên cung cấp / trạng thái |
| --- | --- | --- |
| Chọn từ card | `onSelectProduct(productId: string): void`; truyền nguyên UUID từ response. Click ảnh/tên và nút Add cùng gọi điểm kết nối này | Tri cung cấp callback ở Menu khi triển khai; hiện chưa có |
| Mở chi tiết | Ưu tiên modal/drawer do Đông cung cấp trên `/products`, nhận `productId`; mobile mở cùng component với bố cục phù hợp | Đông cung cấp component/interface; cần xác nhận hình thức này |
| Nút Add | Nhãn tiếng Việt “Chọn món”; mở chọn size/topping trước khi xác nhận thêm. Không thêm nhanh chỉ với giá list | Đông xử lý thêm vào cart sau xác nhận; thay có chủ đích so với “Thêm vào giỏ” trong demo |
| Phương án route | Nếu Đông chốt trang `/products/[productId]` thay modal, cập nhật adapter điều hướng; chỉ nối khi route thực sự tồn tại | Cần thống nhất với Đông, không tạo route trong TRI-01 |
| GET chi tiết | Path thực tế `/api/products/:id`; dữ liệu lựa chọn/giá do module chi tiết định nghĩa | Đề xuất Đông cung cấp API hoặc phối hợp thành viên backend được nhóm chỉ định. Chưa được xác nhận; không tự gán thành task bắt buộc của Tri |
| Cart badge | Đọc selector từ cart store thật của Đông; đề xuất đếm `sum(item.quantity)` theo interface được Đông xác nhận | Store/selector/import path chưa tồn tại; không tạo cart store thứ hai |
| Cart tray/tổng tiền | Chỉ tích hợp UI/selector/module do Đông bàn giao | Đông sở hữu; không tự tính tổng trong Menu |

Nếu chi tiết chưa bàn giao lúc làm Menu: giữ giao diện callback/adapter và thông báo trung thực rằng tính năng chọn món đang chờ tích hợp; vô hiệu hóa hành động chưa sẵn sàng kèm giải thích. Không hiện toast thêm thành công, cart badge/tổng tiền giả hoặc điều hướng route chắc chắn 404. Chưa tính đạt luồng chọn món end-to-end cho đến khi tích hợp thật.

Cart badge tạm ẩn khi chưa có store thật; khi có store, hiển thị số lượng thật và nhãn truy cập được. Cart store cần xác nhận tên field số lượng, cách hydrate/persist và hành vi badge bằng 0 trước khi nối. Menu không quản lý số lượng, gom món hoặc size/topping.

## 7. Chuẩn thiết kế và bộ token

**Yêu cầu tài liệu:** `screen3.png`/`code3.html` là chuẩn Menu. `screen4/code4` chỉ tham khảo tích hợp; không dựng panel chi tiết, header dữ liệu cá nhân mẫu hoặc grid 4 cột theo screen4.

**Đã có trong nguồn tham khảo:** screen3 có header, breadcrumb, hero nền espresso, điều khiển tìm kiếm/lọc, lưới 3 cột desktop, footer; card có tên, giá và nút dạng pill. code3 đặt khung ảnh `h-56` (224px cố định), card `rounded-xl` (12px), ảnh `rounded-lg` (8px). Bản export có cả đánh giá, favorite, phụ phí, cart và script demo.

### 7.1 Điểm lệch cần tránh

| Thuộc tính | DESIGN.md | code3 / code hiện tại | Đề xuất lựa chọn |
| --- | --- | --- | --- |
| Primary | YAML `#070100`, phần mô tả gọi `#2B1810` là primary | code3 primary `#070100`, primary-container `#2b1810`; auth espresso `#2b1810` | Menu primary `#070100`, hero/container `#2b1810`; giữ nghĩa riêng |
| Secondary | YAML `#8e4d2a`, mô tả `#C87D55` | code3 `#8e4d2a`; auth caramel `#c87d55` | Menu secondary `#8e4d2a`; không đổi auth caramel |
| Tertiary | YAML `#060100`, mô tả `#D49B74` | Auth foam `#d49b74` | Tertiary không cần trong Menu tối thiểu; không lấy foam làm tertiary tự động |
| Canvas/inset | YAML `#fcf9f3`/`#f6f3ed`, mô tả `#F9F6F0`/`#F4EFEB` | code3 `#fcf9f3`/`#f6f3ed` | Dùng màu code3 |
| Card/border | Mô tả `#FFFDF9`/`#E8DFD5`; YAML lowest `#ffffff`, outline-variant `#d3c3be` | code3 card trắng và các lớp surface/outline riêng | Card `#ffffff`; viền nhẹ lấy outline-variant có opacity, không trộn viền auth |
| Radius | YAML DEFAULT 8px, lg 16px, xl 24px; mô tả radio/checkbox còn khác nhau | code3 DEFAULT 4px, lg 8px, xl 12px | Dùng kích thước code3 cho Menu, đặt tên semantic để không nhầm utility v4 |
| Layout | Mô tả tablet 2/3 cột masonry, desktop hai pane | code3 grid 1 cột, sm 2, lg 3; max 1200px | Grid đều 1/2/3 cột, không masonry/hai pane cho Menu |
| Header mờ | Mô tả nền `rgba(249,246,240,.82)`, blur16px | code3 surface/85, backdrop-blur-md | Menu dùng `rgba(252,249,243,.85)`, blur12px |

### 7.2 Token màu Menu đề xuất

Giá trị lấy từ code3; tên CSS dưới đây chỉ là quy ước tài liệu, chưa khai báo vào code. Dùng prefix `--menu-*`, scope vào Menu để không ghi đè `:root`/theme auth. Khi viết UI dùng cơ chế Tailwind v4 hiện có, không dùng config CDN của export.

| Token semantic (`--menu-*`) | Giá trị | Dùng cho |
| --- | --- | --- |
| surface | `#fcf9f3` | Canvas |
| surface-low | `#f6f3ed` | Vùng phụ/footer/skeleton |
| surface-container | `#f0eee8` | Chip/input |
| surface-high | `#ebe8e2` | Hover chip |
| surface-highest | `#e5e2dc` | Skeleton lớp đậm |
| card | `#ffffff` | Card |
| ink | `#1c1c18` | Body text |
| muted | `#4f4440` | Text phụ |
| outline | `#817470` | Icon/text nhạt; kiểm tra tương phản theo kích thước khi triển khai |
| outline-variant | `#d3c3be` | Viền nhẹ, ví dụ opacity 40% |
| primary / on-primary | `#070100` / `#ffffff` | CTA, chip active |
| primary-container | `#2b1810` | Hero, hover CTA |
| primary-fixed-dim | `#e2bfb2` | Text phụ hero |
| secondary / on-secondary | `#8e4d2a` / `#ffffff` | Accent có dữ liệu thật |
| secondary-fixed / on-secondary-fixed | `#ffdbcb` / `#341100` | Accent nền nhạt |
| error / error-container / on-error-container | `#ba1a1a` / `#ffdad6` / `#93000a` | Error state |

### 7.3 Typography, khoảng cách và hình khối đề xuất

- Tái sử dụng font đã nạp: `--font-jakarta` cho headline/label/giá, `--font-inter` cho body. Không nạp thêm font hoặc icon font CDN.
- Display desktop 40/48px, weight 700, tracking -0.02em; mobile 32/40px. Headline lớn 28/36px weight 700; headline vừa 22/30px weight 600; card title 18/26px weight 600.
- Body lớn 16/24px, body chuẩn 14/22px, body nhỏ 12/18px, weight 400. Label lớn 14/20px weight 600, tracking .01em; label vừa 12/16px weight 600, tracking .02em; label nhỏ 10/14px weight 700, tracking .04em. Các giá trị tương ứng YAML và code3; không dùng tên utility export khi chưa khai báo mapping v4.
- Spacing cơ bản 4, 8, 16, 24, 32px. Container tối đa 1200px, padding ngang mobile 16px, tablet 24px, desktop 40px; gutter grid 16/24/32px. Gutter nhỏ là điều chỉnh mobile để card không bị bó hẹp.
- Grid: dưới 640px 1 cột; 640-1023px 2 cột; từ 1024px 3 cột, giữ 3 ở desktop lớn. Đây là grid code3 được chuyển sang mobile-first; kiểm chứng sau ở 375/768/1440px.
- Radius semantic: base 4px, ảnh 8px, card/hero/panel 12px, pill 9999px theo code3. Không ghi đè `rounded-lg`/`rounded-xl` toàn cục của Tailwind v4.
- Đề xuất ảnh tỷ lệ 4:3 thay chiều cao 224px cố định của code3 để thích ứng các cột; `object-fit: cover`, vùng fallback cùng kích thước. Đây là khác biệt có chủ đích. Tên dài không làm giãn card, tên đầy đủ vẫn truy cập được. Hành động ảnh/tên và Add phải tách để không lồng button trong link.
- Shadow thấp `0 2px 8px rgba(43,24,16,.04)`, vừa `0 8px 24px rgba(43,24,16,.08)`, cao `0 16px 36px rgba(43,24,16,.12)` từ DESIGN.md; code3 có header `0 1px 8px rgba(43,24,16,.04)`. Hero dùng mức vừa, card mức thấp.
- Target nút trên mobile tối thiểu 44px, có focus-visible. Skeleton shimmer tôn trọng `prefers-reduced-motion`; không ẩn scrollbar toàn trang theo export.

### 7.4 Khác biệt có chủ đích so với export

**Đề xuất:** giữ bố cục header/hero/grid/footer screen3, nội dung chính tiếng Việt. Không đưa lời quảng cáo xác thực JWT/session vào hero. Header lấy tên/điểm từ user thật nếu cần; không dùng avatar, “Gold Member”, 460 PTS hay badge 3/2 của demo.

API tối thiểu không có category/description/badge/rating nên tạm ẩn các vùng phụ thuộc đó. Không hiện favorite, newsletter, khuyến mãi hoặc sort “phổ biến” như hành động đã hoạt động. Tìm kiếm/lọc/sắp xếp là phần mở rộng, không triển khai trong TRI-01. Số sản phẩm lấy từ danh sách thật; giá không lấy từ ảnh. Không tái hiện size/phụ phí, cart toast/tray hoặc panel chi tiết bằng logic demo.

## 8. Các điểm còn cần bàn giao/xác nhận

Tất cả các mục sau là **đề xuất hoặc phụ thuộc chưa được xác nhận**, không phải chức năng còn thiếu trong TRI-01:

| Bên | Cần cung cấp/xác nhận |
| --- | --- |
| Tri | Triển khai dữ liệu và API danh sách bốn trường, grid và trạng thái dữ liệu ở các task sau; chuẩn hóa env khi kết nối API |
| Khôi/team leader | Chính sách catalog công khai; cổng/env phát triển; route đặt đơn/lịch sử dùng JWT; review contract |
| Đông | Hình thức modal/drawer hay route, component nhận productId, API chi tiết hoặc người backend phối hợp, size/topping/giá cơ bản, cart store/selector thực tế |
| Điệp | Model stock và quy tắc tồn kho dùng cùng ProductId; không mặc định public catalog xác nhận khả năng đặt |
| Nhóm | Dữ liệu/nguồn ảnh, các trường mở rộng nếu cần, tiêu chí và trách nhiệm API chi tiết |

## 9. Kiểm chứng TRI-01

- Đã đọc code, package/lockfile, cấu hình env mẫu, auth, schema/seed, AGENTS.md; đối chiếu US-02/US-03 và xem screen3/screen4.
- Tài liệu phân biệt hiện trạng, yêu cầu và đề xuất; đã định nghĩa route/base URL, response, giá VND, empty/error, token Menu và ranh giới bàn giao Đông.
- Thay đổi dự kiến duy nhất: `docs/tri-menu-contract.md`. File untracked `tmp/pdfs/references.png` đã có trước task, không thuộc tài liệu hoặc commit này.
- Kiểm tra phù hợp trước commit: `git diff --check`, kiểm tra link tương đối và các mục bắt buộc, xem diff chỉ có tài liệu.
- Không chạy build/lint/test ứng dụng: TRI-01 không sửa mã thực thi, schema hoặc dependency. Chưa đo hiệu năng, kiểm thử API, responsive hay hồi quy auth; không tuyên bố các tiêu chí chức năng đã Pass.
- Review nhóm và xác nhận phụ thuộc ở mục 8 còn chờ. Commit được thực hiện theo yêu cầu trực tiếp của người dùng; chưa push.
