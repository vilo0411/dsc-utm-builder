# Quy chuẩn UTM – Chứng khoán DSC

> **Bản chính thức là trang `quy-chuan.html`** (mở từ menu “Quy chuẩn” của tool). Các bảng mã trên trang đó lấy trực tiếp từ `assets/data.js`, nên luôn khớp với tool. File này chỉ giữ để tham khảo và có thể cũ hơn.

Quy chuẩn đặt UTM cho mọi link trỏ về 2 website của DSC: **Web chính** (`www.dsc.com.vn`) và **DSC Tài Chính Số** (`taichinhso.dsc.com.vn`). Tạo link bằng DSC UTM Builder (`index.html`), không gõ tay.

## Nguyên tắc chung

1. **Viết thường, không dấu, không khoảng trắng.** GA4 phân biệt hoa thường: `TikTok_DSC` và `tiktok_dsc` bị tính thành 2 dòng.
2. **Phân cách bằng dấu gạch dưới `_`** cho mọi tham số.
3. **Chỉ dùng mã có trong tài liệu này.** Muốn dùng mã mới thì thêm vào bảng trước, rồi mới tạo link.
4. **Không đổi mã đã dùng.** Đổi mã sẽ làm lịch sử của kênh bị tách làm đôi.
5. **Mã organic không được chứa `cp`, `ppc` và không bắt đầu bằng `paid`.** Nếu vi phạm, GA4 sẽ xếp traffic vào Paid.
6. **Source luôn là nền tảng thật** (`tiktok`, `youtube`, `facebook`, `zalo`…). Tên tài khoản đặt ở medium.
7. **Link Tài Chính Số luôn dùng `taichinhso.dsc.com.vn`**, không dùng `taichinhso.hvsvn.com`.

## 5 tham số UTM

| Tham số | Ý nghĩa | Ví dụ |
| --- | --- | --- |
| `utm_source` | Nền tảng đưa traffic về | `tiktok` |
| `utm_medium` | Tài khoản / hình thức tiếp cận | `tiktok_dfin24` |
| `utm_campaign` | Chiến dịch / tuyến bài | `mo_tai_khoan_thang_11` |
| `utm_content` | Bài đăng cụ thể (vị trí + loại + tiêu đề) | `description_livestream_nhan_dinh_vn_index` |
| `utm_product` | Sản phẩm / khóa học được nhắc đến | `nha_phan_tich` |

