# T4.1 — Hợp đồng chi tiết sản phẩm và tùy chọn

Ngày khảo sát: 14/10/2026. Repository: `D:\brewlite_swe_project`, branch `feature/vo-minh-tri-menu-products`, HEAD đã commit `3bd83e5a`. Phạm vi: thiết kế hợp đồng cho Task 4 và điểm bàn giao Task 5; chưa viết UI/API/schema/store hoặc nghiệp vụ đặt đơn.

## 1. Phân biệt nguồn và trạng thái quyết định

- **Đã có trong code:** kiểm tra trực tiếp repository/working tree, không đồng nghĩa đã chạy với DB thật.
- **Yêu cầu:** từ prompt T4.1/bối cảnh Task 4–5 của người dùng hoặc tài liệu phân công/đề bài.
- **Đề xuất mới:** hợp đồng kỹ thuật chọn cho lần triển khai sau; chưa có trong code và cần nhóm review. Ví dụ JSON/phụ phí bên dưới không phải dữ liệu DB đã có.

Nguồn đã đọc/đối chiếu:

- `C:/Users/VÕ MINH TRI/Downloads/Phân việc SWE-Brewlite.pdf`, trang PDF 10–14: Đông phụ trách chi tiết/cart; size S/M/L chọn một, topping chọn nhiều, hiện phụ phí, mặc định size tiêu chuẩn và không topping; cart phân biệt biến thể. Trang 12 là sơ đồ use case dạng ảnh, đã xem bản render. Tài liệu không quy định số lượng tối đa.
- `C:/Users/VÕ MINH TRI/Downloads/BrewLite-CongNghePhanMem.pdf`, trang PDF 4–8: luồng Menu → tùy chọn → cart → đăng nhập/đặt đơn; Task 4/5, GET `/products/:id`, Product tối thiểu và backend validate đơn/tồn kho.
- `C:/Users/VÕ MINH TRI/Downloads/stitch_brewlite_menu2/DESIGN.md`, `screen2.png`/`code2.html` làm chuẩn chi tiết; `screen4.png`/`code4.html` tham khảo panel/cart. Đã xem ảnh, đọc HTML và script như dữ liệu tham khảo, không thực thi chúng.
- [Contract Menu](tri-menu-contract.md), [điểm nối TRI-07](tri-menu-details-handoff.md), schema/service/type/adapter hiện tại ở mục 2.

**Điểm lệch thiết kế:** code2 dùng giá size đã cộng sẵn, code4 dùng giá gốc + phụ phí; mặc định cả hai có topping được tích sẵn, phụ phí M/L cũng khác nhau. Theo yêu cầu người dùng, mặc định **không topping**, quantity 1 và size do dữ liệu quy định. Không dùng số tiền, giảm giá, rating, badge/cart count, dung tích hoặc script demo làm quy tắc nghiệp vụ. Ghi chú barista là mở rộng; không tự bổ sung mua ngay, mức đá/đường, khuyến mãi hoặc thanh toán.

## 2. Hiện trạng đã có trong code

| Thành phần | Hiện trạng và bằng chứng |
| --- | --- |
| Product DB | `backend/prisma/schema.prisma`: id UUID, name, price Int, imageUrl, stock Int; migration có CHECK price/stock ≥ 0. Chưa có description, size, topping hoặc default |
| Dữ liệu mẫu | `backend/prisma/seed-products.ts`: 10 UUID ổn định, giá cơ bản và ảnh SVG local; không có phụ phí |
| API danh sách | `backend/src/products/products.controller.ts` chỉ GET collection; service select id/name/price/imageUrl, orderBy name/id; không có GET chi tiết |
| Prefix/API URL | `backend/src/main.ts` global prefix api; `frontend/src/lib/api.ts` đọc NEXT_PUBLIC_API_URL, mặc định http://localhost:3002/api |
| Frontend Product | `frontend/src/types/product.ts` đúng bốn trường danh sách; parser yêu cầu giá integer 0..2147483647 |
| Menu/giá | `/products`, ProductCatalog/Grid/Card; card ghi “Giá cơ bản”, dùng Intl.NumberFormat VND; API danh sách không có size/topping |
| Điểm mở chi tiết | `types/product-details-adapter.ts`: ready/unavailable và openProductDetails(productId); hiện pending, ảnh/tên/nút bị khóa; không thêm vào cart |
| Cart/tùy chọn | Chưa có cart store, option model, module tính giá hoặc route chi tiết. Store duy nhất ở frontend là auth-store.ts; không tái sử dụng auth store để chứa cart |
| Công nghệ | Next.js 16.3.8, React 19.2.8, Tailwind 4, Zustand 5; backend NestJS 12 và Prisma 6.19.3. Không đổi dependency/framework |

