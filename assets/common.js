// Shared helpers for every page: catalog store, URL building, shortener, clipboard, history, top nav.
(function () {
  "use strict";

  // ===== Platforms: fixed in code because each one has its own colour, icon and mockup =====
  const ICONS = {
    facebook: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10.5" fill="currentColor"/><path d="M13.3 21v-7.1h2.3l.4-2.8h-2.7V9.4c0-.8.3-1.4 1.4-1.4h1.4V5.5c-.3 0-1.1-.1-2.1-.1-2.1 0-3.5 1.3-3.5 3.6v2.1H8.2v2.8h2.3V21z" fill="#fff"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.2 3.5v11.2a3.6 3.6 0 1 1-3.6-3.6" fill="none" stroke="#25f4ee" stroke-width="2.6" stroke-linecap="round" transform="translate(-.8 -.6)"/><path d="M13.2 3.5c.4 2.6 2.2 4.3 5 4.6" fill="none" stroke="#25f4ee" stroke-width="2.6" stroke-linecap="round" transform="translate(-.8 -.6)"/><path d="M13.2 3.5v11.2a3.6 3.6 0 1 1-3.6-3.6" fill="none" stroke="#fe2c55" stroke-width="2.6" stroke-linecap="round" transform="translate(.8 .6)"/><path d="M13.2 3.5c.4 2.6 2.2 4.3 5 4.6" fill="none" stroke="#fe2c55" stroke-width="2.6" stroke-linecap="round" transform="translate(.8 .6)"/><path d="M13.2 3.5v11.2a3.6 3.6 0 1 1-3.6-3.6M13.2 3.5c.4 2.6 2.2 4.3 5 4.6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="1.5" y="5" width="21" height="14" rx="4.2" fill="currentColor"/><path d="M10 8.8v6.4l5.4-3.2z" fill="#fff"/></svg>',
    zalo: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 3.5h15a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-8l-4.5 3v-3H4.5a3 3 0 0 1-3-3v-9a3 3 0 0 1 3-3z" fill="currentColor"/><path d="M7.5 8.3h6.2l-6.2 5.6h6.2" fill="none" stroke="#fff" stroke-width="1.9" stroke-linejoin="round" stroke-linecap="round"/><circle cx="17" cy="11.6" r="1.5" fill="#fff"/></svg>',
    ads: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10v4a1 1 0 0 0 1 1h2.2l5.3 4.2V4.8L6.2 9H4a1 1 0 0 0-1 1z" fill="currentColor"/><path d="M15.2 9a4.2 4.2 0 0 1 0 6M18 6.3a8 8 0 0 1 0 11.4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    other: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 14a4.2 4.2 0 0 0 6 0l3-3a4.2 4.2 0 0 0-6-6l-1 1M14 10a4.2 4.2 0 0 0-6 0l-3 3a4.2 4.2 0 0 0 6 6l1-1" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>'
  };
  const PLATFORMS = {
    facebook: { name: "Facebook", color: "#4267b2", tint: "#edf1fa", desc: "Fanpage" },
    tiktok: { name: "TikTok", color: "#161823", tint: "#fdeef2", accent: "#fe2c55", desc: "Chỉ có link bio" },
    youtube: { name: "YouTube", color: "#e00000", tint: "#fdeded", desc: "Mô tả, bình luận, kênh" },
    zalo: { name: "Zalo", color: "#0068ff", tint: "#e7f0ff", desc: "OA, môi giới" },
    ads: { name: "Quảng cáo", color: "#c25e00", tint: "#fff2e2", desc: "Trả tiền (cpc)" },
    other: { name: "Kênh khác", color: "#5a6478", tint: "#eef0f4", desc: "Chưa có mã" }
  };
  const PLATFORM_ORDER = ["facebook", "tiktok", "youtube", "zalo", "ads", "other"];

  // ===== Link positions: editable catalog collection. These six are the defaults and have dedicated mockups;
  // positions added later fall back to the platform's "in post" mockup. "bio" and "menu" are fixed slots. =====
  const DEFAULT_POSITIONS = [
    { code: "", label: "Trong bài / tin nhắn", help: "Link nằm ngay trong nội dung bài, caption hoặc tin nhắn." },
    { code: "description", label: "Mô tả video", help: "Link trong phần mô tả bên dưới video." },
    { code: "cmt", label: "Bình luận ghim", help: "Link trong bình luận, kể cả bình luận ghim." },
    { code: "story", label: "Story", help: "Link gắn qua sticker liên kết trên Story." },
    { code: "bio", label: "Bio / trang kênh", help: "Link cố định trên trang. Đã có sẵn trong Kế hoạch link." },
    { code: "menu", label: "Menu OA", help: "Link cố định ở menu Zalo OA. Đã có sẵn trong Kế hoạch link." }
  ];
  const POS = {};   // code -> { label, help }; kept in sync with the loaded catalog (same object, mutated in place)
  function syncPos(list) {
    Object.keys(POS).forEach(k => delete POS[k]);
    list.forEach(p => { POS[p.code || ""] = { label: p.label, help: p.help || "" }; });
  }
  syncPos(DEFAULT_POSITIONS);
  const BIO_LABEL = { facebook: "Nút CTA / Giới thiệu", tiktok: "Bio", youtube: "Trang kênh" };
  // Platform wording for the same position code ("" = the post body itself)
  const POS_LABEL = {
    tiktok: { "": "Caption video", bio: "Bio" },
    facebook: { bio: "Nút CTA / Giới thiệu" },
    youtube: { "": "Bài đăng cộng đồng", bio: "Trang kênh" },
    zalo: { "": "Tin nhắn / bài viết OA" }
  };
  // Positions that do not exist on a platform or duplicate another one there:
  // TikTok and Facebook video descriptions are the caption / post text itself ("").
  const POS_HIDDEN = { tiktok: ["description", "menu"], facebook: ["description", "menu"], youtube: ["menu"], zalo: ["description"], ads: ["menu"], other: ["menu"] };
  function posLabel(pos, platform) {
    const m = POS_LABEL[platform];
    return m && m[pos || ""] ? m[pos || ""] : (POS[pos] || { label: pos }).label;
  }
  function posAllowed(code, platform) { return !(POS_HIDDEN[platform] || []).includes(code || ""); }

  // ===== Catalog store =====
  // Online (Supabase configured): the "catalog" table is the shared source of truth, cached in localStorage
  // by ready() so loadData() stays synchronous. Collections not yet in Supabase fall back to the offline store.
  // Offline: defaults from data.js, per-collection overrides in localStorage (this browser only).
  const COLLECTIONS = ["accounts", "positions", "landings", "products", "prefixes", "routes", "slots", "campaigns", "hosts", "groups", "formats", "hubs", "conversions", "steps"];
  const DATA_KEY = "dsc_utm_catalog_v2";
  const REMOTE_KEY = "dsc_utm_remote_v1";
  function clone(x) { return JSON.parse(JSON.stringify(x)); }
  function readOverrides() { try { return JSON.parse(localStorage.getItem(DATA_KEY) || "{}") || {}; } catch (e) { return {}; } }
  function readRemote() { try { return JSON.parse(localStorage.getItem(REMOTE_KEY) || "null"); } catch (e) { return null; } }
  function writeRemote(r) { try { localStorage.setItem(REMOTE_KEY, JSON.stringify(r)); } catch (e) {} }
  function loadData(opts) {
    const d = clone(window.DSC_DEFAULTS);
    if (!Array.isArray(d.positions)) d.positions = clone(DEFAULT_POSITIONS);
    const o = readOverrides();
    // opts.local: ignore the shared copy (used to upload this browser's catalog to Supabase)
    const remote = configured() && !(opts && opts.local) ? readRemote() : null;
    d.custom = [];      // collections edited offline on this browser
    d.shared = [];      // collections read from Supabase
    d.online = state.mode === "online";
    COLLECTIONS.forEach(k => {
      if (remote && remote.rows && Array.isArray(remote.rows[k])) {
        // Shared copy wins; fields added to data.js later are filled in on rows that lack them
        const kf = rowKey(k), defByKey = new Map((d[k] || []).map(r => [kf(r), r]));
        d[k] = remote.rows[k].map(r => {
          const def = defByKey.get(kf(r)); if (!def) return r;
          const out = Object.assign({}, r);
          Object.keys(def).forEach(f => { if (!(f in out)) out[f] = clone(def[f]); });
          return out;
        });
        d.shared.push(k);
        return;
      }
      if (!Array.isArray(o[k])) return;
      // Keep rows added to data.js after this browser saved its own copy. A default row is "new" when its key was not
      // among the defaults at save time (_base); rows the user deleted on purpose were in _base, so they stay deleted.
      const kf = rowKey(k), mine = new Set(o[k].map(kf)), base = new Set(((o._base || {})[k]) || []);
      const added = (d[k] || []).filter(r => !mine.has(kf(r)) && !base.has(kf(r)));
      // Fields added to data.js later (e.g. an account's "to") are filled in on saved rows that don't have them yet.
      // A field the user edited or cleared is present on the saved row, so it is kept as is.
      const defByKey = new Map((d[k] || []).map(r => [kf(r), r]));
      const saved = o[k].map(r => {
        const def = defByKey.get(kf(r)); if (!def) return r;
        const out = Object.assign({}, r);
        Object.keys(def).forEach(f => { if (!(f in out)) out[f] = clone(def[f]); });
        return out;
      });
      d[k] = saved.concat(added);
      d.custom.push(k);
    });
    syncPos(d.positions);
    return d;
  }
  // Identity of a catalog row, used to merge new defaults into a saved copy
  const ROW_KEYS = {
    accounts: r => `${r.s}|${r.m}`, positions: r => r.code, landings: r => r.id, products: r => r.code, prefixes: r => r.code,
    routes: r => `${r.prefix}|${r.to}`, slots: r => `${r.m}|${r.where}`, campaigns: r => r.name, hosts: r => r.host,
    groups: r => r.id, formats: r => `${r.p}|${r.fmt}|${r.label}`, hubs: r => r.id, conversions: r => r.id, steps: r => `${r.conv}|${r.step}`
  };
  function rowKey(k) { return ROW_KEYS[k] || (r => JSON.stringify(r)); }
  // Saves one collection. Online: the local cache is updated right away (so loadData() sees it), then the row is
  // upserted to Supabase; on failure the cache is rolled back and a toast explains. Returns Promise<boolean>.
  function saveCollection(key, rows) {
    if (isOnline()) {
      const r = readRemote() || { rows: {}, at: {}, by: {} };
      const prev = r.rows[key];
      r.rows[key] = clone(rows); writeRemote(r);
      return whoami().then(by => api("catalog?on_conflict=key", { method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=representation" },
        body: [{ key, rows, updated_by: by || null }] }))
        .then(res => {
          const x = readRemote() || r;
          if (res && res[0]) { x.at[key] = res[0].updated_at; x.by[key] = res[0].updated_by; }
          writeRemote(x); return true;
        })
        .catch(e => {
          const x = readRemote() || r;
          if (prev === undefined) delete x.rows[key]; else x.rows[key] = prev;
          writeRemote(x);
          toast("Không lưu được lên Supabase (" + e.message + "). Thay đổi chưa được lưu, tải lại trang rồi thử lại.", 6000);
          document.dispatchEvent(new CustomEvent("dsc-save-failed", { detail: { key } }));
          return false;
        });
    }
    const o = readOverrides(); o[key] = rows;
    // Remember which default rows existed when saving, so later additions to data.js still show up
    const def = (window.DSC_DEFAULTS || {})[key] || (key === "positions" ? DEFAULT_POSITIONS : []);
    o._base = o._base || {}; o._base[key] = def.map(rowKey(key));
    localStorage.setItem(DATA_KEY, JSON.stringify(o));
    return Promise.resolve(true);
  }
  // Back to the defaults in data.js. Online this overwrites the shared copy for the whole team.
  function resetCollection(key) {
    if (isOnline()) {
      const keys = key ? [key] : COLLECTIONS;
      return Promise.all(keys.map(k => saveCollection(k, clone((window.DSC_DEFAULTS || {})[k] || (k === "positions" ? DEFAULT_POSITIONS : [])))))
        .then(r => r.every(Boolean));
    }
    const o = readOverrides();
    if (key) { delete o[key]; if (o._base) delete o._base[key]; } else { COLLECTIONS.forEach(k => delete o[k]); delete o._base; }
    localStorage.setItem(DATA_KEY, JSON.stringify(o));
    return Promise.resolve(true);
  }
  // Collections edited offline on this browser (localStorage), regardless of what is shared
  function localOverrides() { const o = readOverrides(); const out = {}; COLLECTIONS.forEach(k => { if (Array.isArray(o[k])) out[k] = o[k]; }); return out; }
  // Last change of a shared collection: { at, by }
  function sharedInfo(key) { const r = readRemote(); return r && r.at && r.at[key] ? { at: r.at[key], by: (r.by || {})[key] || "" } : null; }

  // ===== Supabase REST (PostgREST), no SDK needed =====
  const state = { mode: "offline", error: "" };   // offline | online | cache (Supabase unreachable, using last copy)
  function configured() { const c = window.DSC_CONFIG || {}; return !!(c.supabaseUrl && c.supabaseKey); }
  function isOnline() { return configured() && state.mode !== "offline"; }
  async function api(path, opts) {
    opts = opts || {};
    const c = window.DSC_CONFIG;
    const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), opts.timeout || 10000);
    try {
      const r = await fetch(c.supabaseUrl.replace(/\/+$/, "") + "/rest/v1/" + path, {
        method: opts.method || "GET", signal: ctrl.signal,
        headers: Object.assign({ apikey: c.supabaseKey, Authorization: "Bearer " + c.supabaseKey, "Content-Type": "application/json" }, opts.headers || {}),
        body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined
      });
      const text = await r.text();
      let data = null; try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }
      if (!r.ok) throw new Error((data && (data.message || data.hint || data.error)) || `HTTP ${r.status}`);
      return data;
    } catch (e) {
      if (e.name === "AbortError") throw new Error("máy chủ không phản hồi");
      throw e;
    } finally { clearTimeout(t); }
  }
  // Every page waits for this before reading the catalog
  let readyP = null;
  function ready() {
    if (readyP) return readyP;
    readyP = (async () => {
      if (!configured()) { state.mode = "offline"; return state; }
      try {
        const rows = await api("catalog?select=key,rows,updated_at,updated_by", { timeout: 8000 });
        const r = { rows: {}, at: {}, by: {}, fetched: Date.now() };
        (rows || []).forEach(x => { r.rows[x.key] = x.rows; r.at[x.key] = x.updated_at; r.by[x.key] = x.updated_by; });
        writeRemote(r);
        state.mode = "online";
      } catch (e) {
        state.error = e.message;
        state.mode = readRemote() ? "cache" : "offline";
      }
      return state;
    })();
    return readyP;
  }
  // Re-read the shared catalog (e.g. before saving, to see if someone else changed it)
  async function refreshCatalog() { readyP = null; return ready(); }

  // ===== Who is editing (no login): a name kept on this browser, asked once on the first write =====
  const ME_KEY = "dsc_utm_me";
  function me() { try { return localStorage.getItem(ME_KEY) || ""; } catch (e) { return ""; } }
  let askingName = null;
  function whoami(force) {
    if (!force && me()) return Promise.resolve(me());
    if (!configured()) return Promise.resolve(me());
    if (askingName) return askingName;
    askingName = new Promise(resolve => {
      const inp = el("input", { type: "text", value: me(), placeholder: "Ví dụ: Lộc - MKT", "aria-label": "Tên của bạn", maxlength: "60" });
      const dlg = el("dialog", { class: "who-dlg" },
        el("form", { method: "dialog" },
          el("h2", {}, "Bạn là ai?"),
          el("p", {}, "Tên này được ghi kèm mỗi link bạn tạo và mỗi lần sửa danh mục, để cả team biết ai làm gì. Chỉ hỏi một lần trên trình duyệt này."),
          inp,
          el("div", { class: "who-f" }, el("button", { class: "btn", value: "ok" }, "Lưu tên"))));
      document.body.append(dlg);
      dlg.addEventListener("close", () => {
        const v = inp.value.trim();
        if (v) try { localStorage.setItem(ME_KEY, v); } catch (e) {}
        dlg.remove(); askingName = null;
        document.dispatchEvent(new CustomEvent("dsc-me"));
        resolve(me());
      });
      dlg.showModal(); inp.focus(); inp.select();
    });
    return askingName;
  }

  function toast(t, ms) { const x = el("div", { class: "toast", role: "status" }, t); document.body.append(x); setTimeout(() => x.remove(), ms || 2600); }

  // ===== Small DOM helpers =====
  const $ = id => document.getElementById(id);
  function el(tag, attrs, ...kids) {
    const e = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([k, v]) => {
      if (v === undefined || v === null || v === false) return;
      if (k === "class") e.className = v;
      else if (k === "html") e.innerHTML = v;
      else if (k === "style" && typeof v === "object") Object.entries(v).forEach(([sk, sv]) => sk.startsWith("--") ? e.style.setProperty(sk, sv) : (e.style[sk] = sv));
      else if (k.startsWith("on") && typeof v === "function") e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? "" : v);
    });
    kids.flat(Infinity).forEach(k => { if (k !== null && k !== undefined && k !== false && k !== "") e.append(k); });
    return e;
  }
  function icon(platform, cls) { return el("span", { class: "ico " + (cls || ""), html: ICONS[platform] || ICONS.other }); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

  // Vietnamese text -> code: strip accents, đ -> d, lowercase, non-alphanumerics -> "_"
  function slug(t) {
    return (t || "").normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[đĐ]/g, "d").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  }

  // Build final URL: keep non-utm params, replace any existing utm_*
  function makeUrl(u, pairs) {
    if (typeof u === "string") u = new URL(u);
    const keep = [];
    u.searchParams.forEach((v, k) => { if (!/^utm_/i.test(k)) keep.push([k, v]); });
    const qs = keep.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .concat(pairs.filter(p => p[1]).map(([k, v]) => `${k}=${encodeURIComponent(v)}`));
    return u.origin + u.pathname + (qs.length ? "?" + qs.join("&") : "") + u.hash;
  }
  function displayUrl(url) { try { const u = new URL(url); return (u.hostname.replace(/^www\./, "") + u.pathname).replace(/\/$/, ""); } catch (e) { return url || ""; } }

  // Catalog lookups
  function account(d, m, s) { return d.accounts.find(a => a.m === m && (!s || a.s === s)); }
  function landing(d, id) { return d.landings.find(l => l.id === id); }
  // Landing pages that are not switched off (state "off" hides a page everywhere)
  function activeLandings(d) { return d.landings.filter(l => l.state !== "off"); }
  function landingLabel(l) { return l ? l.label + (l.state === "tam" ? " (tạm)" : "") : ""; }
  function productName(d, code) { const p = d.products.find(x => x.code === code); return p ? p.name : code; }
  function accountName(a) { return a.paid ? a.name : `${(PLATFORMS[a.p] || PLATFORMS.other).name} · ${a.name}`; }
  function slotUrl(d, s) {
    const a = account(d, s.m), l = landing(d, s.to);
    if (!a || !l) return "";
    try { return makeUrl(l.url, [["utm_source", a.s], ["utm_medium", a.m], ["utm_content", s.pos], ["utm_product", l.product]]); }
    catch (e) { return ""; }
  }
  // Link-library fields of a fixed slot (bio / menu)
  function slotMeta(d, s) {
    const a = account(d, s.m), l = landing(d, s.to);
    return { kind: "fixed", source: a && a.s, medium: s.m, content: s.pos, product: l && l.product || null,
      account_m: s.m, position: s.pos, landing_id: s.to, title: s.where };
  }

  // ===== Clipboard =====
  function flash(btn, text) {
    if (!btn || btn.dataset.busy) return;
    const old = btn.innerHTML; btn.dataset.busy = "1"; btn.textContent = text;
    setTimeout(() => { btn.innerHTML = old; delete btn.dataset.busy; }, 1500);
  }
  function copyText(text, btn) {
    const ok = () => flash(btn, "Đã copy ✓");
    const fallback = () => window.prompt("Copy link (Ctrl/Cmd + C):", text);
    try { navigator.clipboard.writeText(text).then(ok, fallback); } catch (e) { fallback(); }
  }

  // ===== History (per browser) =====
  const HKEY = "dsc_utm_history_v1";
  function loadHist() { try { return JSON.parse(localStorage.getItem(HKEY) || "[]"); } catch (e) { return []; } }
  // Keeps the link in this browser's recent list and, online, in the shared link library.
  // meta: any links column (kind, source, medium, campaign, content, product, account_m, position, landing_id, title, fields)
  function remember(url, label, meta) {
    const h = loadHist().filter(x => x.url !== url); h.unshift({ url, label, at: Date.now() });
    try { localStorage.setItem(HKEY, JSON.stringify(h.slice(0, 20))); } catch (e) {}
    document.dispatchEvent(new CustomEvent("utm-history"));
    return saveLink(Object.assign({ url, label }, meta || {}));
  }

  // ===== Link library (Supabase table "links") =====
  // Upsert by URL through rpc/save_link: an existing link keeps its creator and status.
  async function saveLink(rec) {
    if (!rec || !rec.url || !isOnline()) return null;
    if (!rec.short_url && cachedShort(rec.url)) rec = Object.assign({}, rec, { short_url: cachedShort(rec.url) });
    const by = await whoami();
    try {
      const r = await api("rpc/save_link", { method: "POST", body: { rec: Object.assign({}, rec, { by: by || null }) } });
      document.dispatchEvent(new CustomEvent("dsc-links"));
      return r;
    } catch (e) { toast("Chưa lưu được link vào Kho link (" + e.message + ").", 5000); return null; }
  }
  async function listLinks() {
    if (!isOnline()) return [];
    const rows = await api("links?select=*&deleted_at=is.null&order=created_at.desc&limit=5000");
    const c = shortCache(); let n = 0;
    rows.forEach(r => { if (r.short_url && c[r.url] !== r.short_url) { c[r.url] = r.short_url; n++; } });
    if (n) try { localStorage.setItem(SKEY, JSON.stringify(c)); } catch (e) {}
    return rows;
  }
  async function getLink(id) {
    if (!isOnline() || !id) return null;
    const rows = await api("links?select=*&id=eq." + encodeURIComponent(id));
    return rows && rows[0] || null;
  }
  async function updateLink(id, patch) {
    const by = await whoami();
    const rows = await api("links?id=eq." + encodeURIComponent(id), { method: "PATCH",
      headers: { Prefer: "return=representation" }, body: Object.assign({}, patch, { updated_by: by || null }) });
    document.dispatchEvent(new CustomEvent("dsc-links"));
    return rows && rows[0];
  }

  // ===== Quick templates: Supabase table "templates", or this browser when offline =====
  const TKEY = "dsc_utm_templates_v1";
  function localTpl() { try { return JSON.parse(localStorage.getItem(TKEY) || "[]"); } catch (e) { return []; } }
  function writeLocalTpl(l) { try { localStorage.setItem(TKEY, JSON.stringify(l)); } catch (e) {} }
  const byUse = (a, b) => (b.use_count || 0) - (a.use_count || 0) || String(b.created_at).localeCompare(String(a.created_at));
  async function listTemplates() {
    if (!isOnline()) return localTpl().sort(byUse);
    return api("templates?select=*&deleted_at=is.null&order=use_count.desc,created_at.desc");
  }
  async function saveTemplate(name, fields) {
    if (!isOnline()) {
      const t = { id: "l" + Date.now(), name, fields, use_count: 0, created_at: new Date().toISOString(), created_by: me() };
      writeLocalTpl(localTpl().concat(t)); return t;
    }
    const by = await whoami();
    const rows = await api("templates", { method: "POST", headers: { Prefer: "return=representation" },
      body: { name, fields, created_by: by || null, updated_by: by || null } });
    return rows && rows[0];
  }
  async function deleteTemplate(id) {
    if (!isOnline()) { writeLocalTpl(localTpl().filter(t => t.id !== id)); return; }
    const by = await whoami();
    await api("templates?id=eq." + encodeURIComponent(id), { method: "PATCH", body: { deleted_at: new Date().toISOString(), updated_by: by || null } });
  }
  // Counts uses so the most used templates come first. Never asks for a name.
  function useTemplate(t) {
    t.use_count = (t.use_count || 0) + 1;
    if (!isOnline()) { writeLocalTpl(localTpl().map(x => x.id === t.id ? Object.assign(x, { use_count: t.use_count }) : x)); return; }
    api("templates?id=eq." + encodeURIComponent(t.id), { method: "PATCH", body: { use_count: t.use_count, updated_by: me() || null } }).catch(() => {});
  }

  // ===== Shortener: is.gd (CORS *), fallback v.gd. Same long URL always returns the cached short link. =====
  const SKEY = "dsc_utm_short_v1";
  function shortCache() { try { return JSON.parse(localStorage.getItem(SKEY) || "{}"); } catch (e) { return {}; } }
  function cachedShort(long) { return shortCache()[long] || ""; }
  async function callShortener(host, long) {
    const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 8000);
    try {
      const r = await fetch(`https://${host}/create.php?format=json&url=${encodeURIComponent(long)}`, { signal: ctrl.signal });
      const j = await r.json();
      if (j.shorturl) return j.shorturl;
      throw new Error(j.errormessage || "Không rút gọn được");
    } finally { clearTimeout(t); }
  }
  async function shorten(long) {
    const hit = cachedShort(long); if (hit) return hit;
    // Someone in the team may already have shortened this exact link
    if (isOnline()) {
      try {
        const rows = await api("links?select=short_url&short_url=not.is.null&url=eq." + encodeURIComponent(long), { timeout: 5000 });
        if (rows && rows[0] && rows[0].short_url) { cacheShort(long, rows[0].short_url); return rows[0].short_url; }
      } catch (e) { /* fall through to the shortener */ }
    }
    let short = "", lastErr = null;
    for (const host of ["is.gd", "v.gd"]) {
      try { short = await callShortener(host, long); break; } catch (e) { lastErr = e; }
    }
    if (!short) throw lastErr || new Error("Không rút gọn được");
    cacheShort(long, short);
    saveLink({ url: long, short_url: short });
    return short;
  }
  function cacheShort(long, short) {
    const c = shortCache(); c[long] = short;
    try { localStorage.setItem(SKEY, JSON.stringify(c)); } catch (e) {}
  }

  // ===== Top nav =====
  const PAGES = [
    ["index.html", "Tạo link", "build"],
    ["thu-vien.html", "Kho link", "library"],
    ["ke-hoach.html", "Kế hoạch dẫn khách", "plan"],
    ["quy-chuan.html", "Quy chuẩn", "rules"],
    ["danh-muc.html", "Danh mục", "catalog"]
  ];
  function renderNav(active, extra) {
    const who = configured() ? el("button", { type: "button", class: "btn ghost sm who-btn", title: "Đổi tên hiển thị khi tạo link và sửa danh mục",
      onclick: () => whoami(true) }, me() ? "Bạn: " + me() : "Nhập tên của bạn") : null;
    document.addEventListener("dsc-me", () => { if (who) who.textContent = me() ? "Bạn: " + me() : "Nhập tên của bạn"; });
    const bar = el("header", { class: "appbar" },
      el("a", { class: "brand", href: "index.html" }, el("img", { src: "assets/brand/dsc-logo-green.png", alt: "DSC", width: "68", height: "24" }), el("span", {}, "UTM Builder")),
      el("nav", { class: "nav" }, PAGES.map(([href, label, key]) =>
        el("a", { href, class: key === active ? "on" : "", "aria-current": key === active ? "page" : null }, label))),
      el("div", { class: "appbar-x" }, extra || [], who));
    document.body.prepend(bar);
    const d = loadData();
    let note = null;
    if (configured() && state.mode === "offline")
      note = ["Không kết nối được Supabase (", state.error || "lỗi mạng", "). Đang dùng dữ liệu offline: thay đổi chỉ lưu trên trình duyệt này, Kho link tạm không dùng được."];
    else if (state.mode === "cache")
      note = ["Mất kết nối Supabase (", state.error || "lỗi mạng", "). Đang dùng bản danh mục tải lần trước, có thể chưa mới nhất."];
    else if (d.custom.length && active !== "catalog")
      note = [configured() ? "Trình duyệt này có danh mục chỉnh riêng chưa đưa lên Supabase (" : "Đang dùng danh mục đã chỉnh trên trình duyệt này (",
        d.custom.length, " mục). ", el("a", { href: "danh-muc.html#io" }, configured() ? "Đưa lên cho cả team" : "Xem / xuất file")];
    if (note) bar.after(el("div", { class: "custom-note", role: "status" }, note));
  }

  window.DSC = {
    PLATFORMS, PLATFORM_ORDER, ICONS, POS, DEFAULT_POSITIONS, BIO_LABEL, COLLECTIONS,
    posLabel, posAllowed, loadData, saveCollection, resetCollection, clone,
    $, el, icon, esc, slug, makeUrl, displayUrl,
    account, landing, activeLandings, landingLabel, productName, accountName, slotUrl, slotMeta,
    copyText, flash, loadHist, remember, toast,
    shorten, cachedShort, renderNav,
    ready, refreshCatalog, configured, isOnline, state, api, me, whoami, localOverrides, sharedInfo,
    saveLink, listLinks, getLink, updateLink,
    listTemplates, saveTemplate, deleteTemplate, useTemplate
  };
})();
