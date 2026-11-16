# Cài Supabase cho DSC UTM Builder

Supabase giữ danh mục, Kho link và Mẫu nhanh chung cho cả team. Tool vẫn là web tĩnh (GitHub Pages), gọi thẳng REST API của Supabase, không cần server riêng.

## 1. Tạo project

1. Vào https://supabase.com → **New project**. Region gần nhất: Singapore.
2. Đợi project tạo xong.

## 2. Tạo bảng

1. **SQL Editor** → **New query**.
2. Dán toàn bộ file `supabase/schema.sql` → **Run**. Chạy lại nhiều lần cũng không sao.

Sau bước này có 4 bảng:

| Bảng | Chứa gì |
| --- | --- |
| `catalog` | Danh mục: mỗi dòng là một mục (kênh, trang đích, link cố định…) |
| `links` | Kho link: mọi link đã copy / rút gọn, trạng thái, nơi đặt, người tạo |
| `templates` | Mẫu nhanh ở trang Tạo link |
| `audit_log` | Bản trước / sau của mọi lần sửa, để khôi phục khi sửa nhầm |

## 3. Nối tool với Supabase

1. **Project Settings → API**: copy **Project URL** và khóa **anon public**.
2. Mở `assets/config.js`, điền:

```js
window.DSC_CONFIG = {
  supabaseUrl: "https://xxxx.supabase.co",
  supabaseKey: "eyJhbGciOi..."   // anon public key
};
```

3. Commit và deploy lên GitHub Pages.

Dùng khóa **publishable** (`sb_publishable_…`) hoặc **anon**. Hai loại này được thiết kế để công khai trong trình duyệt. **Tuyệt đối không** dán khóa `secret` / `service_role` vào `config.js`, vì repo và GitHub Pages đều công khai.

### Bảo vệ khi không đăng nhập

Ai có khóa publishable cũng gọi được API, nên chính database tự chặn những thay đổi có hại (phần "Hardening" cuối `schema.sql`):

- Link trong Kho link và URL trang đích trong danh mục **phải thuộc `dsc.com.vn`**. Không ai cài được link lừa đảo cho team copy.
- Link rút gọn chỉ nhận `https://is.gd/…` hoặc `https://v.gd/…`. Trình duyệt cũng tự bỏ qua link rút gọn lạ.
- Domain hợp lệ chỉ được là `dsc.com.vn` hoặc tên miền con của nó.
- Kho link chỉ sửa được trạng thái, nơi đặt, ghi chú và xóa mềm. URL, người tạo, ngày tạo không sửa được.
- Giới hạn độ dài và dung lượng để không ai đổ rác làm đầy database.
- **Không ai xóa hẳn được** dữ liệu. Mọi thay đổi đều vào `audit_log`, và `audit_log` không sửa / xóa được.

Rủi ro còn lại: người lạ vẫn có thể sửa tên, ghi chú, trạng thái hoặc danh mục (trong giới hạn trên). Khi đó khôi phục bằng `audit_log` (xem bên dưới). Muốn chặn hẳn thì phải bật đăng nhập.

## 4. Đưa dữ liệu hiện có lên (làm một lần)

Mở tool trên trình duyệt đang có danh mục chỉnh sửa mới nhất → **Danh mục → Dùng chung / xuất file → Đưa lên Supabase**. Bước này đẩy:

- toàn bộ danh mục (data.js + chỉnh sửa trên trình duyệt đó),
- lịch sử link và link rút gọn đã lưu trên trình duyệt đó vào Kho link.

Các trình duyệt khác chỉ cần tải lại trang.

## Khôi phục khi sửa nhầm

**Danh mục → Lịch sử thay đổi**: mỗi lần lưu hiện ai sửa, lúc nào, thêm / xóa / sửa dòng nào. Bấm **Khôi phục về trước lần sửa này** để đưa mục đó về như cũ cho cả team. Bản khôi phục cũng được ghi vào lịch sử, nên làm ngược lại được.

Link trong Kho link chỉ bị xóa mềm (`deleted_at`). Muốn lấy lại: Supabase → Table Editor → `links`, xóa giá trị ở cột `deleted_at`.

## Mất kết nối

Không gọi được Supabase thì tool dùng bản danh mục tải lần trước (hoặc data.js) và hiện thanh báo màu vàng. Kho link tạm không dùng được, tạo link vẫn bình thường.
