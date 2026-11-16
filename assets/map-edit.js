// Quick edit on the plan page (ke-hoach.html), next to the full editor in Danh mục. One draft covers both diagrams:
//   Bản đồ hành trình (groups, hubs)
//   - drag the ● handle of a channel card onto a nurture group / the goal to connect them (adds default landing pages)
//   - click a channel arrow to unlink it
//   - drag page chips between nurture groups, × to take a page out, "+ Trang" to add one
//   - drag the ⠿ grip to reorder cards, click a card to edit its text and page list
//   Hướng dẫn theo kênh (accounts, slots)
//   - "+ Thêm tài khoản" opens the quick-add form of Tạo link (codes derived), the new account lands in the draft
//   - drag the ● handle of an account onto a landing page: fixed link (bio, CTA, menu) or per-video link
//   - click a line to remove / change it, click an account to edit it (positions, fixed links, per-video pages)
// The draft is the same catalog Danh mục edits: "Lưu" writes groups/hubs/accounts/slots through DSC.saveCollection
// (Supabase for the whole team when configured, otherwise this browser), with Danh mục's "someone else saved" check.
(function () {
  "use strict";
  const { el, clone, slug, toast, PLATFORMS } = DSC;
  // One message at a time: a new toast replaces the previous one
  const say = (t, ms) => { document.querySelectorAll(".toast").forEach(x => x.remove()); toast(t, ms); };
  const KEYS = ["groups", "hubs", "accounts", "slots"];
  const NAMES = { groups: "Kênh (bản đồ)", hubs: "Nuôi dưỡng", accounts: "Tài khoản", slots: "Link cố định" };
  const HINT = {
    tabMap: "Rê chuột hoặc bấm vào một thẻ để làm nổi đường đi và xem chi tiết bên dưới. Độ dày mũi tên = số tuyến link trong kế hoạch, không phải traffic.",
    tabGuide: "Thêm tài khoản mới, nối tài khoản với trang đích ngay trên sơ đồ bên dưới."
  };
  const HELP = {
    tabMap: ["Kéo chấm ", "dot", " ở cạnh phải thẻ kênh thả vào nhóm hoặc đích cuối để nối · Bấm mũi tên kênh để gỡ · Kéo trang giữa các nhóm · Kéo ⠿ để đổi thứ tự · Bấm thẻ để sửa nội dung."],
    tabGuide: ["Bấm “+ Thêm tài khoản” để thêm kênh mới · Kéo chấm ", "dot", " ở tài khoản thả vào trang đích để nối · Bấm đường nối để gỡ hoặc đổi · Bấm tài khoản để sửa vị trí link, link cố định."],
    tabFixed: ["Danh sách link cố định cập nhật theo bản nháp. Chuyển sang Bản đồ hoặc Hướng dẫn theo kênh để sửa."]
  };
  const isFixedPos = p => p === "bio" || p === "menu";

  function MapEdit(o) {
    const D = o.D, J = o.journey, G = o.guide, bar = o.bar;
    let on = false, base = null, undo = [], drag = null, conn = null, pop = null, tab = "tabMap", guideCh = null;

    // ===== Lookups =====
    const live = id => { const l = DSC.landing(D, id); return l && l.state !== "off" ? l : null; };
    const label = id => DSC.landingLabel(DSC.landing(D, id)) || id;
    const group = cid => D.groups.find(g => "ch:" + g.id === cid);
    const hub = cid => D.hubs.find(h => "hub:" + h.id === cid);
    const acct = key => D.accounts.find(a => a.s + "|" + a.m === key);
    const targetName = tid => tid === "goal" || tid === "direct" ? label(o.goalLanding) : (hub(tid) || {}).name || tid;
    const targetPages = tid => tid === "goal" || tid === "direct" ? [o.goalLanding] : ((hub(tid) || {}).landings || []);
    const routeKey = t => t === "direct" ? "direct" : "hub:" + t;
    const hubOfPage = id => D.hubs.find(h => (h.landings || []).includes(id));
    const groupOf = a => D.groups.find(g => (g.platforms || []).includes(a.p));
    const perVideo = a => a.paid || (a.pos || []).some(p => !isFixedPos(p));
    const videoList = a => (a.to && a.to.length ? a.to : (groupOf(a) || {}).landings) || [];
    const slotsOf = a => D.slots.filter(s => s.m === a.m);

    // ===== Draft + undo =====
    const snap = () => JSON.stringify(KEYS.map(k => D[k]));
    const restore = s => { const v = JSON.parse(s); KEYS.forEach((k, i) => { D[k] = v[i]; }); };
    const dirty = () => !!base && snap() !== base;
    function change(fn, msg, ms) {
      const before = snap();
      fn();
      if (snap() === before) return;
      undo.push(before);
      o.refresh(); renderBar();
      if (msg) say(msg, ms || 4500);
    }
    function doUndo() { if (!undo.length) return; restore(undo.pop()); o.refresh(); renderBar(); }

    // ===== Toolbar above the tabs' content (shared by both diagrams) =====
    function renderBar() {
      bar.innerHTML = ""; bar.classList.toggle("on", on);
      if (!on) {
        bar.hidden = !HINT[tab];
        if (HINT[tab]) bar.append(el("p", { class: "hint" }, HINT[tab]),
          el("button", { type: "button", class: "btn ghost sm", onclick: start }, tab === "tabGuide" ? "✎ Sửa nhanh sơ đồ kênh" : "✎ Sửa nhanh trên bản đồ"));
        return;
      }
      bar.hidden = false;
      const n = undo.length;
      const was = JSON.parse(base), keys = KEYS.filter((k, i) => JSON.stringify(D[k]) !== JSON.stringify(was[i]));
      bar.append(
        el("div", { class: "me-help" }, el("b", {}, "Đang sửa kế hoạch. "), HELP[tab].map(x => x === "dot" ? el("span", { class: "me-dot" }) : x)),
        el("div", { class: "me-act" },
          el("span", { class: "me-n", title: keys.length ? "Sẽ lưu vào Danh mục: " + keys.map(k => NAMES[k]).join(", ") : "" },
            n ? `${n} thay đổi chưa lưu` + (keys.length ? ` (${keys.map(k => NAMES[k]).join(", ")})` : "") : "Chưa có thay đổi"),
          el("button", { type: "button", class: "btn ghost sm", disabled: !n, title: "Ctrl+Z", onclick: doUndo }, "↶ Hoàn tác"),
          el("button", { type: "button", class: "btn ghost sm", onclick: cancel }, n ? "Hủy thay đổi" : "Thoát"),
          el("button", { type: "button", class: "btn sm", disabled: !dirty(), onclick: save }, DSC.isOnline() ? "Lưu cho cả team" : "Lưu")));
    }
    function setTab(t) { tab = t; closePop(); renderBar(); }
    function start() {
      on = true; base = snap(); undo = [];
      J.classList.add("editing"); G.classList.add("editing");
      o.refresh(); renderBar();
    }
    function stop() {
      on = false; base = null; undo = []; closePop();
      J.classList.remove("editing"); G.classList.remove("editing");
      o.refresh(); renderBar();
    }
    function cancel() {
      if (dirty() && !confirm("Bỏ các thay đổi chưa lưu?")) return;
      if (base) restore(base);
      stop();
    }
    async function save() {
      const was = JSON.parse(base), keys = KEYS.filter((k, i) => JSON.stringify(D[k]) !== JSON.stringify(was[i]));
      if (!keys.length) return stop();
      // Someone else may have saved the same part of the catalog since this page was opened
      if (DSC.isOnline()) {
        const before = keys.map(k => DSC.sharedInfo(k));
        await DSC.refreshCatalog();
        const clash = keys.map((k, i) => [k, DSC.sharedInfo(k), before[i]]).find(([, a, b]) => a && (!b || a.at !== b.at));
        if (clash && !confirm(`${clash[1].by || "Người khác"} vừa sửa “${NAMES[clash[0]]}” lúc ${new Date(clash[1].at).toLocaleString("vi-VN")}. Lưu bây giờ sẽ ghi đè thay đổi của họ.\n\nOK để vẫn lưu, Hủy để quay lại (tải lại trang để xem bản mới).`)) return;
      }
      const res = await Promise.all(keys.map(k => DSC.saveCollection(k, D[k])));
      if (!res.every(Boolean)) { renderBar(); return; }
      say(DSC.isOnline() ? "Đã lưu cho cả team. Danh mục đã cập nhật theo." : "Đã lưu trên trình duyệt này. Danh mục đã cập nhật theo.");
      // Fixed links depend on slots and accounts: keep Kho link in step (same as saving in Danh mục)
      if (DSC.isOnline() && (keys.includes("slots") || keys.includes("accounts"))) DSC.syncFixedLinks(D).then(r => {
        if (r && r.replace) say(`${r.replace} link cố định cần cài lại trên kênh. Xem ở Kho link.`, 5000);
      }).catch(() => {});
      stop();
    }
    addEventListener("beforeunload", e => { if (on && dirty()) { e.preventDefault(); e.returnValue = ""; } });
    document.addEventListener("keydown", e => {
      if (!on) return;
      if (e.key === "Escape") { closePop(); endConnect(null); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !e.target.closest("input, textarea, select, dialog")) { e.preventDefault(); doUndo(); }
    });

    // ===== Decorations, added after every render (before the lines are drawn) =====
    function decorate() {
      if (!on) return;
      J.querySelectorAll('[data-id^="ch:"], #colHubs [data-id^="hub:"]').forEach(c => {
        const h = c.querySelector(".jc-h");
        if (h) h.prepend(el("span", { class: "me-grip", title: "Kéo để đổi thứ tự" }, "⠿"));
      });
      J.querySelectorAll('[data-id^="ch:"]').forEach(c =>
        c.append(el("span", { class: "me-handle", title: "Kéo thả vào nhóm nuôi dưỡng hoặc đích cuối để nối" })));
      J.querySelectorAll('#colHubs [data-id^="hub:"]').forEach(c => {
        c.querySelectorAll(".pg[data-lid]").forEach(p => {
          p.draggable = true; p.title = "Kéo sang nhóm khác để chuyển";
          p.append(el("button", { type: "button", class: "me-x", title: "Bỏ trang khỏi nhóm", "aria-label": "Bỏ trang " + p.textContent }, "×"));
        });
        const pages = c.querySelector(".pages");
        if (pages) pages.append(el("button", { type: "button", class: "me-add" }, "+ Trang"));
      });
      const col = J.querySelector("#colHubs");
      if (col) col.append(el("button", { type: "button", class: "me-newhub" }, "+ Thêm nhóm nuôi dưỡng"));
    }
    function decorateGuide(wrap, ch) {
      guideCh = ch;
      if (!on || !wrap) return;
      wrap.querySelectorAll(".gf-n.acct").forEach(n => {
        n.tabIndex = 0; n.setAttribute("role", "button"); n.title = "Bấm để sửa tài khoản";
        n.append(el("span", { class: "me-handle", title: "Kéo thả vào trang đích để nối" }));
      });
      const col = wrap.querySelector(".gf-col");
      if (col) col.append(el("button", { type: "button", class: "me-newhub me-addacct" }, "+ Thêm tài khoản"));
    }

    // ===== Popover menu =====
    function closePop() { if (pop) { pop.remove(); pop = null; } }
    function menu(x, y, title, items, note) {
      closePop();
      pop = el("div", { class: "me-pop", role: "menu" },
        el("b", {}, title),
        items.filter(Boolean).map(([t, fn, cls]) => el("button", { type: "button", role: "menuitem", class: cls || "", onclick: () => { closePop(); fn(); } }, t)),
        note || null);
      document.body.append(pop);
      const r = pop.getBoundingClientRect();
      pop.style.left = Math.max(8, Math.min(x, innerWidth - r.width - 8)) + scrollX + "px";
      pop.style.top = Math.max(8, Math.min(y + 8, innerHeight - r.height - 8)) + scrollY + "px";
      const first = pop.querySelector("button"); if (first) first.focus();
    }
    document.addEventListener("pointerdown", e => { if (pop && !pop.contains(e.target)) closePop(); }, true);

    // ===== Journey map actions =====
    function addPages(ch, ids, tid) {
      change(() => { ch.landings = [...(ch.landings || []), ...ids]; },
        `Đã nối ${ch.name} → ${targetName(tid)}: link theo video sẽ dẫn về ${ids.map(label).join(", ")}.`);
      // Defaults only matter for accounts that post per-video links without their own page list
      if (!o.routes().some(r => r.ch.id === ch.id && routeKey(r.t) === (tid === "goal" ? "direct" : tid)))
        say(`Đã thêm trang mặc định cho ${ch.name}, nhưng chưa có mũi tên: các tài khoản của kênh này chỉ đặt link cố định (bio) hoặc đã có trang đích riêng. Nối từng tài khoản ở tab “Hướng dẫn theo kênh”.`, 7000);
    }
    function connect(cid, tid, x, y) {
      const ch = group(cid); if (!ch) return;
      if (tid.startsWith("hub:") && (hub(tid) || {}).common) say("Trang chủ là cổng chung của mọi kênh nên không vẽ mũi tên.", 4000);
      const pages = targetPages(tid).filter(live);
      const fresh = pages.filter(id => !(ch.landings || []).includes(id));
      if (!pages.length) return say(`${targetName(tid)} chưa có trang nào đang chạy. Bấm “+ Trang” trên thẻ nhóm để thêm.`, 4500);
      if (!fresh.length) return say(`${ch.name} đã dẫn về ${targetName(tid)} rồi.`);
      if (fresh.length === 1) return addPages(ch, fresh, tid);
      menu(x, y, `${ch.name} → ${targetName(tid)}: dẫn về trang nào?`,
        [...fresh.map(id => [label(id), () => addPages(ch, [id], tid)]), [`Cả ${fresh.length} trang`, () => addPages(ch, fresh, tid), "strong"]]);
    }
    function arrowMenu(from, to, x, y) {
      const ch = group(from); if (!ch) return;
      const pages = targetPages(to), defs = (ch.landings || []).filter(id => pages.includes(id));
      const rs = o.routes().filter(r => r.ch.id === ch.id && routeKey(r.t) === to);
      const fixed = rs.filter(r => r.fixed).length, own = new Set(rs.filter(r => !r.fixed && r.a.to && r.a.to.length).map(r => r.a)).size;
      const rm = ids => change(() => { ch.landings = ch.landings.filter(id => !ids.includes(id)); },
        `Đã gỡ ${ids.map(label).join(", ")} khỏi trang mặc định của ${ch.name}.`);
      const keep = [fixed ? `${fixed} link cố định (bio, CTA, menu)` : "", own ? `${own} tài khoản có trang đích riêng` : ""].filter(Boolean);
      menu(x, y, `${ch.name} → ${targetName(to)} · ${rs.length} tuyến`,
        [...defs.map(id => [`Gỡ trang mặc định “${label(id)}”`, () => rm([id])]), defs.length > 1 ? [`Gỡ cả ${defs.length} trang`, () => rm(defs), "strong"] : null,
          keep.length ? [`Xem từng tài khoản của ${ch.name} →`, () => openGuide(ch)] : null],
        keep.length ? el("p", { class: "hint" }, (defs.length ? "Gỡ xong mũi tên vẫn còn vì " : "Mũi tên này đến từ ") + keep.join(" và ") + ". Sửa từng tài khoản ở tab “Hướng dẫn theo kênh”.") : null);
    }
    function openGuide(ch) { o.showGuide(ch.id); const t = document.getElementById("tabGuide"); if (t) t.click(); }
    function movePage(lid, fromId, toId) {
      const a = hub(fromId), b = hub(toId); if (!a || !b || a === b) return;
      change(() => { a.landings = a.landings.filter(x => x !== lid); if (!b.landings.includes(lid)) b.landings = [...(b.landings || []), lid]; },
        `Đã chuyển ${label(lid)} từ ${a.name} sang ${b.name}.`);
    }
    function removePage(lid, hid) {
      const h = hub(hid); if (!h) return;
      const used = D.groups.filter(g => (g.landings || []).includes(lid)).map(g => g.name);
      change(() => { h.landings = h.landings.filter(x => x !== lid); },
        `Đã bỏ ${label(lid)} khỏi ${h.name}.` + (used.length && !hubOfPage(lid) ? ` Trang này không còn thuộc nhóm nào nên link từ ${used.join(", ")} tới trang này sẽ không hiện trên bản đồ.` : ""));
    }
    function addPageMenu(hid, x, y) {
      const h = hub(hid); if (!h) return;
      const opts = DSC.activeLandings(D).filter(l => l.id !== o.goalLanding && !(h.landings || []).includes(l.id));
      if (!opts.length) return say("Không còn trang nào để thêm. Tạo trang mới ở Danh mục → Trang đích.", 4500);
      menu(x, y, `Thêm trang vào ${h.name}`, opts.map(l => {
        const other = hubOfPage(l.id);
        return [DSC.landingLabel(l) + (other ? ` (chuyển từ ${other.name})` : ""), () => other ? movePage(l.id, "hub:" + other.id, hid)
          : change(() => { h.landings = [...(h.landings || []), l.id]; }, `Đã thêm ${DSC.landingLabel(l)} vào ${h.name}.`)];
      }));
    }
    function newHub() {
      const name = (prompt("Tên nhóm nuôi dưỡng mới (ví dụ: Webinar, Ebook):") || "").trim();
      if (!name) return;
      let id = slug(name) || "nhom", n = 2; const base0 = id;
      while (D.hubs.some(h => h.id === id)) id = `${base0}_${n++}`;
      change(() => {
        const at = D.hubs.findIndex(h => h.common);
        const row = { id, name, landings: [], next: "", kpi: "" };
        D.hubs = at < 0 ? [...D.hubs, row] : [...D.hubs.slice(0, at), row, ...D.hubs.slice(at)];
      }, `Đã thêm nhóm ${name}. Bấm “+ Trang” để gắn trang vào nhóm.`);
      openEditor("hub:" + id);
    }
    function reorder(dragId, overId, after) {
      const kind = dragId.startsWith("ch:") ? "groups" : "hubs";
      if (!overId.startsWith(dragId.slice(0, dragId.indexOf(":") + 1)) || dragId === overId) return;
      const id = x => x.slice(x.indexOf(":") + 1);
      change(() => {
        const list = D[kind].filter(r => r.id !== id(dragId)), row = D[kind].find(r => r.id === id(dragId));
        const i = list.findIndex(r => r.id === id(overId));
        list.splice(after ? i + 1 : i, 0, row); D[kind] = list;
      });
    }

    // ===== Channel guide actions: accounts and their links =====
    function addAccount(ch) {
      const plats = (ch && ch.platforms) || [];
      DSC.QuickEdit.open("accounts", D, {
        platform: plats.length === 1 ? plats[0] : "",
        // Rows go into the draft, saved with everything else
        commit: (key, rows, extra) => change(() => { D[key] = rows; Object.entries(extra).forEach(([k, v]) => { if (KEYS.includes(k)) D[k] = v; }); }),
        onSave: res => {
          const a = res && res.added; if (!a) return;
          const g = groupOf(a);
          if (!g) return say(`Đã thêm ${a.name}. Nền tảng ${PLATFORMS[a.p].name} chưa có trong Kênh (bản đồ), thêm ở Danh mục → Kênh (bản đồ hành trình) để hiện trên kế hoạch.`, 7000);
          if (!guideCh || g.id !== guideCh.id) o.showGuide(g.id);
          say(`Đã thêm ${a.name} vào bản nháp. Kéo chấm ● từ tài khoản sang trang đích để nối.`, 6000);
          setTimeout(() => { const n = G.querySelector(`[data-gid="${CSS.escape("a:" + a.s + "|" + a.m)}"]`); if (n) { n.scrollIntoView({ block: "center", behavior: "smooth" }); n.classList.add("me-new"); } }, 50);
        }
      });
    }
    // Template for a new fixed link: copy "where" and "how" from another account of the same platform
    function slotTemplate(a, pos) {
      const sib = D.slots.find(s => s.pos === pos && s.m !== a.m && (DSC.account(D, s.m) || {}).p === a.p);
      return { where: sib ? sib.where : DSC.posLabel(pos, a.p), how: sib ? sib.how : "" };
    }
    function addSlot(a, pos, lid, ask) {
      const t = slotTemplate(a, pos);
      let where = t.where;
      if (ask || D.slots.some(s => s.m === a.m && s.where === where)) {
        where = (prompt(`Tên vị trí cho link cố định mới của ${a.name} (ví dụ: Link 2 trang kênh):`) || "").trim();
        if (!where) return;
        if (D.slots.some(s => s.m === a.m && s.where === where)) return say(`“${where}” đã có rồi.`);
      }
      change(() => { D.slots = [...D.slots, { m: a.m, pos, where, how: t.how, to: lid }]; },
        `Đã thêm link cố định “${where}” của ${a.name} → ${label(lid)}.` + (t.how ? "" : " Bấm vào tài khoản để ghi cách đặt link."), 5500);
    }
    function setVideo(a, list, msg) {
      const own = a.to && a.to.length;
      change(() => { a.to = list; }, msg + (own || !list.length ? "" : " Tài khoản này giờ dùng danh sách trang riêng, không theo trang mặc định của kênh."), 6000);
    }
    function connectAccount(key, lid, x, y) {
      const a = acct(key), l = live(lid); if (!a || !l) return;
      const opts = [];
      if (perVideo(a)) {
        const cur = videoList(a);
        if (!cur.includes(lid)) opts.push([a.paid ? "URL đích quảng cáo" : "Link theo video / tin", () => setVideo(a, [...cur, lid], `${a.name}: link ${a.paid ? "quảng cáo" : "theo video"} có thêm ${label(lid)}.`)]);
      }
      if (!a.paid) ["bio", "menu"].filter(p => DSC.posAllowed(p, a.p) && (p === "bio" || (a.pos || []).includes("menu"))).forEach(p => {
        const mine = slotsOf(a).filter(s => s.pos === p);
        mine.filter(s => s.to !== lid).forEach(s => opts.push([`Đổi link cố định “${s.where}” (đang về ${label(s.to)})`, () =>
          change(() => { s.to = lid; }, `Đã đổi “${s.where}” của ${a.name} sang ${label(lid)}. Nhớ cài lại link mới trên kênh.`, 5500)]));
        opts.push([mine.length ? `Thêm link cố định khác (${DSC.posLabel(p, a.p)})…` : `Link cố định: ${slotTemplate(a, p).where}`, () => addSlot(a, p, lid, mine.length > 0)]);
      });
      if (!opts.length) return say(`${a.name} đã dẫn về ${label(lid)} rồi.`);
      // Brand-new account with only a bio: one obvious choice, do it right away
      if (opts.length === 1 && !slotsOf(a).length) return opts[0][1]();
      menu(x, y, `${a.name} → ${label(lid)}: đặt link ở đâu?`, opts,
        !perVideo(a) && !a.paid ? el("p", { class: "hint" }, "Tài khoản chỉ có link cố định. Muốn đặt link theo video: bấm vào tài khoản, bật thêm vị trí (bình luận ghim, mô tả…).") : null);
    }
    function lineMenu(h, x, y) {
      const a = acct(h.dataset.acct), lid = h.dataset.lid; if (!a) return;
      if (h.dataset.fixed) {
        const s = D.slots.find(z => z.m === a.m && z.where === h.dataset.where && z.to === lid); if (!s) return;
        return menu(x, y, `${a.name} · ${s.where} → ${label(lid)}`, [
          [`Gỡ link cố định “${s.where}”`, () => change(() => { D.slots = D.slots.filter(z => z !== s); }, `Đã gỡ link cố định “${s.where}” của ${a.name}.`)],
          ["Sửa tên vị trí, cách đặt…", () => editAccount(a)]],
          el("p", { class: "hint" }, "Đổi trang đích: kéo chấm ● của tài khoản sang trang mới."));
      }
      const cur = videoList(a), rest = cur.filter(x => x !== lid), def = (groupOf(a) || {}).landings || [];
      menu(x, y, `${a.name} → ${label(lid)} (${a.paid ? "quảng cáo" : "theo video"})`, [
        [`Gỡ ${label(lid)} khỏi link ${a.paid ? "quảng cáo" : "theo video"}`, () => {
          if (!rest.length && def.length && !confirm(`${a.name} sẽ không còn trang riêng nào và quay về dùng trang mặc định của kênh (${def.map(label).join(", ")}). Tiếp tục?`)) return;
          setVideo(a, rest, `Đã gỡ ${label(lid)} khỏi ${a.name}.`);
        }],
        cur.indexOf(lid) > 0 ? ["Ưu tiên trang này lên đầu", () => setVideo(a, [lid, ...rest], `${label(lid)} giờ là trang ưu tiên của ${a.name}.`)] : null]);
    }

    // ===== Dialog helpers =====
    function field(t, v, set, big) {
      const i = el(big ? "textarea" : "input", { rows: big ? 2 : null, "aria-label": t, oninput: e => set(e.target.value) });
      i.value = v || "";
      return el("label", { class: "me-f" }, el("span", {}, t), i);
    }
    // Ordered page list with ↑ ↓ × and an "add" select; edits `arr` in place
    function pageList(arr, empty) {
      const list = el("ol", { class: "me-pages" });
      const addSel = el("select", { "aria-label": "Thêm trang", onchange: e => { if (e.target.value) { arr.push(e.target.value); draw(); } } });
      function draw() {
        list.innerHTML = "";
        arr.forEach((id, i) => list.append(el("li", {}, el("span", {}, label(id)),
          el("button", { type: "button", class: "btn ghost sm", disabled: !i, "aria-label": "Lên", onclick: () => { arr.splice(i - 1, 0, arr.splice(i, 1)[0]); draw(); } }, "↑"),
          el("button", { type: "button", class: "btn ghost sm", disabled: i === arr.length - 1, "aria-label": "Xuống", onclick: () => { arr.splice(i + 1, 0, arr.splice(i, 1)[0]); draw(); } }, "↓"),
          el("button", { type: "button", class: "btn ghost sm", "aria-label": "Bỏ", onclick: () => { arr.splice(i, 1); draw(); } }, "×"))));
        if (!arr.length) list.append(el("li", { class: "hint" }, empty));
        addSel.innerHTML = "";
        addSel.append(el("option", { value: "" }, "+ Thêm trang…"),
          DSC.activeLandings(D).filter(l => !arr.includes(l.id)).map(l => el("option", { value: l.id }, DSC.landingLabel(l) + ` (${l.site})`)));
      }
      draw();
      return [list, addSel];
    }
    function dialog(title, body, foot, onOk) {
      const dlg = el("dialog", { class: "who-dlg me-dlg" },
        el("form", { method: "dialog" }, el("h2", {}, title), body,
          el("div", { class: "me-foot" }, foot, el("span", { class: "sp" }),
            el("button", { class: "btn ghost sm", value: "cancel", formnovalidate: true }, "Hủy"),
            el("button", { class: "btn sm", value: "ok" }, "Xong"))));
      document.body.append(dlg);
      dlg.addEventListener("close", () => { if (dlg.returnValue === "ok") onOk(); dlg.remove(); });
      dlg.showModal();
      return dlg;
    }

    // ===== Card editor (journey map) =====
    function openEditor(cid) {
      const isCh = cid.startsWith("ch:"), src = isCh ? group(cid) : hub(cid); if (!src) return;
      const row = clone(src); row.landings = row.landings || [];
      const F = isCh
        ? [["name", "Tên kênh"], ["role", "Vai trò"], ["goal", "Mục tiêu", 1], ["cta", "CTA / vị trí link", 1], ["kpi", "Chỉ số theo dõi", 1]]
        : [["name", "Tên nhóm"], ["next", "Cách đẩy sang Mở tài khoản", 1], ["kpi", "Chỉ số theo dõi", 1]];
      const [list, addSel] = pageList(row.landings, isCh ? "Chưa có, link theo video sẽ chỉ dùng link bio." : "Nhóm chưa có trang nào.");
      let dlg;
      dlg = dialog(isCh ? "Sửa kênh" : "Sửa nhóm nuôi dưỡng", [
        F.map(([k, t, big]) => field(t, row[k], v => { row[k] = v; }, big)),
        el("div", { class: "me-f" }, el("span", {}, isCh ? "Trang đích mặc định (link theo video), theo thứ tự ưu tiên" : "Trang trong nhóm"), list, addSel),
        !isCh ? el("label", { class: "me-chk" }, el("input", { type: "checkbox", checked: !!row.common, onchange: e => { row.common = e.target.checked; } }),
          " Cổng chung của mọi kênh (vẽ thành dải ngang, không có mũi tên)") : null
      ], [
        isCh ? el("button", { type: "button", class: "btn ghost sm", onclick: () => { dlg.close("cancel"); openGuide(src); addAccount(src); } }, "+ Tài khoản") : null,
        !isCh ? el("button", { type: "button", class: "btn ghost sm danger", onclick: () => delHub(src, dlg) }, "Xóa nhóm") : null,
        el("a", { class: "hint", href: "danh-muc.html#" + (isCh ? "groups" : "hubs") }, "Sửa đầy đủ ở Danh mục")
      ], () => {
        row.name = (row.name || "").trim() || src.name;
        change(() => { Object.keys(row).forEach(k => { src[k] = row[k]; }); if (!row.common) delete src.common; });
      });
    }
    function delHub(h, dlg) {
      const conv = D.conversions.filter(c => c.hub === h.id);
      if (conv.length) return alert(`Không xóa được: chuyển đổi “${conv.map(c => c.name).join(", ")}” đang gắn với nhóm này. Đổi ở Danh mục → Chuyển đổi trước.`);
      if (!confirm(`Xóa nhóm “${h.name}”? Các trang trong nhóm sẽ không còn hiện trên bản đồ.`)) return;
      dlg.close("del");
      change(() => { D.hubs = D.hubs.filter(x => x !== h); }, `Đã xóa nhóm ${h.name}.`);
    }

    // ===== Account editor (channel guide) =====
    function editAccount(src) {
      const row = clone(src), slots = clone(slotsOf(src));
      row.pos = row.pos || []; row.to = row.to || [];
      const posBox = src.paid ? null : el("div", { class: "me-f" }, el("span", {}, "Vị trí đặt link"),
        el("div", { class: "me-poss" }, D.positions.filter(p => DSC.posAllowed(p.code || "", src.p)).map(p => el("label", { class: "me-chk", title: p.help || "" },
          el("input", { type: "checkbox", checked: row.pos.includes(p.code || ""), onchange: e => {
            const want = new Set(row.pos); e.target.checked ? want.add(p.code || "") : want.delete(p.code || "");
            row.pos = D.positions.map(x => x.code || "").filter(c => want.has(c));
          } }), DSC.posLabel(p.code || "", src.p)))));
      const slotBox = el("div", { class: "me-slots" });
      const landOpts = () => DSC.activeLandings(D).map(l => [l.id, DSC.landingLabel(l)]);
      function drawSlots() {
        slotBox.innerHTML = "";
        slots.forEach((s, i) => {
          const sel = el("select", { "aria-label": "Trang đích", onchange: e => { s.to = e.target.value; } }, landOpts().map(([v, t]) => el("option", { value: v }, t)));
          sel.value = s.to;
          const w = el("input", { "aria-label": "Tên vị trí", placeholder: "Tên vị trí", oninput: e => { s.where = e.target.value; } }); w.value = s.where || "";
          const h = el("input", { "aria-label": "Cách đặt", placeholder: "Cách đặt (đường bấm trong app)", oninput: e => { s.how = e.target.value; } }); h.value = s.how || "";
          slotBox.append(el("div", { class: "me-slot" }, w, sel,
            el("button", { type: "button", class: "btn ghost sm", "aria-label": "Bỏ link cố định", onclick: () => { slots.splice(i, 1); drawSlots(); } }, "×"), h));
        });
        if (!slots.length) slotBox.append(el("p", { class: "hint" }, "Chưa có link cố định."));
        slotBox.append(el("button", { type: "button", class: "me-add", onclick: () => {
          const t = slotTemplate(src, "bio"); slots.push({ m: src.m, pos: "bio", where: slots.some(s => s.where === t.where) ? "" : t.where, how: t.how, to: (DSC.activeLandings(D)[0] || {}).id || "" }); drawSlots();
        } }, "+ Link cố định"));
      }
      drawSlots();
      const [vlist, vadd] = pageList(row.to, `Chưa có trang riêng: dùng trang mặc định của kênh (${((groupOf(src) || {}).landings || []).map(label).join(", ") || "không có"}).`);
      dialog(`Sửa tài khoản ${PLATFORMS[src.p].name} · ${src.name}`, [
        field("Tên", row.name, v => { row.name = v; }),
        field(src.p === "tiktok" || src.p === "youtube" ? "@handle" : "Mô tả ngắn", row.sub, v => { row.sub = v; }),
        field("Team quản lý", row.owner, v => { row.owner = v; }),
        field("Định hướng nội dung", row.focus, v => { row.focus = v; }, 1),
        posBox,
        src.paid ? null : el("div", { class: "me-f" }, el("span", {}, "Link cố định (bio, CTA, menu)"), slotBox),
        el("div", { class: "me-f" }, el("span", {}, src.paid ? "URL đích quảng cáo, theo thứ tự ưu tiên" : "Trang cho link theo video / tin, theo thứ tự ưu tiên"), vlist, vadd),
        el("label", { class: "me-chk" }, el("input", { type: "checkbox", checked: !!row.inactive, onchange: e => { row.inactive = e.target.checked; } }), " Tạm ẩn khỏi kế hoạch (vẫn tạo link được)"),
        el("p", { class: "hint" }, `Mã: utm_source=${src.s} · utm_medium=${src.m}. Đổi mã ở Danh mục → Kênh.`)
      ], [
        el("button", { type: "button", class: "btn ghost sm danger", onclick: e => delAccount(src, e.target.closest("dialog")) }, "Xóa tài khoản"),
        el("a", { class: "hint", href: "danh-muc.html#accounts" }, "Sửa đầy đủ ở Danh mục")
      ], () => {
        row.name = (row.name || "").trim() || src.name;
        const bad = slots.filter(s => !s.where.trim() || !s.to);
        if (bad.length) say("Bỏ qua link cố định thiếu tên vị trí hoặc trang đích.", 4000);
        const keep = slots.filter(s => s.where.trim() && s.to).map(s => Object.assign(s, { where: s.where.trim(), pos: s.pos || "bio" }));
        change(() => {
          ["sub", "owner", "focus"].forEach(k => { if (!(row[k] || "").trim()) delete row[k]; });
          if (!row.to.length) delete row.to;
          if (!row.inactive) delete row.inactive;
          Object.keys(src).forEach(k => { if (!(k in row)) delete src[k]; });
          Object.assign(src, row);
          // Replace this account's fixed links in place, keeping the others' order
          const at = D.slots.findIndex(s => s.m === src.m);
          const others = D.slots.filter(s => s.m !== src.m);
          D.slots = at < 0 ? others.concat(keep) : [...others.slice(0, at), ...keep, ...others.slice(at)];
        }, `Đã cập nhật ${row.name}.`);
      });
    }
    function delAccount(a, dlg) {
      const n = slotsOf(a).length;
      if (!confirm(`Xóa tài khoản “${a.name}”${n ? ` cùng ${n} link cố định` : ""}? Link đã tạo vẫn giữ trong Kho link.`)) return;
      dlg.close("del");
      change(() => { D.accounts = D.accounts.filter(x => x !== a); D.slots = D.slots.filter(s => s.m !== a.m || D.accounts.some(x => x.m === a.m)); }, `Đã xóa ${a.name}.`);
    }

    // ===== Drag to connect (pointer events, works with touch); shared by both diagrams =====
    // cfg: root element, svg, attr ("id" | "gid"), ok(node) -> is a drop target, done(fromId, toId, x, y)
    function startConnect(cfg, from, e) {
      const S = cfg.root.querySelector(cfg.svg), rr = cfg.root.getBoundingClientRect(), hr = e.target.getBoundingClientRect();
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("class", "me-temp"); path.setAttribute("stroke", getComputedStyle(from).getPropertyValue("--c").trim() || "#272d2b");
      S.append(path);
      conn = Object.assign({}, cfg, { from: from.dataset[cfg.attr], path, x0: hr.left + hr.width / 2 - rr.left, y0: hr.top + hr.height / 2 - rr.top, over: null });
      cfg.root.classList.add("connecting");
      e.target.setPointerCapture && e.target.setPointerCapture(e.pointerId);
    }
    function moveConnect(e) {
      if (!conn) return;
      const rr = conn.root.getBoundingClientRect(), x1 = e.clientX - rr.left, y1 = e.clientY - rr.top, xm = (conn.x0 + x1) / 2;
      conn.path.setAttribute("d", `M${conn.x0},${conn.y0}C${xm},${conn.y0} ${xm},${y1} ${x1},${y1}`);
      const t = document.elementFromPoint(e.clientX, e.clientY), c = t && t.closest(`[data-${conn.attr}]`);
      const ok = c && conn.root.contains(c) && conn.ok(c) ? c : null;
      if (conn.over !== ok) { if (conn.over) conn.over.classList.remove("me-drop"); if (ok) ok.classList.add("me-drop"); conn.over = ok; }
    }
    function endConnect(e) {
      if (!conn) return;
      const c = conn; conn = null;
      c.path.remove(); c.root.classList.remove("connecting");
      if (c.over) c.over.classList.remove("me-drop");
      if (e && c.over) c.done(c.from, c.over.dataset[c.attr], e.clientX, e.clientY);
    }
    const MAP = { svg: ".jlines", attr: "id", ok: n => /^(hub:|direct$|goal$)/.test(n.dataset.id), done: connect };
    const GUIDE = { svg: ".gf-lines", attr: "gid", ok: n => n.dataset.gid.startsWith("l:"), done: (from, to, x, y) => connectAccount(from.slice(2), to.slice(2), x, y) };
    [J, G].forEach(root => {
      root.addEventListener("pointerdown", e => {
        if (!on) return;
        const h = e.target.closest(".me-handle");
        if (h) {
          e.preventDefault();
          if (root === J) startConnect(Object.assign({ root: J }, MAP), h.closest("[data-id]"), e);
          else startConnect(Object.assign({ root: h.closest(".gflow") }, GUIDE), h.closest("[data-gid]"), e);
          return;
        }
        const g = e.target.closest(".me-grip");
        if (g) g.closest("[data-id]").draggable = true;
      });
      root.addEventListener("pointermove", moveConnect);
      root.addEventListener("pointerup", endConnect);
      root.addEventListener("pointercancel", () => endConnect(null));
    });

    // ===== Clicks (capture, so the map's own select-on-click is skipped while editing) =====
    J.addEventListener("click", e => {
      if (!on) return;
      const t = e.target, card = t.closest("[data-id]");
      const stop = () => { e.stopPropagation(); e.preventDefault(); };
      if (t.closest(".me-handle, .me-grip")) return stop();
      if (t.closest(".me-x")) { stop(); return removePage(t.closest(".pg").dataset.lid, card.dataset.id); }
      if (t.closest(".me-add")) { stop(); return addPageMenu(card.dataset.id, e.clientX, e.clientY); }
      if (t.closest(".me-newhub")) { stop(); return newHub(); }
      if (t.classList && t.classList.contains("jl-hit")) { stop(); return arrowMenu(t.dataset.from, t.dataset.to, e.clientX, e.clientY); }
      if (card && /^(ch:|hub:)/.test(card.dataset.id)) { stop(); openEditor(card.dataset.id); }
    }, true);
    G.addEventListener("click", e => {
      if (!on) return;
      const t = e.target;
      if (t.closest(".me-handle")) return;
      if (t.closest(".me-addacct")) return addAccount(guideCh);
      if (t.classList && t.classList.contains("jl-hit")) return lineMenu(t, e.clientX, e.clientY);
      const n = t.closest(".gf-n.acct");
      if (n) { const a = acct(n.dataset.gid.slice(2)); if (a) editAccount(a); }
    });
    [J, G].forEach(root => root.addEventListener("keydown", e => {
      if (!on || (e.key !== "Enter" && e.key !== " ")) return;
      const c = e.target;
      if (c.dataset && /^(ch:|hub:)/.test(c.dataset.id || "")) { e.preventDefault(); e.stopPropagation(); openEditor(c.dataset.id); }
      else if (c.classList && c.classList.contains("acct") && c.dataset.gid) { e.preventDefault(); const a = acct(c.dataset.gid.slice(2)); if (a) editAccount(a); }
    }, true));

    // ===== HTML5 drag on the map: page chips between groups, cards to reorder =====
    const clearMarks = () => J.querySelectorAll(".me-drop, .me-before, .me-after").forEach(n => n.classList.remove("me-drop", "me-before", "me-after"));
    J.addEventListener("dragstart", e => {
      if (!on) return;
      const p = e.target.closest && e.target.closest(".pg[data-lid]");
      if (p) { drag = { kind: "page", lid: p.dataset.lid, from: p.closest("[data-id]").dataset.id }; }
      else if (e.target.dataset && e.target.dataset.id && e.target.draggable) { drag = { kind: "card", id: e.target.dataset.id }; e.target.classList.add("me-dragging"); }
      else return;
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", drag.lid || drag.id);
    });
    J.addEventListener("dragover", e => {
      if (!drag) return;
      const c = e.target.closest("[data-id]"); clearMarks();
      if (!c) return;
      if (drag.kind === "page" && c.dataset.id.startsWith("hub:") && c.dataset.id !== drag.from) { e.preventDefault(); c.classList.add("me-drop"); }
      if (drag.kind === "card" && c.dataset.id !== drag.id && c.dataset.id.split(":")[0] === drag.id.split(":")[0] && !(hub(c.dataset.id) || {}).common) {
        e.preventDefault();
        const r = c.getBoundingClientRect(); c.classList.add(e.clientY > r.top + r.height / 2 ? "me-after" : "me-before");
      }
    });
    J.addEventListener("drop", e => {
      if (!drag) return;
      e.preventDefault();
      const c = e.target.closest("[data-id]"), d = drag; drag = null;
      const after = c && c.classList.contains("me-after"); clearMarks();
      if (!c) return;
      if (d.kind === "page") movePage(d.lid, d.from, c.dataset.id);
      else reorder(d.id, c.dataset.id, after);
    });
    J.addEventListener("dragend", e => {
      drag = null; clearMarks();
      if (e.target.classList) e.target.classList.remove("me-dragging");
      if (e.target.dataset && e.target.dataset.id) e.target.draggable = false;
    });
    J.addEventListener("pointerup", () => J.querySelectorAll('[data-id][draggable="true"]').forEach(n => { if (!drag) n.draggable = false; }));

    renderBar();
    return { decorate, decorateGuide, setTab, isOn: () => on };
  }

  DSC.MapEdit = MapEdit;
})();
