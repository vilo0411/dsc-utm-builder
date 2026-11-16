# DSC UTM Builder

Công cụ tạo link UTM cho Chứng khoán DSC, áp dụng cho 2 site: `www.dsc.com.vn` và `taichinhso.dsc.com.vn`. Web tĩnh, không cần build: mở `index.html` bằng trình duyệt hoặc deploy lên GitHub Pages.

## Các trang

| Trang | File | Dùng để |
| --- | --- | --- |
| Kho link | `thu-vien.html` | Mọi link cả team đã tạo: lọc, ghi nơi đặt, trạng thái, cảnh báo link cần thay, tải CSV. 3 kiểu xem: danh sách gọn (bấm để mở chi tiết), bảng sắp xếp được, thẻ chi tiết theo kênh. Cần Supabase. |
| Tạo link | `index.html` | Chọn kênh → vị trí → loại bài → trang đích → chiến dịch → sản phẩm. Hình minh họa điện thoại chỉ đúng chỗ dán link. Nút **Rút gọn** tạo link `is.gd` ngay trong tool. |
| Kế hoạch dẫn khách | `ke-hoach.html` | Bản đồ hành trình 3 tầng: Thu hút (Facebook, TikTok, YouTube, Zalo + Môi giới, Quảng cáo; mỗi kênh ghi shortform / longform) → Nuôi dưỡng (Báo cáo, Dịch vụ, Khóa học Tài Chính Số) → Mở tài khoản DSC. Bấm thẻ để xem từng tuyến link. Tab **Hướng dẫn theo kênh** cho team content: đặt link theo định dạng (video ngắn / dài / livestream), từng tài khoản dẫn về đâu, in ra PDF được. Kèm chiến lược theo kênh, funnel + event GA4, cách đọc trên GA4, tab Link cố định. |
| Quy chuẩn | `quy-chuan.html` | Quy chuẩn UTM. Các bảng mã sinh tự động từ danh mục nên luôn khớp với tool. In ra PDF được. |
| Danh mục | `danh-muc.html` | Sửa preset: kênh, trang đích, sản phẩm, loại bài, gợi ý trang đích, link cố định, chiến dịch, domain. Danh sách bên trái, form có giải thích bên phải; mã kỹ thuật ẩn trong mục “Mã kỹ thuật (nâng cao)” và bị khóa khi đã dùng. Tab **Lịch sử thay đổi** xem ai sửa gì và khôi phục bản cũ. |

## Dữ liệu dùng chung (Supabase)

Khi `assets/config.js` có Supabase URL + anon key (cách cài: `supabase/README.md`):

- **Danh mục** sửa xong bấm **Lưu** là cả team thấy ngay, không cần xuất file hay deploy. Mỗi mục ghi ai sửa lần cuối, lúc nào. Nếu người khác vừa lưu cùng mục, tool hỏi trước khi ghi đè.
- **Kho link** (`thu-vien.html`): mọi link được Copy / Rút gọn ở Tạo link và Kế hoạch đều tự vào kho. Lọc theo kênh, chiến dịch, trang đích, người tạo; ghi "đã đặt ở đâu"; đổi trạng thái Đang dùng / Cần thay / Ngưng dùng; tải CSV. Kho tự báo link cần xử lý khi trang đích đã tắt, đổi địa chỉ hoặc là trang tạm, kèm nút **Tạo link thay thế**.
- **Mẫu nhanh** (cột trái trang Tạo link): bấm **Lưu mẫu** để lưu kênh + vị trí + loại bài + trang đích + chiến dịch + sản phẩm. Lần sau bấm mẫu, chỉ cần gõ tiêu đề. Mẫu hay dùng nổi lên đầu.
- Không cần đăng nhập. Lần đầu lưu gì đó, tool hỏi tên một lần (đổi ở góc phải thanh menu). Mọi thay đổi được lưu bản trước / sau trong `audit_log`.
- Link rút gọn dùng chung: cùng một link dài thì cả team dùng chung một link ngắn.

## Chạy offline (chưa cấu hình Supabase)

Mọi preset nằm trong `assets/data.js`.

1. Vào **Danh mục**, sửa rồi bấm **Lưu**. Thay đổi có hiệu lực ngay, nhưng **chỉ trên trình duyệt của bạn** (localStorage).
2. Muốn cả team dùng bản mới: **Danh mục → Xuất / nhập file → Xuất data.js**, thay file `assets/data.js` trong repo rồi deploy.
3. Muốn gửi nhanh cho một đồng nghiệp: **Xuất JSON**, người kia **Nhập JSON**.

Mẫu nhanh vẫn dùng được nhưng chỉ lưu trên trình duyệt đó; Kho link cần Supabase.

Trên trang **Tạo link**, nút **Thêm / sửa** cạnh mỗi bước mở nhanh danh sách tương ứng (kênh, vị trí link, loại bài, trang đích, chiến dịch, sản phẩm) để thêm, sửa, xóa, sắp xếp mà không rời trang. Dữ liệu lưu chung chỗ với Danh mục.

Không sửa được trong Danh mục (phải sửa code): danh sách nền tảng và màu (`PLATFORMS` trong `assets/common.js`), hình minh họa (`assets/mockups.js`). Vị trí link thêm mới dùng hình minh họa "trong bài" của nền tảng. Bản đồ hành trình và hướng dẫn theo kênh sửa ở Danh mục → Kênh / tài khoản (định vị, trang đích cho video), Kênh, Định dạng theo nền tảng, Nuôi dưỡng, Chuyển đổi, Bước funnel. Tài khoản có “Tạm ngưng” (hiện là TikTok Ads) không hiện trên bản đồ.

Trang đích có trạng thái **Đang dùng / Tạm thời / Đã tắt**. Trang tạm hiện cảnh báo khi tạo link và nét đứt trên bản đồ; trang đã tắt bị ẩn khỏi Tạo link và bản đồ. Hai khóa học demo trên Web chính đang là “Tạm thời”: khi Tài Chính Số chuyển xong sang DSC, đổi sang “Đã tắt” và đổi trang đích của các link cố định / gợi ý đang trỏ về đó.

## Lưu trên trình duyệt

Khi chưa cấu hình Supabase: lịch sử link, link rút gọn, mẫu nhanh và danh mục đã chỉnh đều lưu trong localStorage của từng trình duyệt, không đồng bộ giữa các máy. Khi có Supabase, trình duyệt chỉ giữ bản sao danh mục để chạy nhanh và dùng tạm khi mất mạng.

## Rút gọn link

Dùng API công khai của `is.gd` (dự phòng `v.gd`), không cần tài khoản. Link UTM đầy đủ được gửi lên dịch vụ này. Nếu cả hai lỗi, tool copy link dài và mở TinyURL để rút gọn tay. API của TinyURL chặn gọi trực tiếp từ trình duyệt nên không dùng được.

## Cấu trúc

```
index.html, ke-hoach.html, quy-chuan.html, danh-muc.html
index.html, thu-vien.html (Kho link)
assets/config.js    Supabase URL + anon key (để trống = chạy offline)
assets/data.js      preset mặc định (danh mục), dự phòng khi chưa có / mất Supabase
assets/common.js    store (Supabase + localStorage), Kho link, Mẫu nhanh, tạo URL, rút gọn, clipboard, thanh menu
supabase/schema.sql bảng, RLS, audit log; supabase/README.md hướng dẫn cài
assets/mockups.js   hình minh họa vị trí link theo nền tảng
assets/quick-edit.js hộp thoại thêm / sửa danh mục ngay trên trang Tạo link
assets/style.css    giao diện (token màu ở :root, thay khi áp design system DSC)
```
