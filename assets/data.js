// DSC UTM Builder – default catalog (presets).
// Every page reads this file. Edits made on "Danh mục" are stored in the browser (localStorage);
// use "Xuất data.js" there to produce a new version of this file, then commit it so the whole team gets the update.
// Keep in sync with quy-chuan.html (tables there are generated from this data).
window.DSC_DEFAULTS = {
  version: 2,

  // Accounts / channels. p = platform tab (facebook|tiktok|youtube|zalo|ads|other), s = utm_source, m = utm_medium.
  // pos = allowed link positions ("" = in post body / message). Paid accounts have no position.
  // mode "script" = links are sent following a script (broker care script, ad campaign), not per video / message.
  accounts: [
    { p: "facebook", s: "facebook", m: "fanpage_dsc", name: "Chứng khoán DSC", sub: "facebook.com/dsc.securities", owner: "Truyền thông", pos: ["", "cmt", "story", "bio"], focus: "Thương hiệu DSC: nhận định, tin công ty, livestream chiến lược", to: ["bcpt", "mtk"] },
    { p: "facebook", s: "facebook", m: "fanpage_excel", name: "Excel.Taichinhso", sub: "Fanpage", owner: "MKT", pos: ["", "cmt", "story", "bio"], focus: "Excel ứng dụng cho tài chính, ngân hàng", to: ["tcs"] },
    { p: "tiktok", s: "tiktok", m: "tiktok_dsc", name: "Chứng khoán DSC", sub: "", owner: "Truyền thông", pos: ["bio"], focus: "Thương hiệu DSC" },
    { p: "tiktok", s: "tiktok", m: "tiktok_dtrending", name: "D-Trending", sub: "", owner: "MKT", pos: ["bio"], focus: "Tin nóng, trend thị trường" },
    { p: "tiktok", s: "tiktok", m: "tiktok_ckdeot", name: "Chứng khoán dễ ợt", sub: "", owner: "MKT", pos: ["bio"], focus: "Kiến thức chứng khoán cho người mới" },
    { p: "tiktok", s: "tiktok", m: "tiktok_tiendivedau", name: "Tiền đi về đâu", sub: "", owner: "MKT", pos: ["bio"], focus: "Dòng tiền, vĩ mô, tài chính cá nhân" },
    { p: "tiktok", s: "tiktok", m: "tiktok_dfin24", name: "D-Fin24", sub: "", owner: "MKT", pos: ["bio"], focus: "Nhận định thị trường hằng ngày" },
    { p: "tiktok", s: "tiktok", m: "tiktok_excel", name: "Excel.Taichinhso", sub: "", owner: "MKT", pos: ["bio"], focus: "Excel ứng dụng" },
    { p: "tiktok", s: "tiktok", m: "tiktok_tcs", name: "Tài chính số", sub: "@tai_chinh_so", owner: "Phân tích", pos: ["bio"], focus: "Phòng Phân tích: kiến thức phân tích, đào tạo" },
    { p: "tiktok", s: "tiktok", m: "tiktok_insights", name: "Insights by DSC", sub: "@insightsbydsc", owner: "MKT", pos: ["bio"], focus: "Góc nhìn, insight phân tích của DSC" },
    { p: "tiktok", s: "tiktok", m: "tiktok_thayque", name: "Thầy Quế dạy chứng", sub: "@thayquedaychung83", owner: "MKT", pos: ["bio"], focus: "Dạy chứng khoán" },
    { p: "youtube", s: "youtube", m: "youtube_dsc", name: "Chứng khoán DSC", sub: "@DSCsecurities", owner: "Truyền thông", pos: ["description", "cmt", "bio"], focus: "Thương hiệu DSC: phân tích dài, livestream chiến lược", to: ["bcpt", "mtk"] },
    { p: "youtube", s: "youtube", m: "youtube_tcs", name: "Tài chính số DSC", sub: "", owner: "Phân tích", pos: ["description", "cmt", "bio"], focus: "Bài giảng, livestream của Phòng Phân tích", to: ["tcs"] },
    { p: "youtube", s: "youtube", m: "youtube_excel", name: "Excel.Taichinhso", sub: "", owner: "MKT", pos: ["description", "cmt", "bio"], focus: "Bài giảng Excel ứng dụng", to: ["tcs"] },
    { p: "zalo", s: "zalo", m: "zalo_oa", name: "Zalo OA DSC", sub: "Tin gửi người theo dõi", owner: "Truyền thông", pos: ["", "menu"], focus: "Tin nhận định, báo cáo, sự kiện gửi người theo dõi", to: ["mtk", "bcpt", "tcs"] },
    { p: "zalo", s: "zalo", m: "zalo_moigioi", name: "Môi giới gửi link", sub: "Chat Zalo với khách", owner: "Môi giới", pos: [""], prefixOptional: true, focus: "Môi giới chat 1-1 với khách", to: ["mtk"], mode: "script", script: "Gửi link theo kịch bản chăm sóc khách của Môi giới." },
    { p: "ads", s: "facebook", m: "cpc", name: "Facebook / Instagram Ads", sub: "Meta Ads Manager", owner: "MKT", paid: true, to: ["mtk", "tcs"] },
    { p: "ads", s: "tiktok", m: "cpc", name: "TikTok Ads", sub: "Chưa chạy", owner: "MKT", paid: true, inactive: true },
    { p: "ads", s: "google", m: "cpc", name: "Google Ads", sub: "Search, YouTube, Display", owner: "MKT", paid: true, to: ["mtk", "tcs"], mode: "script", script: "Link theo kịch bản từng chiến dịch Google Ads (Search, YouTube)." }
  ],

  // Landing pages. product = default utm_product when this page is chosen.
  // state: "" = in use, "tam" = temporary (shown with a warning), "off" = switched off (hidden everywhere).
  landings: [
    { id: "home", site: "Web chính", label: "Trang chủ", url: "https://www.dsc.com.vn/", product: "" },
    { id: "mtk", site: "Web chính", label: "Mở tài khoản", url: "https://www.dsc.com.vn/mo-tai-khoan", product: "mo_tai_khoan" },
    { id: "bcpt", site: "Web chính", label: "Báo cáo phân tích", url: "https://www.dsc.com.vn/bao-cao-phan-tich", product: "bao_cao_phan_tich" },
    { id: "tvdt", site: "Web chính", label: "Tư vấn đầu tư", url: "https://www.dsc.com.vn/dich-vu/dich-vu-tu-van-dau-tu", product: "tu_van_dau_tu" },
    { id: "app", site: "Web chính", label: "Hệ sinh thái DSC Trade (app)", url: "https://www.dsc.com.vn/he-sinh-thai/dsctrade", product: "app_dsc_trading" },
    { id: "kt", site: "Web chính", label: "Kiến thức", url: "https://www.dsc.com.vn/kien-thuc", product: "" },
    { id: "tanthu", site: "Web chính", label: "Khóa tân thủ chứng khoán", url: "https://www.dsc.com.vn/kien-thuc/khoa-hoc-chung-khoan-tan-thu", product: "khoa_tan_thu", state: "tam", note: "Bản demo trên Web chính. Tắt khi Tài Chính Số chuyển xong sang DSC, đào tạo dồn về Tài Chính Số." },
    { id: "ktthucchien", site: "Web chính", label: "Khóa kỹ thuật thực chiến", url: "https://www.dsc.com.vn/kien-thuc/khoa-hoc-ky-thuat-thuc-chien", product: "ky_thuat_thuc_chien", state: "tam", note: "Bản demo trên Web chính. Tắt khi Tài Chính Số chuyển xong sang DSC, đào tạo dồn về Tài Chính Số." },
    { id: "tcs", site: "Tài Chính Số", label: "Khóa học Tài Chính Số", url: "https://taichinhso.dsc.com.vn/thuc-tap-so", product: "khoa_hoc_tcs" }
  ],

  products: [
    { group: "DSC · Dịch vụ", name: "Mở tài khoản", code: "mo_tai_khoan" },
    { group: "DSC · Dịch vụ", name: "App DSC Trading", code: "app_dsc_trading" },
    { group: "DSC · Dịch vụ", name: "Báo cáo phân tích", code: "bao_cao_phan_tich" },
    { group: "DSC · Dịch vụ", name: "Tư vấn đầu tư", code: "tu_van_dau_tu" },
    { group: "DSC · Khóa học", name: "Khóa tân thủ chứng khoán (miễn phí)", code: "khoa_tan_thu" },
    { group: "DSC · Khóa học", name: "Kỹ thuật thực chiến", code: "ky_thuat_thuc_chien" },
    { group: "DSC Tài Chính Số", name: "Khóa học Tài Chính Số (chung)", code: "khoa_hoc_tcs" },
    { group: "DSC Tài Chính Số", name: "Nhà phân tích", code: "nha_phan_tich" },
    { group: "DSC Tài Chính Số", name: "Nhà tư vấn", code: "nha_tu_van" },
    { group: "DSC Tài Chính Số", name: "Excel ứng dụng cho nhân sự", code: "excel_nhan_su" },
    { group: "DSC Tài Chính Số", name: "Excel Dashboard ngân hàng", code: "excel_dashboard_ngan_hang" }
  ],

  // Content type prefixes for utm_content.
  prefixes: [
    { code: "nhan_dinh", label: "Nhận định", help: "Thị trường, cổ phiếu" },
    { code: "kien_thuc", label: "Kiến thức", help: "Hướng dẫn, giải thích" },
    { code: "tin_tuc", label: "Tin tức", help: "Kinh tế, doanh nghiệp" },
    { code: "livestream", label: "Livestream", help: "Phát trực tiếp" },
    { code: "hoi_thao", label: "Hội thảo", help: "Hội thảo, tọa đàm" },
    { code: "bao_cao", label: "Báo cáo", help: "Báo cáo phân tích" },
    { code: "khuyen_mai", label: "Khuyến mãi", help: "Ưu đãi, miễn phí" },
    { code: "sales", label: "Mời đăng ký", help: "Mở tài khoản, khóa học" },
    { code: "event", label: "Sự kiện", help: "Hoạt động công ty" }
  ],

  // Per-post routing plan: content type -> suggested landing page(s), in priority order.
  routes: [
    { prefix: "nhan_dinh", to: "bcpt" }, { prefix: "nhan_dinh", to: "mtk" },
    { prefix: "bao_cao", to: "bcpt" }, { prefix: "bao_cao", to: "mtk" },
    { prefix: "livestream", to: "bcpt" }, { prefix: "livestream", to: "tcs" },
    { prefix: "tin_tuc", to: "bcpt" }, { prefix: "tin_tuc", to: "mtk" },
    { prefix: "kien_thuc", to: "tcs" }, { prefix: "kien_thuc", to: "tanthu" },
    { prefix: "hoi_thao", to: "mtk" }, { prefix: "hoi_thao", to: "tcs" },
    { prefix: "khuyen_mai", to: "mtk" },
    { prefix: "sales", to: "mtk" }, { prefix: "sales", to: "tcs" },
    { prefix: "event", to: "home" }
  ],

  // Backlink plan: fixed link slots on every channel. pos = bio | menu. where = short label, how = steps to install.
  slots: [
    { m: "fanpage_dsc", pos: "bio", where: "Nút CTA", how: "Trang → Chỉnh sửa nút → “Đăng ký” → Liên kết đến trang web", to: "mtk" },
    { m: "fanpage_dsc", pos: "bio", where: "Giới thiệu → Trang web", how: "Trang → Giới thiệu → Thông tin liên hệ → Trang web", to: "home" },
    { m: "fanpage_excel", pos: "bio", where: "Nút CTA + Giới thiệu", how: "Trang → Chỉnh sửa nút / Giới thiệu → Trang web", to: "tcs" },
    { m: "tiktok_dsc", pos: "bio", where: "Bio", how: "Hồ sơ → Sửa hồ sơ → Trang web", to: "home" },
    { m: "tiktok_dtrending", pos: "bio", where: "Bio", how: "Hồ sơ → Sửa hồ sơ → Trang web", to: "home" },
    { m: "tiktok_ckdeot", pos: "bio", where: "Bio", how: "Hồ sơ → Sửa hồ sơ → Trang web", to: "tcs" },
    { m: "tiktok_tiendivedau", pos: "bio", where: "Bio", how: "Hồ sơ → Sửa hồ sơ → Trang web", to: "tcs" },
    { m: "tiktok_dfin24", pos: "bio", where: "Bio", how: "Hồ sơ → Sửa hồ sơ → Trang web", to: "home" },
    { m: "tiktok_excel", pos: "bio", where: "Bio", how: "Hồ sơ → Sửa hồ sơ → Trang web (đổi sang trang khóa Excel khi có URL)", to: "tcs" },
    { m: "tiktok_tcs", pos: "bio", where: "Bio", how: "Hồ sơ → Sửa hồ sơ → Trang web", to: "tcs" },
    { m: "tiktok_insights", pos: "bio", where: "Bio", how: "Hồ sơ → Sửa hồ sơ → Trang web", to: "home" },
    { m: "tiktok_thayque", pos: "bio", where: "Bio", how: "Hồ sơ → Sửa hồ sơ → Trang web", to: "tcs" },
    { m: "youtube_dsc", pos: "bio", where: "Link 1 trang kênh", how: "YouTube Studio → Tùy chỉnh → Thông tin cơ bản → Đường liên kết", to: "mtk" },
    { m: "youtube_dsc", pos: "bio", where: "Link 2 trang kênh", how: "YouTube Studio → Tùy chỉnh → Thông tin cơ bản → Đường liên kết", to: "bcpt" },
    { m: "youtube_tcs", pos: "bio", where: "Link trang kênh", how: "YouTube Studio → Tùy chỉnh → Thông tin cơ bản → Đường liên kết", to: "tcs" },
    { m: "youtube_excel", pos: "bio", where: "Link trang kênh", how: "YouTube Studio → Tùy chỉnh → Thông tin cơ bản → Đường liên kết", to: "tcs" },
    { m: "zalo_oa", pos: "menu", where: "Menu: Mở tài khoản", how: "Zalo OA Manager → Quản lý → Menu → Liên kết", to: "mtk" },
    { m: "zalo_oa", pos: "menu", where: "Menu: Báo cáo phân tích", how: "Zalo OA Manager → Quản lý → Menu → Liên kết", to: "bcpt" },
    { m: "zalo_oa", pos: "menu", where: "Menu: Khóa học", how: "Zalo OA Manager → Quản lý → Menu → Liên kết", to: "tcs" }
  ],

  campaigns: [
    { name: "Mở tài khoản tháng 11" },
    { name: "Khai giảng khóa học Tài Chính Số" }
  ],

  hosts: [
    { host: "dsc.com.vn" }, { host: "www.dsc.com.vn" }, { host: "taichinhso.dsc.com.vn" }
  ],

  // Journey map (ke-hoach.html), column 1 "Thu hút": one channel per platform.
  // landings = fallback pages for per-video links (an account's own "to" list wins).
  groups: [
    { id: "facebook", name: "Facebook", platforms: ["facebook"], role: "Thu hút",
      goal: "Kéo người xem video trên fanpage sang website: báo cáo, khóa học, mở tài khoản.",
      cta: "Nút CTA + mục Giới thiệu (cố định); bình luận ghim, caption video (theo video).",
      landings: ["bcpt", "tcs", "mtk"], kpi: "Phiên từ fanpage, tỷ lệ phiên đi tiếp sang trang Mở tài khoản." },
    { id: "tiktok", name: "TikTok", platforms: ["tiktok"], role: "Thu hút",
      goal: "Kéo người xem video và live vào trang hồ sơ, bấm link bio. Kênh mang brand DSC dẫn về web DSC, kênh còn lại dẫn về Tài Chính Số.",
      cta: "Link bio của từng tài khoản (cố định).",
      landings: [], kpi: "Phiên từ link bio theo từng tài khoản." },
    { id: "youtube", name: "YouTube", platforms: ["youtube"], role: "Thu hút",
      goal: "Người xem đã quan tâm sâu: dẫn về báo cáo phân tích và khóa học.",
      cta: "Link trang kênh (cố định); mô tả video, bình luận ghim (theo video).",
      landings: ["bcpt", "tcs", "mtk"], kpi: "Tỷ lệ phiên từ YouTube có xem trang Mở tài khoản." },
    { id: "zalo", name: "Zalo + Môi giới", platforms: ["zalo"], role: "Chuyển đổi",
      goal: "Khách đã quen DSC: dẫn thẳng tới trang Mở tài khoản.",
      cta: "Menu OA (cố định); link trong tin nhắn (theo tin).",
      landings: ["mtk", "tcs"], kpi: "Số mở tài khoản thành công từ Zalo." },
    { id: "ads", name: "Quảng cáo", platforms: ["ads"], role: "Chuyển đổi",
      goal: "Facebook Ads và Google Ads đẩy chiến dịch có ngân sách tới trang đích của chiến dịch.",
      cta: "URL đích của mẫu quảng cáo (medium = cpc).",
      landings: ["mtk", "tcs"], kpi: "Chi phí mỗi tài khoản mở thành công (xem ở report Ads)." }
  ],

  // Content formats per platform: where the link goes, what to say in the video, utm_content pattern.
  // fmt: short | long | live | msg | ad. Shown on the journey map and in "Hướng dẫn theo kênh".
  formats: [
    { p: "facebook", fmt: "short", label: "Reels", where: "Bình luận ghim + nút CTA của trang. Link trong caption Reels thường không bấm được.", cta: "“Link ở bình luận ghim” hoặc “bấm nút Đăng ký trên trang”.", content: "cmt_<loại>_<tiêu đề>" },
    { p: "facebook", fmt: "long", label: "Video dài", where: "Dòng đầu caption + bình luận ghim.", cta: "“Xem báo cáo / đăng ký ở link bên dưới”.", content: "<loại>_<tiêu đề>, cmt_<loại>_<tiêu đề>" },
    { p: "facebook", fmt: "live", label: "Livestream", where: "Mô tả bài live + bình luận ghim trong live.", cta: "Nhắc link mỗi 10–15 phút, ghim bình luận có link ngay khi bắt đầu.", content: "cmt_livestream_<tiêu đề>" },
    { p: "tiktok", fmt: "short", label: "Video ngắn", where: "Chỉ có link bio.", cta: "“Link ở bio” ở cuối video + bình luận ghim nhắc lại.", content: "bio" },
    { p: "tiktok", fmt: "live", label: "Livestream", where: "Chỉ có link bio. Link trong chat live thường không bấm được.", cta: "“Bấm vào avatar, link ở bio”, nhắc mỗi 10–15 phút.", content: "bio" },
    { p: "youtube", fmt: "short", label: "Shorts", where: "Gắn “video liên quan” sang video dài; link trang kênh. Link trong mô tả Shorts không bấm được.", cta: "“Xem bản đầy đủ ở video liên quan”.", content: "bio (qua trang kênh)" },
    { p: "youtube", fmt: "long", label: "Video dài", where: "2 dòng đầu mô tả + bình luận ghim.", cta: "“Link trong mô tả và bình luận ghim”.", content: "description_<loại>_<tiêu đề>, cmt_<loại>_<tiêu đề>" },
    { p: "youtube", fmt: "live", label: "Livestream", where: "Mô tả + bình luận ghim.", cta: "Nhắc link mỗi 10–15 phút.", content: "description_livestream_<tiêu đề>" },
    { p: "zalo", fmt: "msg", label: "Tin OA / tin nhắn", where: "Menu OA (cố định); link trong tin OA. Môi giới gửi link theo kịch bản chăm sóc.", cta: "Một câu mời ngắn + link rút gọn; môi giới dùng câu trong kịch bản.", content: "<loại>_<tiêu đề>" },
    { p: "ads", fmt: "short", label: "Video Reels / Shorts quảng cáo", where: "URL đích của mẫu quảng cáo (nút CTA).", cta: "Theo kịch bản mẫu quảng cáo.", content: "<tên mẫu quảng cáo>" },
    { p: "ads", fmt: "long", label: "Video YouTube quảng cáo, Google Search", where: "Final URL của mẫu quảng cáo.", cta: "Theo kịch bản mẫu quảng cáo.", content: "<tên mẫu quảng cáo>" }
  ],

  // Column 2 "Nuôi dưỡng": pages that warm the visitor up, each with a way to push on to Mở tài khoản.
  // Current plan links to 4 pages only: Báo cáo phân tích, Khóa học, Trang chủ, Mở tài khoản (the goal).
  // common: true = every channel links here anyway (profile website, page info); drawn as a band, not with arrows.
  hubs: [
    { id: "baocao", name: "Báo cáo phân tích", landings: ["bcpt"],
      next: "Trên trang báo cáo: nút “Mở tài khoản để nhận khuyến nghị đầy đủ”.", kpi: "Tỷ lệ phiên xem báo cáo → xem trang Mở tài khoản." },
    { id: "khoahoc", name: "Khóa học Tài Chính Số", landings: ["tcs", "tanthu", "ktthucchien"],
      next: "Học viên được mời mở tài khoản DSC (ưu đãi, email / Zalo sau khóa học).", kpi: "Đăng ký khóa học (chuyển đổi phụ), rồi tỷ lệ học viên mở tài khoản." },
    { id: "trangchu", name: "Trang chủ DSC", landings: ["home"], common: true,
      next: "Banner / nút Mở tài khoản trên trang chủ; menu dẫn sang Báo cáo phân tích, Khóa học.", kpi: "Tỷ lệ phiên vào trang chủ → xem trang Mở tài khoản." }
  ],

  // Column 3 "Chuyển đổi". main = the single end goal (landing = its page). Others are secondary, shown on their hub.
  conversions: [
    { id: "mtk", name: "Mở tài khoản DSC", main: true, landing: "mtk" },
    { id: "course", name: "Đăng ký khóa học", hub: "khoahoc" }
  ],

  // Funnel steps per conversion, in order. event = GA4 event name (placeholder names; replace with the real ones).
  steps: [
    { conv: "mtk", step: "Xem trang Mở tài khoản", event: "view_mo_tai_khoan" },
    { conv: "mtk", step: "Bắt đầu điền form", event: "form_start_mo_tai_khoan" },
    { conv: "mtk", step: "Đăng ký thành công", event: "mo_tai_khoan_thanh_cong", key: true },
    { conv: "course", step: "Xem trang khóa học", event: "view_khoa_hoc" },
    { conv: "course", step: "Bắt đầu điền form đăng ký", event: "form_start_dang_ky_khoa_hoc" },
    { conv: "course", step: "Đăng ký thành công", event: "dang_ky_khoa_hoc_thanh_cong", key: true }
  ]
};