Đã đọc `frontend/AGENTS.md` và guide Next.js cục bộ `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/dynamic-routes.md`. Task này chỉ tạo Markdown. Các thay đổi Menu/auth/test chưa commit đã có trước T4.1 được bảo toàn.

## 3. Route và API chi tiết — đề xuất mới

- Trang: `/products/[id]`, file dự kiến `frontend/src/app/products/[id]/page.tsx`; id là UUID của Product. Trong Next.js 16, params của page là Promise, không giả định API params đồng bộ từ phiên bản cũ.
- Endpoint dự kiến: `GET /api/products/:id`, nối `${API_BASE_URL}/products/${id}`; không đổi prefix hoặc tạo API base URL thứ hai. Nhóm Task 4/Đông hoặc người backend được nhóm chỉ định cung cấp endpoint; không tự gán vào phạm vi API danh sách của Tri.
- Chi tiết công khai như catalog theo luồng nghiệp vụ; đặt đơn cần backend kiểm tra auth riêng. Đây là đề xuất cần đối chiếu chính sách nhóm, chưa phải guard/policy đã triển khai.
- Thành công: HTTP 200 với **một object ProductDetail trực tiếp**, không envelope; id không phải UUID: đề xuất 400; UUID hợp lệ nhưng không tồn tại: 404; lỗi DB/server: lỗi chung 500, không lộ chi tiết kết nối. UI sau này phân biệt các trạng thái này, không biến lỗi thành sản phẩm rỗng.
- TRI-01/TRI-07 từng ưu tiên modal/drawer và cho phép route sau khi có. T4.1 chọn route ở trên để dùng trang chi tiết chuẩn screen2 và URL mở trực tiếp. Đây là **đề xuất thay thế phần hình thức mở**, chưa thay code/adapter; `[id]` và `[productId]` chỉ khác tên tham số, không được tạo hai route song song.
- Khi route/API thật hoàn thành, cấp opener cho adapter Menu để chuyển đúng UUID; ảnh/tên/Chọn món chỉ mở tùy chọn, không quick add. Không kích hoạt điều hướng trước khi route tồn tại và được kiểm tra.

## 4. Dữ liệu chi tiết — đề xuất mới

Giữ `price` thay vì thêm `basePrice` vào response. Trong công thức, **basePrice := detail.price**. Ý nghĩa: giá cơ bản của một ly, chưa cộng size/topping, cùng nghĩa giá trên Menu; không phải giá đã định dạng hoặc giá của size mặc định. Nếu default size có phụ phí, giá ban đầu của chi tiết cao hơn giá cơ bản card là đúng và phải được UI giải thích.

GET danh sách giữ nguyên bốn trường. Chi tiết thêm trường mới, không bắt frontend Menu phải đọc chúng. Nếu list/detail khác giá do dữ liệu đổi giữa hai request, chi tiết mới là nguồn tạm tính hiện tại; không tính bằng giá list cũ. Backend xác nhận lại lúc tạo đơn.

### Kiểu dữ liệu đề xuất (chưa tạo file TypeScript)

```ts
type ProductSize = {
  id: string; // UUID ổn định của tùy chọn size thuộc sản phẩm
  code: "S" | "M" | "L";
  name: string;
  extraPrice: number; // số nguyên VND, không âm
  available: boolean;
};

type ProductTopping = {
  id: string; // UUID ổn định của topping
  name: string;
  extraPrice: number; // phụ phí cho mỗi ly, không phải cả dòng
  available: boolean;
};

type ProductDetail = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  sizes: ProductSize[];
  toppings: ProductTopping[];
  defaultSizeId: string;
};
```

