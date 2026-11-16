# DSC

Hệ thống thiết kế thương hiệu DSC: bảng màu xanh lá trên nền Gunmetal và trắng, một họ chữ duy nhất là Plus Jakarta Sans, bố cục vuông vắn, nhiều khoảng trắng và chia vùng bằng đường kẻ mảnh.

Nguồn: bộ deck thương hiệu DSC trên Figma, gồm slide 11 (Dải màu thương hiệu), 14 (Font hiển thị), 15 (Font hiển thị Web) và logo. Phần nào không có trong deck được ghi rõ là **tạm thời**.

## Nền tảng thị giác

**Tinh thần.** Thương hiệu DSC trông sạch và rõ ràng. Mỗi slide có nền trắng hoặc một khối màu đặc tràn viền, chữ đen đậm, đường kẻ 1px phân tách nội dung với chân trang, còn số trang nằm ở góc phải. Deck không dùng gradient hay bóng đổ, các khối đều vuông góc.

**Cấu trúc slide (từ deck).**
- Chân slide: đường kẻ `hairline` ngang toàn bộ chiều rộng. Bên dưới, tiêu đề slide nằm bên trái (`heading-4` trở lên, đậm) và số trang nằm bên phải.
- Nội dung chia cột lớn bằng đường kẻ dọc, theo kiểu bảng như ở bảng thang chữ.
- Lề trái khoảng `space-4` (48px).

## Màu sắc

Có 6 màu thương hiệu. Các token ngữ nghĩa (`surface`, `ink`, `primary`…) là alias của 6 màu này, nên khi xây UI hãy dùng token ngữ nghĩa.

| Token | Hex | Vai trò |
|---|---|---|
| `gunmetal` | #272D2B | Chữ chính, nền tối |
| `pine-teal` | #1D4130 | Nền tối phụ, chữ phụ |
| `lime-green` | #2AD03D | Màu nhận diện chính, nút chính |
| `emerald` | #1BBE72 | Nhấn phụ, biểu đồ |
| `frosted-mint` | #8CFFCC | Nền tint, highlight |
| `white` | #FFFFFF | Nền chính |

**Quy tắc tương phản (WCAG):**
- Chữ trên `lime-green` hoặc `emerald` **luôn dùng `gunmetal`** (6.8:1 và 5.8:1). Chữ trắng trên hai màu này chỉ đạt 2.06:1 và 2.43:1, **không được dùng**. Riêng nhãn mã màu trắng trên swatch trong slide 11 là cách trình bày của deck, không áp dụng cho UI.
- `lime-green` và `emerald` không dùng làm màu chữ trên nền trắng. Khi cần chữ mang màu thương hiệu, dùng `accent-text` (Pine Teal ở theme sáng, Lime Green ở theme tối).
- `gunmetal` và `pine-teal` gần nhau về độ sáng (1.24:1), nên đừng dựa vào chúng để phân biệt hai trạng thái.
- `lime-green` và `emerald` cũng gần nhau (1.18:1). Trong biểu đồ, nếu cần tách hai chuỗi, ghép một màu sáng (`frosted-mint`) với một màu tối (`pine-teal`).

**Tỷ trọng gợi ý.** Nền trắng hoặc Gunmetal chiếm phần lớn, Lime Green dùng làm điểm nhấn, còn Emerald và Frosted Mint là màu hỗ trợ.

## Typography

Một họ chữ duy nhất là **Plus Jakarta Sans** (Google Fonts), có hỗ trợ tiếng Việt. Thang chữ web lấy từ slide 15:

| Style | Cỡ · Weight |
|---|---|
| `heading-1` | 56 · 700 |
| `heading-2` | 42 · 700 |
| `heading-3` | 32 · 700 |
| `heading-4` | 20 · 600 |
| `paragraph-bold` | 15 · 700 |
| `paragraph-semibold` | 15 · 600 |
| `paragraph` | 15 · 400 |
| `subtitle-semibold` | 14 · 600 |
| `subtitle` | 14 · 400 |
| `subtitle-italic` | 14 · 400 italic |

Deck ghi đơn vị "pt", ở đây quy đổi thành px cho web. Line-height **tạm thời**: 1.1–1.3 cho tiêu đề, 1.45–1.5 cho thân bài.

Nạp font:
```html
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">
```

## Logo

Logo chữ "DSC". Chữ D có các vạch ngang cắt ở cạnh trái, gợi tốc độ. Có hai bản:
- **Xanh (Lime Green)**: dùng trên nền trắng hoặc Gunmetal. Trên nền trắng tương phản thấp (2.06:1), nên bản xanh trên Gunmetal là cách đặt nổi bật nhất.
- **Trắng**: dùng trên `gunmetal`, `pine-teal` hoặc ảnh tối. Không đặt bản trắng trên Lime Green, Emerald hay Frosted Mint.

Không đổi màu, kéo giãn, xoay hay thêm hiệu ứng cho logo. Lưu ý: file logo hiện chỉ là PNG 93×33px. Cần bản SVG gốc để dùng ở kích thước lớn.

## Khoảng cách & bo góc (tạm thời)

Deck không quy định các giá trị này. Hệ thống tạm dùng lưới 8px: `space-1` 8, `space-2` 16, `space-3` 24, `space-4` 48. Mặc định không bo góc (`radius-none`) để giữ đúng tinh thần vuông vắn của deck. `radius-sm` (4px) và `radius-md` (8px) chỉ dành cho nút, ô nhập và thẻ trên web.

## Còn thiếu so với bộ nhận diện đầy đủ

- Logo SVG gốc, vùng an toàn và kích thước tối thiểu
- Giọng văn và nguyên tắc nội dung
- Iconography, phong cách hình ảnh
- Component (nút, thẻ, form…)
