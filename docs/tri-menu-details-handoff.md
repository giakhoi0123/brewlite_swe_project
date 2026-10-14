# TRI-07 — Điểm nối Menu sang chi tiết món

Ngày kiểm tra: 14/10/2026. Phụ trách Menu: Võ Minh Tri. Chi tiết, size/topping, tính giá và cart: Đông.

## Trạng thái

**Điểm nối phía Menu: đã triển khai và kiểm tra với bộ nhận giả lập.** `ProductCatalog` nhận `ProductDetailsAdapter`, chuyển hành động mở chi tiết qua `ProductGrid` xuống `ProductCard`. Ảnh, tên và nút “Chọn món” đều truyền nguyên `product.id` từ response API; không truyền index, tên hay giá để định danh.

**Tích hợp end-to-end: Blocked.** Chưa có module chi tiết/cart của Đông để mở dữ liệu chi tiết thật hoặc kiểm tra thêm vào giỏ. Bộ nhận kiểm thử chỉ hiện UUID, không phải giao diện chi tiết hoàn chỉnh. Không đánh dấu đạt tiêu chí “hai sản phẩm mở đúng dữ liệu chi tiết thật”.

Đã fetch `origin` và kiểm tra cây frontend/backend, các branch remote hiện có. `origin/main` vẫn ở `15374e72`; không có branch của Đông trong danh sách remote. Frontend chỉ có `/` và `/products`, store chỉ có `auth-store.ts`. Backend `ProductsController` chỉ khai báo GET danh sách, chưa có GET chi tiết. Đây là hiện trạng repository truy cập được, không kết luận về code riêng chưa được Đông bàn giao.

## Interface đã có trong code

File [product-details-adapter.ts](../frontend/src/types/product-details-adapter.ts):

```ts
type ProductSelectionHandler = (productId: Product["id"]) => void;

type ProductDetailsAdapter =
  | { status: "unavailable" }
  | { status: "ready"; openProductDetails: ProductSelectionHandler };
```

`ProductCatalog` nhận prop tùy chọn `detailsAdapter`. Mặc định dùng `pendingProductDetailsAdapter` có `status: "unavailable"`. Trong trạng thái này callback không được cấp cho card: ba hành động bị disable, card hiện “Chọn món đang chờ tích hợp.” Không có thông báo thêm thành công, điều hướng vào route chưa tồn tại hoặc badge/cart giả.

`status: "ready"` chỉ được cấp khi component/route thật đã sẵn sàng. Catalog gọi `detailsAdapter.openProductDetails(productId)` đúng một lần cho mỗi thao tác. Hành động này có nghĩa **mở bước chọn size/topping**, không có nghĩa đã thêm vào giỏ. Menu không giữ selectedId toàn cục, không tạo cart store, không gọi cart API hay tính tiền.

## Cách Đông nối module thật

**Yêu cầu theo TRI-01/TRI-07:** ưu tiên modal/drawer trên `/products`. Đông cung cấp component nhận `productId`, tự tải chi tiết và quản lý loading/error/size/topping/giá/xác nhận thêm vào giỏ. Tên module và props thực tế chưa được bàn giao.

Khi module có, tạo một Client Component chứa cả catalog và component chi tiết của Đông. Trong component đó, cấp adapter `status: "ready"` với opener nhận `productId` và mở module thật. Ví dụ hình thức nối (mã minh họa; `DongProductDetails` là tên tạm, không phải export hiện có):

```tsx
"use client";

// Import ProductCatalog, ProductDetailsAdapter, useState và module thật của Đông.
export function MenuWithDetails() {
  const [productId, setProductId] = useState<string | null>(null);
  const adapter: ProductDetailsAdapter = {
    status: "ready",
    openProductDetails: (id) => setProductId(id),
  };
  return (
    <>
      <ProductCatalog detailsAdapter={adapter} />
      {productId && (
        <DongProductDetails
          productId={productId}
          onClose={() => setProductId(null)}
        />
      )}
    </>
  );
}
```

Sau đó thay `<ProductCatalog />` trong `src/app/products/page.tsx` bằng Client Component này. Không truyền hàm opener trực tiếp từ page hiện là Server Component: hàm không serialize được qua ranh giới server/client. Không dùng fixture kiểm thử làm module runtime.

**Đề xuất cần Đông xác nhận:** nếu chọn route `/products/[productId]`, chỉ sửa opener sang điều hướng sau khi route đó tồn tại và đã kiểm tra. Không tạo route chi tiết thay Đông trong TRI-07.

## Các phụ thuộc cần bàn giao

| Mục | Trách nhiệm và trạng thái |
| --- | --- |
| Component chi tiết | Đông cung cấp import path, props `productId`, cách đóng và hình thức modal/drawer hoặc route. Chưa có |
| GET `/api/products/:id` | Đông cung cấp hoặc phối hợp người backend do nhóm chỉ định. Không mặc nhiên thuộc API danh sách của Tri; chưa có |
| Size/topping và giá | Đông chốt schema, mặc định và tính giá. “Chọn món” mở bước này; chưa làm quick add |
| Thêm vào giỏ | Đông xử lý xác nhận và kết quả thực tế. Menu không ghi nhận thành công khi chỉ mở chi tiết |
| Cart badge | Chưa có store/selector/import path nên chưa hiển thị. Khi có, đọc selector thật của Đông tại `menu-header.tsx`; cần thống nhất đếm tổng quantity hay số dòng, hydration và trạng thái 0 |

