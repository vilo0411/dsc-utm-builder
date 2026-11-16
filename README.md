# DSC UTM Builder

Công cụ tạo link UTM cho Chứng khoán DSC, áp dụng cho 2 site: `www.dsc.com.vn` và `taichinhso.dsc.com.vn`. Web tĩnh, không cần build: mở `index.html` bằng trình duyệt hoặc deploy lên GitHub Pages.

## Các trang

| Trang | File | Dùng để |
| --- | --- | --- |
| Tạo link | `index.html` | Chọn kênh → vị trí → loại bài → trang đích → chiến dịch → sản phẩm. Hình minh họa điện thoại chỉ đúng chỗ dán link. Nút **Rút gọn** tạo link `is.gd` ngay trong tool. |
| Kế hoạch dẫn khách | `ke-hoach.html` | Bản đồ hành trình 3 tầng: Thu hút (Facebook, TikTok, YouTube, Zalo + Môi giới, Quảng cáo; mỗi kênh ghi shortform / longform) → Nuôi dưỡng (Báo cáo, Dịch vụ, Khóa học Tài Chính Số) → Mở tài khoản DSC. Bấm thẻ để xem từng tuyến link. Tab **Hướng dẫn theo kênh** cho team content: đặt link theo định dạng (video ngắn / dài / livestream), từng tài khoản dẫn về đâu, in ra PDF được. Kèm chiến lược theo kênh, funnel + event GA4, cách đọc trên GA4, tab Link cố định. |
| Quy chuẩn | `quy-chuan.html` | Quy chuẩn UTM. Các bảng mã sinh tự động từ danh mục nên luôn khớp với tool. In ra PDF được. |
| Danh mục | `danh-muc.html` | Sửa preset: kênh, trang đích, sản phẩm, loại bài, gợi ý trang đích, link cố định, chiến dịch, domain. |

## Cập nhật danh mục (preset)

Mọi preset nằm trong `assets/data.js`.

1. Vào **Danh mục**, sửa rồi bấm **Lưu**. Thay đổi có hiệu lực ngay, nhưng **chỉ trên trình duyệt của bạn** (localStorage).
2. Muốn cả team dùng bản mới: **Danh mục → Xuất / nhập file → Xuất data.js**, thay file `assets/data.js` trong repo rồi deploy.
3. Muốn gửi nhanh cho một đồng nghiệp: **Xuất JSON**, người kia **Nhập JSON**.

Trên trang **Tạo link**, nút **Thêm / sửa** cạnh mỗi bước mở nhanh danh sách tương ứng (kênh, vị trí link, loại bài, trang đích, chiến dịch, sản phẩm) để thêm, sửa, xóa, sắp xếp mà không rời trang. Dữ liệu lưu chung chỗ với Danh mục.

Không sửa được trong Danh mục (phải sửa code): danh sách nền tảng và màu (`PLATFORMS` trong `assets/common.js`), hình minh họa (`assets/mockups.js`). Vị trí link thêm mới dùng hình minh họa "trong bài" của nền tảng. Bản đồ hành trình và hướng dẫn theo kênh sửa ở Danh mục → Kênh / tài khoản (định vị, trang đích cho video), Kênh, Định dạng theo nền tảng, Nuôi dưỡng, Chuyển đổi, Bước funnel. Tài khoản có “Tạm ngưng” (hiện là TikTok Ads) không hiện trên bản đồ.

Trang đích có trạng thái **Đang dùng / Tạm thời / Đã tắt**. Trang tạm hiện cảnh báo khi tạo link và nét đứt trên bản đồ; trang đã tắt bị ẩn khỏi Tạo link và bản đồ. Hai khóa học demo trên Web chính đang là “Tạm thời”: khi Tài Chính Số chuyển xong sang DSC, đổi sang “Đã tắt” và đổi trang đích của các link cố định / gợi ý đang trỏ về đó.

## Lưu trên trình duyệt

Lịch sử link, link rút gọn đã tạo, và danh mục đã chỉnh đều lưu trong localStorage của từng trình duyệt, không đồng bộ giữa các máy.

## Rút gọn link

Dùng API công khai của `is.gd` (dự phòng `v.gd`), không cần tài khoản. Link UTM đầy đủ được gửi lên dịch vụ này. Nếu cả hai lỗi, tool copy link dài và mở TinyURL để rút gọn tay. API của TinyURL chặn gọi trực tiếp từ trình duyệt nên không dùng được.

## Cấu trúc

```
index.html, ke-hoach.html, quy-chuan.html, danh-muc.html
assets/data.js      preset mặc định (danh mục)
assets/common.js    store, tạo URL, rút gọn, clipboard, thanh menu
assets/mockups.js   hình minh họa vị trí link theo nền tảng
assets/quick-edit.js hộp thoại thêm / sửa danh mục ngay trên trang Tạo link
assets/style.css    giao diện (token màu ở :root, thay khi áp design system DSC)
```