| Trường/quy tắc | Hợp đồng đề xuất |
| --- | --- |
| id/name/imageUrl/price | Cùng kiểu và giá trị của Product; UUID ổn định, tên không rỗng, imageUrl HTTP(S) hoặc asset bắt đầu một dấu / (không //); ảnh lỗi có fallback |
| description | String mô tả plain text từ backend; không render HTML/script. Cho phép chuỗi rỗng nếu dữ liệu mô tả chưa có, không tự lấy lời mô tả demo làm dữ liệu thật |
| sizes | Ba code S/M/L, mỗi code đúng một entry; id UUID duy nhất, name không rỗng và ID không đổi theo thứ tự hiển thị. Có thể unavailable, nhưng entry vẫn giữ code/id |
| toppings | Mảng topping được phép dùng cho sản phẩm này, có thể []; id duy nhất, tên không rỗng; không dùng toàn bộ topping catalog nếu không thuộc món |
| extraPrice | Phụ phí cộng trên mỗi ly, không âm, 0 hợp lệ; không chứa giá size đã cộng base để tránh cộng hai lần |
| defaultSizeId | ID tồn tại trong sizes, nguồn backend quyết định size tiêu chuẩn. Lần mở mới chọn ID này, toppingIds=[], quantity=1; không mặc định M theo ảnh hoặc phần tử đầu |
| available | Quy ước **mới**, chưa có trong schema. Nếu triển khai, backend phải cấp boolean từ nguồn tùy chọn thống nhất; không suy ra từ stock của Product hay gán true ở frontend để che thiếu dữ liệu |

ID size đề xuất UUID riêng cho từng tùy chọn Product, với tính duy nhất `(productId, code)` trong dữ liệu tương lai. Topping có thể có ID dùng chung catalog, nhưng danh sách cho Product và extraPrice phải có nguồn backend thống nhất. T4.1 chưa chọn/bổ sung bảng Prisma hoặc migration; chi tiết và backend tạo đơn sau này phải đọc cùng nguồn, không có bảng phụ phí hard-code riêng ở component/cart.

Default cấu hình phải trỏ size khả dụng khi có thể thêm món. Nếu default không tồn tại, bị unavailable hoặc không có size khả dụng, xem là cấu hình tùy chọn chưa sẵn sàng: có thể hiển thị thông tin sản phẩm nhưng khóa thêm vào giỏ, nêu lỗi cấu hình và yêu cầu tải lại. Không tự chọn size khác hoặc tính với phụ phí 0. Nhóm có thể thay quy tắc này sau review, trước khi triển khai.

### Ví dụ JSON chi tiết

ID Product/price/ảnh bên dưới lấy cấu trúc và seed hiện có; description, ID tùy chọn, phụ phí và default là **dữ liệu minh họa mới**, không phải seed đã triển khai hay bảng giá nhóm đã duyệt. Các mức 4000/9000/7000/6000 được chọn để minh họa công thức, không sao chép giá thiết kế.

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

## 5. Chọn tùy chọn và tính giá

**Yêu cầu:** chọn đúng một size, topping tùy chọn/nhiều loại; một topping tối đa một lần mỗi ly. Các ly trong một dòng có cùng cấu hình. Đổi size không tự chọn topping; không cần topping thì mảng rỗng.

**Công thức chốt theo yêu cầu T4.1:**

```text
basePrice = detail.price
sizeExtra = extraPrice của sizeId trong detail.sizes
toppingExtra = tổng extraPrice của các toppingIds duy nhất trong detail.toppings
unitPrice = basePrice + sizeExtra + toppingExtra
lineTotal = unitPrice × quantity
```

Không nhân toppingExtra riêng lần nữa ngoài quantity, không cộng base hai lần khi đổi size, không lưu chuỗi tiền định dạng. UI format VND bằng Intl.NumberFormat; không chia/nhân 100. Giá này không bao gồm phí giao hàng, thuế, giảm giá/điểm thưởng; chưa triển khai các nghiệp vụ đó.

Ví dụ từ JSON:

| Lựa chọn | quantity | unitPrice (đồng) | lineTotal (đồng) |
| --- | ---: | ---: | ---: |
| Default M, không topping | 1 | 29000 + 4000 = 33000 | 33000 |
| S, không topping | 2 | 29000 + 0 = 29000 | 58000 |
| M, espresso + cheese | 2 | 29000 + 4000 + 7000 + 6000 = 46000 | 92000 |
| L, chỉ cheese | 3 | 29000 + 9000 + 6000 = 44000 | 132000 |

**Đề xuất giới hạn tiền:** dữ liệu price/extraPrice giữ giới hạn Prisma Int hiện có 0..2147483647; unitPrice, lineTotal và subtotal cũng kiểm tra integer không âm trong cùng giới hạn trước khi ghi cart. Đây là giới hạn kỹ thuật mới cho tổng tính toán, không phải ràng buộc Order đã có. Không clamp/wrap hoặc chấp nhận Infinity/NaN; nếu vượt thì từ chối thay đổi và giữ cart cũ. Nếu nhóm chọn kiểu tiền lớn hơn cho Order sau này, phải cập nhật contract hai phía. Dùng kiểm tra safe integer cho các phép cộng/nhân trước khi so giới hạn.

## 6. Số lượng — đề xuất mới

**Đã có:** Product.stock integer không âm ở DB; API danh sách không trả stock. Chưa có quantity, Cart hoặc Order model/validator giới hạn số lượng. HTML demo chỉ chặn giảm dưới 1, không có trần; đó không phải chính sách nghiệp vụ đã triển khai.

**Đề xuất:** quantity integer **1..99 cho một dòng biến thể**, mặc định 1. Áp dụng sau cả thêm/gộp/cập nhật; tổng gộp vượt 99 thì từ chối nguyên thao tác, không âm thầm cắt bớt. Quantity 0 không thay cho hành động xóa. Giới hạn 99 là lựa chọn cần nhóm review, không phải yêu cầu PDF và không đảm bảo món còn tồn kho.

Không dùng stock để tự đặt trần UI hoặc trừ/giữ hàng trong Task 4/5. Backend đặt đơn kiểm tra tổng quantity theo Product qua các biến thể, tồn kho và đồng thời theo nghiệp vụ riêng. Một giới hạn UI không thay thế kiểm tra server.

## 7. Biến thể và dữ liệu bàn giao sang giỏ

### 7.1 Phần lựa chọn bắt buộc

```json
{
  "productId": "31a650c7-8597-4a01-a8e2-000000000001",
  "sizeId": "c075421a-1160-4e94-84d4-000000000002",
  "toppingIds": [
    "b4151b67-4044-43ce-9cac-000000000001",
    "b4151b67-4044-43ce-9cac-000000000002"
  ],
  "quantity": 2
}
```

**Đề xuất:** thêm snapshot lấy từ chi tiết đã validate, để cart hiển thị tên/ảnh/size/topping/giá mà không phụ thuộc một request chi tiết đang chạy. Ví dụ đầy đủ ứng viên dòng cart (chưa phải API thêm cart đã có):

```json
{
  "productId": "31a650c7-8597-4a01-a8e2-000000000001",
  "sizeId": "c075421a-1160-4e94-84d4-000000000002",
  "toppingIds": [
    "b4151b67-4044-43ce-9cac-000000000001",
    "b4151b67-4044-43ce-9cac-000000000002"
  ],
  "quantity": 2,
  "snapshot": {
    "name": "Bạc xỉu 3 tầng Sài Gòn",
    "imageUrl": "/images/products/sample-milk-coffee.svg",
    "price": 29000,
    "size": { "id": "c075421a-1160-4e94-84d4-000000000002", "code": "M", "name": "Vừa (M)", "extraPrice": 4000 },
    "toppings": [
      { "id": "b4151b67-4044-43ce-9cac-000000000001", "name": "Thêm espresso", "extraPrice": 7000 },
      { "id": "b4151b67-4044-43ce-9cac-000000000002", "name": "Kem cheese", "extraPrice": 6000 }
    ]
  }
}
```

Snapshot.size.id phải khớp sizeId; tập ID snapshot.toppings phải đúng toppingIds, không trùng/thiếu/thừa. Snapshot từ dữ liệu chi tiết, không tự nhập phụ phí từ component. UnitPrice/lineTotal/subtotal/badge là dữ liệu **tính lại**, không có tổng đã format hoặc bộ tổng lưu riêng dễ sai khi quantity thay đổi.

### 7.2 Định danh và gộp biến thể — đề xuất mới

Chuẩn hóa UUID về chữ thường; kiểm tra duy nhất toppingIds trước khi tính. UI checkbox quản lý một tập lựa chọn. Payload/restore có ID topping lặp phải báo không hợp lệ, không tính phụ phí hai lần hay âm thầm chấp nhận dữ liệu hỏng. Sắp toppingIds bằng thứ tự chuỗi UUID cố định, không theo tên/giá/locale.

Variant identity là tuple `(productId, sizeId, sortedToppingIds)`; có thể serialize bằng JSON array để không va chạm ký tự phân cách. Quantity, thứ tự click, tên hiển thị, giá snapshot không thuộc identity. Cùng tuple thì gộp quantity; khác size hoặc tập topping thì dòng khác. Không nhận variantKey tùy ý từ client/storage mà không tự tính lại.

Ví dụ espresso→cheese và cheese→espresso đều cùng biến thể, unitPrice 46000; thêm lần đầu 2 ly, lần sau 1 ly → một dòng quantity 3, lineTotal 138000. M không topping khác M có espresso. Cùng name nhưng khác productId cũng khác dòng.

Khi giá/tên snapshot cũ khác dữ liệu chi tiết mới, không dùng chúng tạo biến thể thứ hai: đề xuất làm mới snapshot của dòng bằng dữ liệu chi tiết mới, tính lại toàn dòng và thông báo thay đổi giá. Không gộp khi tùy chọn đang bị vô hiệu; cart persist là cache cần revalidate, không chứng minh giá hoặc khả dụng hiện tại. Quy trình refresh/persist/store cụ thể thuộc Task 5 sau.

Đề xuất badge đọc `sum(line.quantity)` từ **một cart store thật**; subtotal = sum(lineTotal), các dữ liệu này dẫn xuất từ cùng state. Hiện không có cart store để nối. T4.1 không tạo store hay sửa header; khi triển khai cần kiểm tra lại module nhóm để tránh store thứ hai. Chỉ báo thêm thành công sau thao tác store thật chấp nhận; mở chi tiết chưa phải thêm vào cart.

## 8. Ghi chú barista — mở rộng, chưa bắt buộc

Thiết kế có ô ghi chú, nhưng Task 4/5 PDF không chốt dữ liệu/giới hạn. **Đề xuất nếu bật tính năng:** thêm `note?: string`, tối đa **200 Unicode code point** sau chuẩn hóa NFC, đổi CRLF sang LF và trim hai đầu. Giữ hoa/thường, khoảng trắng bên trong và xuống dòng để không mất ý nghĩa; ghi chú không làm đổi giá.

Chuỗi rỗng và không note tương đương. Khi có note, identity mở rộng thêm `normalizedNote`: cùng Product/size/topping nhưng khác note phải tách dòng để barista không nhận hướng dẫn sai. Ví dụ “Ít đá” và “Không đá” không gộp; quantity của một dòng áp dụng cùng note cho mọi ly. Snapshot/display/đơn sau này phải bảo toàn note nếu tính năng được bật.

Quá 200 ký tự: báo lỗi, không cắt âm thầm. Note là plain text, không render HTML. Khi chưa bật extension, không thêm note vào dữ liệu bàn giao hoặc lặng lẽ bỏ note người dùng đã nhập; UI không cung cấp ô ghi chú có vẻ hoạt động trước khi cả cart/backend hỗ trợ.

## 9. Dữ liệu không hợp lệ và cách xử lý đề xuất

Mọi thao tác thêm/gộp/sửa phải validate toàn bộ trước khi thay đổi state; lỗi giữ cart cũ và không báo thành công. Một dòng lỗi không được biến thành món mặc định/giá 0.

| Trường hợp | Kết luận/hành vi |
| --- | --- |
| Product ID sai UUID / không tồn tại | Không mở món theo tên/index; API chi tiết 400/404 theo quy ước mục 3 |
| Thiếu description, sizes/default hoặc sai kiểu money | Response chi tiết sai contract, không dùng list làm chi tiết giả |
| Default không thuộc sizes, duplicate size code/id, thiếu S/M/L | Cấu hình lỗi; không chọn phần tử đầu tự động |
| Default unavailable hoặc tất cả size unavailable | Cấu hình chưa sẵn sàng; khóa thêm và nêu lý do, không gán available=true |
| Không chọn size, chọn hai size hoặc size của sản phẩm khác | Từ chối; sizeId là một UUID thuộc danh sách món hiện tại |
| Topping ID lạ/không thuộc món hoặc available=false | Từ chối lựa chọn; không bỏ topping rồi báo thành công với cấu hình khác |
| toppingIds=[A,A], id khác chữ hoa/thường nhưng cùng UUID | Không hợp lệ; không tính phí hai lần. [A,B] và [B,A] đều hợp lệ và cùng biến thể |
| price/extraPrice="5.000đ", 1.5, -1, NaN, Infinity | Không hợp lệ; không parse chuỗi format hoặc làm tròn để chấp nhận |
| quantity=0, -1, 1.5, "2", 100 | Từ chối theo đề xuất 1..99; không dùng quantity=0 để xóa |
| Gộp 98+2 ly cùng tuple | Từ chối nguyên thao tác, vẫn giữ quantity 98 |
| price=2147483647, sizeExtra=1, hoặc lineTotal vượt trần | Báo vượt giới hạn tiền, không overflow/clamp hay mutate cart |
| Snapshot.size.id/topping IDs khác lựa chọn | Dữ liệu bàn giao/restore không hợp lệ, không ghép tên/giá của tùy chọn khác |
| Persist bị sửa giá hoặc tùy chọn đã hết khả dụng | Giá/cache không có thẩm quyền; refresh/validate và yêu cầu sửa lựa chọn trước đặt đơn |
| Note quá 200 code point hoặc khác note nhưng cố gộp | Từ chối note quá dài; note khác tách dòng khi extension được bật |

Các trường hợp này là tiêu chí kiểm thử cho task triển khai sau, chưa phải test đã chạy với UI/API tùy chọn.

## 10. Giá client và trách nhiệm backend tạo đơn

**Yêu cầu:** tất cả giá client/snapshot/localStorage chỉ là tạm tính. Backend tạo đơn nhận ID tùy chọn và quantity, tải dữ liệu có thẩm quyền để xác nhận Product, size/topping thuộc món, khả dụng, ID duy nhất, giới hạn quantity và tính lại unitPrice/lineTotal/tổng. Không tin giá, tên, phụ phí hoặc tổng gửi từ client.

Nếu giá/khả dụng đã đổi: đề xuất trả lỗi nghiệp vụ để người dùng xem lại và xác nhận, không lặng lẽ thu tổng khác. Định dạng lỗi/quote cụ thể cần thống nhất với Task 6; T4.1 không tạo endpoint đơn hàng, checkout, trừ tồn kho hoặc logic thanh toán. Backend xác minh tồn kho/đồng thời thuộc task đặt đơn/nghiệp vụ, không thực hiện khi chỉ mở chi tiết hay thêm cart.

## 11. Nghiệm thu T4.1 và phụ thuộc

- Có contract detail/option/default, tương thích price/list; công thức, JSON, ví dụ biến thể và dữ liệu lỗi.
- Tách rõ hiện trạng, yêu cầu và đề xuất: route, available, quantity 1..99, giới hạn tổng tiền, snapshot/identity, note 200 ký tự và badge đều là quyết định mới chưa triển khai.
- Task sau cần nguồn description/options/extraPrice/default thống nhất và review nhóm, API chi tiết, route/adapter thật, cart store thật; không lấy mock web test làm nguồn nghiệp vụ.
- Thay đổi source duy nhất của T4.1: `docs/product-customization-contract.md`. Không sửa Menu/auth/schema/API/store, không commit/push. Server test giao diện đang chạy được giữ nguyên.
- Kiểm tra tài liệu **Pass**: parse 3 JSON minh họa; đối chiếu UUID/default/snapshot; tính lại 4 ví dụ giá, ví dụ gộp và giới hạn; kiểm tra link/Markdown/whitespace. `git diff --check` không có lỗi (cảnh báo LF→CRLF ở các file đã sửa trước task). Không chạy build/lint/test chức năng: chỉ thêm Markdown, chưa có implementation tùy chọn để kiểm thử; không tuyên bố Task 4/5 đã hoạt động.