Không tạo interface cart phỏng đoán hoặc store thứ hai. Đề xuất đếm tổng quantity trong TRI-01 vẫn cần nhóm xác nhận.

## Kiểm tra thực tế

Môi trường: Windows, Node 24.11.0; Next.js 16.3.8 / React 19.2.8. Frontend dev chạy cổng 3011, HTTP fixture cổng 3012; URL fixture chỉ đặt qua biến môi trường của tiến trình kiểm thử. Backend/PostgreSQL thật và module Đông chưa được dùng trong lần kiểm tra này.

Fixture [product-details-preview.tsx](../frontend/tests/fixtures/product-details-preview.tsx) dùng **ProductCatalog thật** để fetch HTTP fixture của TRI-06; adapter kiểm thử chỉ ghi ID và số lượt mở. Chỉ mount tạm tại `/tri07-preview` lúc kiểm tra; route tạm đã gỡ trước build. Trang `/products` vẫn dùng adapter unavailable mặc định và API được cấu hình qua môi trường; không import fixture.

| Kiểm tra | Kết quả thực tế |
| --- | --- |
| Ảnh, tên, nút của cà phê | Pass: nhận `31a650c7-8597-4a01-a8e2-000000000011` ở cả ba thao tác |
| Ảnh, tên, nút của trà | Pass: nhận `31a650c7-8597-4a01-a8e2-000000000012` ở cả ba thao tác; nút được kích hoạt bằng Enter |
| Không kích hoạt hai lần | Pass: số lượt mở lần lượt 1, 2, 3, 4, 5, 6; không có tương tác lồng nhau |
| Đóng bộ nhận | Pass: region bộ nhận được gỡ, số lượt vẫn là 6 |
| Chuyển adapter sang unavailable | Pass: cả 6 nút của 2 card khóa, có thông báo chờ tích hợp, số lượt vẫn là 6 |
| `/products` dùng mặc định | Pass qua HTTP fixture: cả 6 nút khóa; header khách có Đăng nhập, không có badge/toast/route chi tiết giả |
| Mở dữ liệu chi tiết thật của 2 sản phẩm | Blocked: chưa có component/API chi tiết của Đông |
| Xác nhận thêm vào cart và badge thật | Blocked: chưa có cart module/selector, chưa chốt quy tắc đếm |

Bằng chứng cục bộ: `tmp/tri07/results.json`, `tmp/tri07/receiver.jpg`, `tmp/tri07/control.json`. Đây là artefact kiểm thử, không phải dữ liệu DB hoặc dữ liệu production.

### Chạy lại kiểm tra tương tác

Trong workspace phát triển riêng, tạo `tmp/tri07/control.json` với nội dung kiểm thử sau (không đưa vào dữ liệu ứng dụng thật):

```json
{
  "status": 200,
  "body": [
    { "id": "31a650c7-8597-4a01-a8e2-000000000011", "name": "Cà phê từ API kiểm thử", "price": 41000, "imageUrl": "/images/products/sample-latte.svg" },
    { "id": "31a650c7-8597-4a01-a8e2-000000000012", "name": "Trà từ API kiểm thử", "price": 27000, "imageUrl": "/images/products/sample-iced-tea.svg" }
  ]
}
```

Tạm tạo `frontend/src/app/tri07-preview/page.tsx` với nội dung:

```tsx
export { default } from "../../../tests/fixtures/product-details-preview";
```

Từ thư mục `frontend`, mở hai terminal PowerShell:

```powershell
node tests/fixtures/products-api-server.mjs D:/brewlite_swe_project/tmp/tri07/control.json
```

```powershell
$env:NEXT_PUBLIC_API_URL = 'http://localhost:3012/api'
npm run dev -- --port 3011 --hostname 127.0.0.1
```

Mở `http://localhost:3011/tri07-preview`, chọn lần lượt ảnh/tên/nút của hai món, so UUID với response và số lượt tăng đúng một. Đóng bộ nhận, bỏ chọn “Module sẵn sàng” để kiểm tra disable. Sau kiểm tra dừng hai tiến trình, gỡ file/route tạm và biến môi trường fixture; không commit route tạm. Không thay dữ liệu dùng chung.

### Kiểm tra mã nguồn

- `npm run lint`: Pass, exit 0, không lỗi/cảnh báo ESLint.
- `npm run build`: Pass, exit 0; compile/TypeScript thành công, chỉ có `/`, `/_not-found`, `/products`. Không còn route preview trong build. Build dùng cấu hình mặc định, không đặt URL fixture.
- `node --test tests/product-contract.test.mjs`: Pass 6/6 kiểm tra hồi quy parser danh sách từ TRI-06. Node có cảnh báo `MODULE_TYPELESS_PACKAGE_JSON`; không có test lỗi. Đây không phải kiểm thử API chi tiết hoặc cart.
- `git diff --check`: Pass với các file tracked; Git cảnh báo chuyển LF sang CRLF theo cấu hình Windows.
- Kiểm tra source không còn import fixture/route `tri07-preview` hoặc cổng 3012 trong `frontend/src`.

File thay đổi riêng TRI-07: `product-catalog.tsx` (cấp adapter xuống grid), `product-card.tsx` và `product-grid.tsx` (dùng chung kiểu callback), `src/types/product-details-adapter.ts` (interface/trạng thái mặc định), `tests/fixtures/product-details-preview.tsx` (bộ nhận kiểm thử), tài liệu này. Các thay đổi TRI-06 đã có trong working tree được bảo toàn. Không commit/push trong TRI-07.
