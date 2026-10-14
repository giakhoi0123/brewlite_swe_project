# TRI-05 — ProductCard và ProductGrid

Ngày kiểm tra: 12/10/2026. Branch: `feature/vo-minh-tri-menu-products`.

## File và phạm vi

| File | Trách nhiệm |
| --- | --- |
| [product.ts](../frontend/src/types/product.ts) | Kiểu Product công khai: id, name, price dạng number theo VND, imageUrl |
| [product-card.tsx](../frontend/src/components/menu/product-card.tsx) | Card nhận Product, ảnh/fallback, tên đầy đủ, giá và callback chọn món |
| [product-card.module.css](../frontend/src/components/menu/product-card.module.css) | Tỷ lệ ảnh, kiểu nút tên, focus và trạng thái chưa có callback |
| [product-grid.tsx](../frontend/src/components/menu/product-grid.tsx) | Danh sách semantic, grid 1/2/3 cột và chuyển callback xuống card |
| [product-grid-preview.tsx](../frontend/tests/fixtures/product-grid-preview.tsx) | Fixture kiểm thử riêng cho 1/8/10 sản phẩm và trường hợp biên |
| `docs/tri-product-components.md` | Hướng dẫn sử dụng, kết quả thực tế và phụ thuộc |

Đã kiểm tra Git trước task: không có thay đổi nguồn chưa commit; chỉ `tmp/` untracked. Đã đọc `frontend/AGENTS.md`, guide Next.js cục bộ về Server/Client Components, CSS và Image (`12-images.md`, `image.md`), cùng contract TRI-01. Giữ nguyên phiên bản, dependency và lockfile hiện có.

## Hợp đồng component

```ts
type ProductCardProps = {
  product: Product;
  onSelectProduct?: (productId: Product["id"]) => void;
};

type ProductGridProps = {
  products: readonly Product[];
  onSelectProduct?: (productId: Product["id"]) => void;
};
```

- Đặt component trong phạm vi theme Menu (`styles.shell` từ `menu.module.css`) để nhận token TRI-04. Parent cung cấp dữ liệu và callback từ Client Component; component không tự fetch, quản lý cart hoặc điều hướng tới route chi tiết.
- Giữ nguyên thứ tự mảng đầu vào và dùng `product.id` làm React key. Không lọc/sắp xếp hoặc sửa dữ liệu đầu vào.
- Ảnh, tên và nút “Chọn món” là ba button độc lập cùng truyền nguyên `product.id`. Article không có onClick; không có button/link lồng nhau. Callback chỉ báo chọn sản phẩm, không báo đã thêm cart.
- Chưa có callback: cả ba button disabled, tên/giá vẫn đọc được, có lời giải thích “Chọn món đang chờ tích hợp.” Không tạo toast, route hoặc cart giả.
- Giá hiển thị bằng `Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })`. Prop `price` vẫn là số; kiểm tra response và ràng buộc số nguyên nằm ở bước kết nối API TRI-06/backend.

## Thiết kế

Dùng token TRI-01/04, card trắng radius 12px, ảnh radius 8px, nút pill, font headline/giá Plus Jakarta Sans. Grid dưới 640px một cột, 640–1023px hai cột, từ 1024px ba cột; gutter 16/24/32px. Một sản phẩm vẫn chiếm một ô grid, không tự kéo rộng toàn hàng desktop.

Ảnh tỷ lệ 4:3, object-fit cover, có alt là tên sản phẩm. Dùng Next Image `fill` và `unoptimized` để phục vụ trực tiếp các SVG mẫu local hiện có, không thêm proxy ảnh hoặc cấu hình hostname rộng. Chưa tối ưu hóa/resizing ảnh raster remote; việc đó cần xét nguồn ảnh thật khi tích hợp. Next Image dùng lazy loading mặc định.

Khi imageUrl trống/whitespace hoặc ảnh tải lỗi, thay img bằng fallback SVG nội tuyến và nhãn truy cập được; không tải ảnh fallback từ mạng, không có vòng lặp lỗi ảnh. `ProductImage` có key theo URL để reset trạng thái lỗi khi nguồn đổi, kể cả productId giữ nguyên.

Tên dài xuống dòng tự nhiên, kể cả chuỗi không có khoảng trắng; không cắt tên hoặc chỉ dựa vào tooltip để đọc đầy đủ trên điện thoại. Grid stretch card cùng hàng, vùng giá/nút đặt cuối card. Đây là lựa chọn ưu tiên tên đầy đủ; tên rất dài làm tăng chiều cao cả hàng. Button tên và CTA tối thiểu 44px, có focus-visible. Card không thêm chuyển động; CTA tái sử dụng reduced-motion của Menu.

Không hiển thị category, mô tả, rating, badge, size/topping, phụ phí hoặc tồn kho vì response tối thiểu chưa công bố các trường đó.

## Kiểm chứng thực tế

Môi trường Windows, Node.js v24.11.0, Edge, Next.js 16.3.8. Dùng fixture riêng tại route tạm `/tri05-preview` trong `next dev --port 3001`; route này đã gỡ khỏi source sau kiểm tra. Dữ liệu fixture không được import vào trang `/products`.

