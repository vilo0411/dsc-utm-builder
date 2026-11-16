// Phone mockups that show where the link goes on each platform / position.
// Mockup.render(platform, pos, ctx) -> HTML string. ctx: { name, url, where, source }
(function () {
  "use strict";
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const L = (w, cls) => `<i class="mk-l ${cls || ""}" style="width:${w}%"></i>`;
  const HL = (inner, tag) => `<div class="mk-hl">${inner}<em class="mk-tag">${esc(tag || "Dán link ở đây")}</em></div>`;
  const AV = (cls) => `<i class="mk-av ${cls || ""}"></i>`;

  function tiktokBio(c) {
    return `<div class="mk mk-tt">
      <div class="mk-bar"><span>‹</span><b>${esc(c.name)}</b><span>⋯</span></div>
      <div class="mk-c">${AV("xl")}<b class="mk-handle">@${esc(c.handle)}</b>
        <div class="mk-stats"><span><b>86</b>Đã follow</span><span><b>58,2K</b>Follower</span><span><b>1,2M</b>Thích</span></div>
        <div class="mk-row c"><span class="mk-btn red">Follow</span><span class="mk-btn">Tin nhắn</span></div>
        ${L(62, "c")}
        ${HL(`<span class="mk-link">🔗 ${esc(c.url)}</span>`, "Link bio")}
      </div>
      <div class="mk-grid">${"<i></i>".repeat(6)}</div></div>`;
  }

  // TikTok video: link in the caption (plain text, not clickable)
  function tiktokCaption(c) {
    return `<div class="mk mk-story tt mk-ttv">
      <div class="mk-ttv-side"><span>♥<small>12K</small></span><span>💬<small>86</small></span><span>↗<small>24</small></span></div>
      <div class="mk-story-c end"><b>@${esc(c.handle)}</b>${L(85, "w")}
        ${HL(`<span class="mk-link w">👉 ${esc(c.url)}</span>`, "Cuối caption")}
        <small>♫ Âm thanh gốc</small></div></div>`;
  }
  // TikTok video: pinned comment holding the link
  function tiktokComment(c) {
    return `<div class="mk mk-tt">
      <div class="mk-ttv-top"></div>
      <div class="mk-c l"><b>86 bình luận</b>
        <div class="mk-cmt">${AV("sm")}<div style="flex:1">${HL(`<small>@${esc(c.handle)} · 📌 Đã ghim</small><span class="mk-link">${esc(c.url)}</span>`, "Bình luận ghim")}</div></div>
        <div class="mk-cmt">${AV("sm")}<div style="flex:1">${L(90)}${L(55)}</div></div>
        <div class="mk-cmt">${AV("sm")}<div style="flex:1">${L(80)}</div></div>
      </div>
      <div class="mk-input">Thêm bình luận…</div></div>`;
  }

  function fbPage(c) {
    const w = (c.where || "").toLowerCase();
    const cta = !w || w.includes("cta") || w.includes("nút");
    const about = !w || w.includes("giới thiệu");
    const btn = `<span class="mk-btn fb">Đăng ký</span>`;
    return `<div class="mk mk-fb">
      <div class="mk-cover"></div>
      <div class="mk-c l">${AV("xl ring")}<b class="mk-name">${esc(c.name)}</b><small>58K người theo dõi</small>
        <div class="mk-row">${cta ? HL(btn, "Nút CTA") : btn}<span class="mk-btn">Nhắn tin</span></div>
      </div>
      <div class="mk-card"><b>Giới thiệu</b>${L(80)}${L(55)}
        ${about ? HL(`<span class="mk-link">🌐 ${esc(c.url)}</span>`, "Trang web") : `<span class="mk-link dim">🌐 dsc.com.vn</span>`}
      </div></div>`;
  }

  function fbPost(c) {
    return `<div class="mk mk-fb">
      <div class="mk-post"><div class="mk-row">${AV()}<div><b>${esc(c.name)}</b><small>2 giờ · 🌏</small></div></div>
        ${L(95)}${L(88)}${L(60)}
        ${HL(`<span class="mk-link">👉 ${esc(c.url)}</span>`, "Link trong bài")}
        <div class="mk-preview"><i></i><small>${esc(c.host)}</small>${L(70)}</div>
        <div class="mk-acts"><span>👍 Thích</span><span>💬 Bình luận</span><span>↗ Chia sẻ</span></div>
      </div></div>`;
  }

  function fbComment(c) {
    return `<div class="mk mk-fb">
      <div class="mk-post"><div class="mk-row">${AV()}<div><b>${esc(c.name)}</b><small>2 giờ · 🌏</small></div></div>
        ${L(95)}${L(70)}<div class="mk-img"></div>
        <div class="mk-acts"><span>👍 1,2K</span><span>💬 86</span><span>↗ 24</span></div>
        <div class="mk-cmt">${AV("sm")}<div class="mk-bub">${HL(`<b>${esc(c.name)}</b><small>📌 Đã ghim</small><span class="mk-link">${esc(c.url)}</span>`, "Bình luận ghim")}</div></div>
        <div class="mk-cmt">${AV("sm")}<div class="mk-bub">${L(90)}${L(50)}</div></div>
      </div></div>`;
  }

  function fbStory(c) {
    return `<div class="mk mk-story">
      <div class="mk-prog"><i></i><i></i><i></i></div>
      <div class="mk-row">${AV("sm ring")}<b>${esc(c.name)}</b><small>3 giờ</small></div>
      <div class="mk-story-c">
        <div class="mk-story-t">${L(70, "w")}${L(50, "w")}</div>
        ${HL(`<span class="mk-sticker">🔗 ${esc(c.host.toUpperCase())}</span>`, "Sticker liên kết")}
      </div>
      <div class="mk-reply">Gửi tin nhắn…</div></div>`;
  }

  function ytChannel(c) {
    const w = (c.where || "");
    return `<div class="mk mk-yt">
      <div class="mk-bar"><b class="yt-logo">▶ YouTube</b><span>🔍</span></div>
      <div class="mk-banner"></div>
      <div class="mk-c l"><div class="mk-row">${AV("lg")}<div><b class="mk-name">${esc(c.name)}</b><small>@${esc(c.handle)} · 120K người đăng ký</small></div></div>
        ${L(90)}
        ${HL(`<span class="mk-link">🔗 ${esc(c.url)} <small>và 1 đường liên kết khác</small></span>`, w || "Đường liên kết trên kênh")}
        <span class="mk-btn dark full">Đăng ký</span>
      </div>
      <div class="mk-tabs"><b>Trang chủ</b><span>Video</span><span>Shorts</span><span>Trực tiếp</span></div>
      <div class="mk-vlist"><i></i><i></i></div></div>`;
  }

  function ytPlayer(c) {
    return `<div class="mk-player"><span>▶</span></div>
      <div class="mk-c l">${L(92, "b")}${L(60, "b")}
      <div class="mk-row">${AV("sm")}<b>${esc(c.name)}</b><span class="mk-btn dark sm">Đăng ký</span></div></div>`;
  }

  function ytDescription(c) {
    return `<div class="mk mk-yt">${ytPlayer(c)}
      <div class="mk-desc"><small><b>12K lượt xem · 2 ngày trước</b></small>${L(95)}${L(80)}
        ${HL(`<span class="mk-link">👉 ${esc(c.url)}</span>`, "Mô tả video")}
        ${L(70)}${L(45)}</div></div>`;
  }

  function ytComment(c) {
    return `<div class="mk mk-yt">${ytPlayer(c)}
      <div class="mk-c l"><b>Bình luận 86</b>
        <div class="mk-cmt">${AV("sm")}<div>${HL(`<small>📌 Đã ghim bởi @${esc(c.handle)}</small>${L(85)}<span class="mk-link">${esc(c.url)}</span>`, "Bình luận ghim")}</div></div>
        <div class="mk-cmt">${AV("sm")}<div style="flex:1">${L(90)}${L(55)}</div></div>
      </div></div>`;
  }

  function zaloMenu(c) {
    return `<div class="mk mk-zl">
      <div class="mk-bar zl"><span>‹</span><b>${esc(c.name)}</b><span>ⓘ</span></div>
      <div class="mk-chat">
        <div class="mk-msg in">${L(90)}${L(60)}</div>
        <div class="mk-article"><i></i>${L(85, "b")}${L(55)}</div>
      </div>
      ${HL(`<div class="mk-menu"><span>${esc(c.where ? c.where.replace(/^Menu:\s*/i, "") : "Mở tài khoản")}</span><span>Báo cáo</span><span>Khóa học</span></div>`, "Menu OA")}
      <div class="mk-input">Nhập tin nhắn…</div></div>`;
  }

  function zaloMessage(c) {
    return `<div class="mk mk-zl">
      <div class="mk-bar zl"><span>‹</span><b>${esc(c.name)}</b><span>📞</span></div>
      <div class="mk-chat">
        <div class="mk-msg in">${L(80)}</div>
        <div class="mk-msg out">${L(90, "w")}${L(55, "w")}</div>
        ${HL(`<div class="mk-msg out"><span class="mk-link w">${esc(c.url)}</span><div class="mk-preview sm"><i></i><small>${esc(c.host)}</small></div></div>`, "Link trong tin nhắn")}
      </div>
      <div class="mk-input">Nhập tin nhắn…</div></div>`;
  }

  function adsField(c, label) {
    return `<div class="mk-field"><small>${esc(label)}</small>${HL(`<span class="mk-input-f">${esc(c.url)}</span>`, "Dán link UTM vào ô này")}</div>`;
  }
  function adsFacebook(c) {
    return `<div class="mk mk-fb">
      <div class="mk-post"><div class="mk-row">${AV()}<div><b>Chứng khoán DSC</b><small>Được tài trợ · 🌏</small></div></div>
        ${L(90)}${L(60)}<div class="mk-img"></div>
        <div class="mk-adbar"><div><small>${esc(c.host.toUpperCase())}</small>${L(70, "b")}</div><span class="mk-btn">Tìm hiểu thêm</span></div>
      </div>${adsField(c, "Ads Manager → Quảng cáo → URL trang web")}</div>`;
  }
  function adsTiktok(c) {
    return `<div class="mk mk-story tt">
      <div class="mk-story-c end"><b>@chungkhoandsc</b><small>Được tài trợ</small>${L(80, "w")}
        <span class="mk-btn red full">Tìm hiểu thêm</span></div>
      ${adsField(c, "TikTok Ads → Quảng cáo → URL đích")}</div>`;
  }
  function adsGoogle(c) {
    return `<div class="mk mk-g">
      <div class="mk-search">🔍 mở tài khoản chứng khoán</div>
      <div class="mk-c l"><small><b>Được tài trợ</b></small>
        <div class="mk-row">${AV("xs")}<div><small>DSC</small><small class="g-url">${esc(c.host)}</small></div></div>
        <b class="g-title">Mở Tài Khoản Chứng Khoán Online – Chỉ 5 Phút</b>${L(95)}${L(70)}
      </div>${adsField(c, "Google Ads → Quảng cáo → URL cuối cùng")}</div>`;
  }

  function generic(c) {
    return `<div class="mk mk-other"><div class="mk-bar"><b>${esc(c.name || "Kênh khác")}</b></div>
      <div class="mk-post">${L(90)}${L(70)}${HL(`<span class="mk-link">${esc(c.url)}</span>`, "Link")}${L(60)}</div></div>`;
  }

  function pick(platform, pos, source) {
    if (platform === "ads") return source === "google" ? adsGoogle : source === "tiktok" ? adsTiktok : adsFacebook;
    if (platform === "tiktok") return pos === "bio" ? tiktokBio : pos === "cmt" ? tiktokComment : tiktokCaption;
    if (platform === "facebook") return pos === "bio" ? fbPage : pos === "cmt" ? fbComment : pos === "story" ? fbStory : fbPost;
    if (platform === "youtube") return pos === "bio" ? ytChannel : pos === "cmt" ? ytComment : ytDescription;
    if (platform === "zalo") return pos === "menu" ? zaloMenu : zaloMessage;
    return generic;
  }

  window.Mockup = {
    render(platform, pos, ctx) {
      const c = Object.assign({ name: "Tài khoản", url: "dsc.com.vn/…", where: "" }, ctx || {});
      c.host = (c.url.split("/")[0] || "dsc.com.vn");
      c.handle = (c.handle || c.name || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[đĐ]/g, "d").replace(/[^a-zA-Z0-9]+/g, "").toLowerCase() || "dsc";
      return pick(platform, pos, c.source)(c);
    }
  };
})();