GA4 không tự đọc `utm_product`. Để mã này vào được báo cáo, cần cài GTM theo mục [Cài đặt GA4 / GTM](#cài-đặt-ga4--gtm).

## Bảng mã kênh

**Quy tắc đặt medium:** `<nền tảng hoặc loại kênh>_<tài khoản>`. Medium vẫn ghi tên tài khoản kể cả khi nền tảng mới có 1 tài khoản, để sau này mở thêm tài khoản không phải đổi quy tắc. Kênh đang Off không có mã. Khi bật lại kênh thì thêm mã vào bảng.

| `utm_source` | `utm_medium` | Tài khoản | Quản lý |
| --- | --- | --- | --- |
| facebook | `fanpage_dsc` | Chứng khoán DSC (facebook.com/dsc.securities) | Truyền thông |
| facebook | `fanpage_excel` | Excel.Taichinhso | MKT |
| tiktok | `tiktok_dsc` | Chứng khoán DSC | Truyền thông |
| tiktok | `tiktok_dtrending` | D-Trending | MKT |
| tiktok | `tiktok_ckdeot` | Chứng khoán dễ ợt | MKT |
| tiktok | `tiktok_tiendivedau` | Tiền đi về đâu | MKT |
| tiktok | `tiktok_dfin24` | D-Fin24 | MKT |
| tiktok | `tiktok_excel` | Excel.Taichinhso | MKT |
| tiktok | `tiktok_tcs` | Tài chính số (@tai_chinh_so) | Phân tích |
| youtube | `youtube_dsc` | Chứng khoán DSC (@DSCsecurities) | Truyền thông |
| youtube | `youtube_tcs` | Tài chính số DSC | Phân tích |
| youtube | `youtube_excel` | Excel.Taichinhso | MKT |
| zalo | `zalo_oa` | Zalo OA Chứng khoán DSC | Truyền thông |
| zalo | `zalo_moigioi` | Môi giới gửi link qua Zalo | Môi giới |
| google / facebook / tiktok | `cpc` | Quảng cáo trả tiền | MKT |

**Paid:** medium luôn là `cpc`, không ghi tên tài khoản. Source là nền tảng quảng cáo (`google`, `facebook`, `tiktok`). Field `utm_content` là tiêu đề mẫu quảng cáo. Nếu một bài organic được đẩy sang chạy ads, đổi medium sang `cpc` trước khi chạy. Google Ads đang bật auto-tagging (gclid) thì GA4 lấy source/medium từ gclid. Khi đó UTM thủ công chỉ dùng để bổ sung content và product.

## Content

**`utm_content` = `[vị trí]_<loại nội dung>_<tiêu đề>`**. Tiêu đề dài tối đa 5–6 từ.

| Tiền tố | Dùng cho | Ví dụ |
| --- | --- | --- |
| `nhan_dinh` | Nhận định thị trường / cổ phiếu | `nhan_dinh_vn_index_tuan_47` |
| `kien_thuc` | Bài kiến thức | `kien_thuc_doc_bao_cao_tai_chinh` |
| `tin_tuc` | Tin tức | `tin_tuc_fed_giu_lai_suat` |
| `livestream` | Livestream | `livestream_chien_luoc_thang_12` |
| `hoi_thao` | Hội thảo, tọa đàm | `hoi_thao_trien_vong_2027` |
| `bao_cao` | Báo cáo phân tích | `bao_cao_msh_q3_2026` |
| `khuyen_mai` | Khuyến mãi, ưu đãi | `khuyen_mai_mien_phi_giao_dich` |
| `sales` | Bài bán khóa học / mời mở tài khoản | `sales_nha_phan_tich_k5` |
| `event` | Sự kiện công ty | `event_sinh_nhat_dsc` |
| `bio` | Vị trí: link cố định ở bio / trang kênh. Chỉ ghi `bio` | `bio` |
| `description` | Vị trí: link trong mô tả video YouTube | `description_livestream_chien_luoc_thang_12` |
| `cmt` | Vị trí: link trong comment, kể cả comment ghim | `cmt_nhan_dinh_vn_index_tuan_47` |
| `story` | Vị trí: link qua sticker Story Facebook | `story_hoi_thao_trien_vong_2027` |
| `menu` | Vị trí: link cố định ở menu Zalo OA. Chỉ ghi `menu` | `menu` |

Link nằm trong thân bài / caption là mặc định, nên không cần ghi vị trí. TikTok chỉ cho đặt link ở bio, nên link TikTok luôn là `bio`. Link ở nút CTA, mục Giới thiệu của fanpage và phần đường liên kết trên trang kênh YouTube đều tính là `bio`. Link `bio` và `menu` là link cố định, không gắn chiến dịch.

## Product

| Nhóm | Sản phẩm | Mã |
| --- | --- | --- |
| DSC · Dịch vụ | Mở tài khoản | `mo_tai_khoan` |
| DSC · Dịch vụ | App DSC Trading | `app_dsc_trading` |
| DSC · Dịch vụ | Báo cáo phân tích | `bao_cao_phan_tich` |
| DSC · Dịch vụ | Tư vấn đầu tư | `tu_van_dau_tu` |
| DSC · Khóa học | Khóa tân thủ chứng khoán (miễn phí) | `khoa_tan_thu` |
| DSC · Khóa học | Kỹ thuật thực chiến | `ky_thuat_thuc_chien` |
| DSC Tài Chính Số | Nhà phân tích | `nha_phan_tich` |
| DSC Tài Chính Số | Nhà tư vấn | `nha_tu_van` |
| DSC Tài Chính Số | Excel ứng dụng cho nhân sự | `excel_nhan_su` |
| DSC Tài Chính Số | Excel Dashboard ngân hàng | `excel_dashboard_ngan_hang` |

## Plan backlink: link cố định từ mỗi kênh về DSC

Mỗi kênh cài sẵn link cố định (bio, nút CTA, menu) trỏ về 1 trong 2 site. Các link này đã được tạo sẵn trong tab **Link có sẵn** của tool, mỗi vị trí chỉ cần cài một lần. Khi đổi trang đích, sửa `SLOTS` trong `index.html` rồi cài lại link mới.

| Kênh | Vị trí | Trang đích | Site |
| --- | --- | --- | --- |
| Fanpage Chứng khoán DSC | Nút CTA | Mở tài khoản | Web chính |
| Fanpage Chứng khoán DSC | Giới thiệu → Trang web | Trang chủ | Web chính |
| Fanpage Excel.Taichinhso | Nút CTA + Giới thiệu | Tất cả khóa học | Tài Chính Số |
| TikTok Chứng khoán DSC | Bio | Mở tài khoản | Web chính |
| TikTok D-Trending | Bio | Mở tài khoản | Web chính |
| TikTok Chứng khoán dễ ợt | Bio | Khóa tân thủ chứng khoán | Web chính |
| TikTok Tiền đi về đâu | Bio | Mở tài khoản | Web chính |
| TikTok D-Fin24 | Bio | Báo cáo phân tích | Web chính |
| TikTok Excel.Taichinhso | Bio | Tất cả khóa học (đổi sang trang khóa Excel khi có URL) | Tài Chính Số |
| TikTok Tài chính số | Bio | Khóa Nhà phân tích | Tài Chính Số |
| YouTube Chứng khoán DSC | Trang kênh: link 1 / link 2 | Mở tài khoản / Báo cáo phân tích | Web chính |
| YouTube Tài chính số DSC | Trang kênh: link 1 / link 2 | Khóa Nhà phân tích / Mở tài khoản | Tài Chính Số + Web chính |
| YouTube Excel.Taichinhso | Trang kênh | Tất cả khóa học | Tài Chính Số |
| Zalo OA | Menu (3 mục) | Mở tài khoản / Báo cáo phân tích / Khóa học | Cả 2 site |

**Logic phân bổ:** Kênh thương hiệu và kênh tin tức (DSC, D-Trending, Tiền đi về đâu) dẫn về trang Mở tài khoản, vì đây là chuyển đổi chính. Kênh nhận định thị trường (D-Fin24) dẫn về trang Báo cáo phân tích, để giữ đúng mạch nội dung người xem đang theo dõi. Kênh kiến thức cho người mới (Chứng khoán dễ ợt) dẫn về khóa tân thủ miễn phí. Kênh của Phòng Phân tích và kênh Excel dẫn về Tài Chính Số.

**Link theo bài** (mô tả video, bình luận ghim, bài fanpage, tin Zalo, quảng cáo) được tạo riêng cho từng bài ở tab **Tạo link cho bài mới**. Trang đích chọn theo nội dung bài. Mặc định:

| Loại nội dung | Trang đích mặc định |
| --- | --- |
| Nhận định, báo cáo, livestream thị trường | Báo cáo phân tích, hoặc Mở tài khoản |
| Kiến thức cho người mới | Khóa tân thủ / Kiến thức |
| Livestream, video của Phòng Phân tích | Khóa Nhà phân tích / Nhà tư vấn |
| Video Excel | Khóa Excel trên Tài Chính Số |
| Mời mở tài khoản, khuyến mãi | Mở tài khoản |

## Ví dụ link hoàn chỉnh

| Tình huống | Link |
| --- | --- |
| Bio TikTok Chứng khoán DSC | `https://www.dsc.com.vn/mo-tai-khoan?utm_source=tiktok&utm_medium=tiktok_dsc&utm_content=bio&utm_product=mo_tai_khoan` |
| Mô tả livestream YouTube Tài chính số DSC | `https://taichinhso.dsc.com.vn/thuc-tap-so/NHA-PHAN-TICH?utm_source=youtube&utm_medium=youtube_tcs&utm_content=description_livestream_nhan_dinh_vn_index_tuan_47&utm_product=nha_phan_tich` |
| TikTok Ads khóa Excel | `https://taichinhso.dsc.com.vn/thuc-tap-so?utm_source=tiktok&utm_medium=cpc&utm_campaign=excel_q4&utm_content=excel_dashboard_ngan_hang&utm_product=excel_dashboard_ngan_hang` |
| Môi giới gửi qua Zalo | `https://www.dsc.com.vn/mo-tai-khoan?utm_source=zalo&utm_medium=zalo_moigioi&utm_content=sales_moi_mo_tai_khoan&utm_product=mo_tai_khoan` |

## Cài đặt GA4 / GTM

1. **Ghi `utm_product` vào GA4.** Trong GTM (`GTM-MMNHPGKQ`), tạo Variable loại URL, component Query, key `utm_product`. Gắn variable này làm event parameter `utm_product` trên tag Google tag / page_view. Sau đó vào GA4 → Custom definitions, tạo custom dimension (scope Event) tên `utm_product`. Nếu muốn giữ product cho cả các trang xem sau trong phiên, lưu giá trị vào cookie hoặc sessionStorage ở lần chạm đầu.
2. **Kênh Zalo.** Zalo không có trong danh sách mạng xã hội mặc định của GA4. Vào GA4 → Channel groups, tạo custom channel group, thêm kênh "Zalo" với điều kiện `source = zalo`. Đặt kênh này trên Organic Social / Referral.
3. **Tài Chính Số.** Site đang chạy trên domain khác (`hvsvn.com`, chuyển sang domain DSC trong tuần này). Cần gắn cùng GA4 property `G-Z4B7FSFJDL` hoặc cùng GTM container, và khai báo cross-domain cho `dsc.com.vn` và `taichinhso.dsc.com.vn`. Nếu không, số liệu sẽ bị tách làm đôi và phiên đi từ web chính sang khóa học bị tính thành referral.
4. **Kiểm tra.** Mở từng link mẫu ở trên, xem GA4 DebugView có nhận đủ source / medium / campaign / content và `utm_product` không.