| Kiểm tra | Kết quả |
| --- | --- |
| 1, 8, 10 sản phẩm × 375/768/1440px | PASS 9 trường hợp: đúng số article, lần lượt 1/2/3 cột, scrollWidth bằng clientWidth |
| Khung ảnh | PASS: tỷ lệ đo khoảng 1.333333; ở 375px ảnh bình thường và fallback đều 294.4 × 220.8px |
| Ảnh lỗi và thiếu | PASS: URL cố ý 404 và URL whitespace đều hiện fallback có nhãn đúng tên, giữ tên/giá |
| Đổi ảnh lỗi sang hợp lệ cùng productId | PASS: bỏ trường hợp biên, hai ảnh đầu tải thành công (`complete`, naturalWidth > 0), không còn fallback |
| Tên 173 ký tự, có chuỗi không khoảng trắng | PASS: nhìn thấy toàn bộ tên trên mobile, chiều rộng scroll/client của nút đều 294px; tablet 307px, desktop 318px; không tràn trang |
| Căn hàng desktop khi tên dài | PASS: ba card hàng đầu cao bằng nhau, khoảng 568.8px trong môi trường kiểm tra |
| Giá 0, 29999, 2147483647 | PASS: hiển thị `0 ₫`, `29.999 ₫`, `2.147.483.647 ₫`; giá lớn không tràn ô trên tablet/desktop |
| Chọn CTA sản phẩm 1 | PASS: counter 0 → 1, callback đúng UUID kết thúc `000000000001` |
| Chọn ảnh sản phẩm 2 | PASS: counter 1 → 2, callback đúng UUID kết thúc `000000000002` |
| Enter trên tên sản phẩm 2 | PASS: counter 2 → 3, đúng UUID sản phẩm 2, có focus-visible |
| Chọn tên dài sản phẩm 3 | PASS: đúng UUID kết thúc `000000000003` |
| Tương tác lồng nhau | PASS: DOM query `button button, a button, button a` trả 0; mỗi hành động kiểm tra chỉ tăng callback một lần |
| Vùng bấm | PASS: button tên và CTA đo được 44px, button ảnh lớn hơn 44px |
| Chưa có callback | PASS: 30/30 button của 10 card disabled, 10 lời giải thích, counter không tăng |
| `npm run lint` tại frontend | PASS, exit 0 |
| `npm run build` tại frontend | PASS: compile, TypeScript và prerender thành công; chỉ có `/`, `/_not-found`, `/products`, không có route fixture |

Dev server trong sandbox không tải được Google Fonts nên dùng font fallback trong lúc kiểm tra fixture; build production có quyền mạng đã tải font và thành công. Chưa đối chiếu lại toàn bộ ma trận hình ảnh bằng font production. Next.js cảnh báo ảnh đầu là LCP đang lazy-load; chưa đo hiệu năng tải ảnh. Request 404 của ảnh biên là lỗi có chủ đích để kiểm tra fallback.

Lần build đầu sau khi gỡ route preview báo validator trong `.next/dev/types` còn tham chiếu route cũ. Đã dừng dev server, xác minh đường dẫn và xóa riêng cache sinh tự động `.next/dev`, sau đó build lại thành công; không sửa typecheck/config để bỏ qua lỗi.

Kết quả DOM/callback và ảnh cục bộ nằm tại `tmp/tri05/results.json`, `cards-1440.jpg`, `cards-768.jpg`, `cards-375.jpg`, `cards-fallback-375.jpg`, `cards-long-name-375.jpg`, `cards-edges-1440.jpg`. Những artifact tạm này không nằm trong nguồn runtime. Đây là kiểm tra component/UI thực tế qua trình duyệt, không phải suite unit test tự động hay kiểm chứng DB/API thật.

## Tái chạy fixture

Từ root repo, chỉ tạo route tạm khi đường dẫn chưa tồn tại; không ghi đè file của người khác:

```powershell
if (Test-Path -LiteralPath 'frontend/src/app/tri05-preview') {
  throw 'Route preview đã tồn tại; hãy kiểm tra trước khi tiếp tục.'
}
New-Item -ItemType Directory -Path 'frontend/src/app/tri05-preview' | Out-Null
Copy-Item -LiteralPath 'frontend/tests/fixtures/product-grid-preview.tsx' -Destination 'frontend/src/app/tri05-preview/page.tsx'
npm run dev --prefix frontend -- --port 3001
```

Mở `http://localhost:3001/tri05-preview`. Chọn 1/8/10, bật trường hợp biên, thử chọn từ ảnh/tên/CTA và kiểm tra counter/productId. Bật “Chưa có callback” để kiểm tra disabled. Các thao tác chỉ cập nhật counter fixture, không thêm cart.

Sau kiểm tra, dừng dev server và gỡ riêng file `frontend/src/app/tri05-preview/page.tsx` cùng thư mục preview rỗng do bạn vừa tạo. Nếu build còn báo typegen route cũ, dọn cache `.next/dev` sau khi xác minh đường dẫn và dừng dev server. Không đưa route preview vào commit/production.

## Phụ thuộc và trạng thái bàn giao

ProductCard/ProductGrid đã sẵn sàng nhận dữ liệu và callback. `/products` vẫn giữ khung TRI-04; chưa có fixture hard-code trên trang thật. TRI-06 sẽ cung cấp dữ liệu API và bốn trạng thái tải. TRI-07/Đông sẽ nối callback tới chi tiết thật và cart. Chưa nghiệm thu luồng chọn món end-to-end, API thật hoặc toàn bộ US-03.
