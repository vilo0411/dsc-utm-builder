// Catalog editor (modal dialog) for the "Tạo link" page.
// Two parts:
//   1. Quick add: type only the human name; codes, platform, source, default positions are derived from the catalog.
//      Saved at once and handed back to the page so it can select the new item.
//   2. Edit list: table of existing rows (filtered to the current platform for channels), sticky header,
//      codes already in use are locked behind an explicit "Đổi mã".
// Saves through DSC.saveCollection: Supabase when configured (shared with the team), otherwise localStorage — the same store the "Danh mục" page uses.
(function () {
  "use strict";
  const { el, slug, clone, PLATFORMS, PLATFORM_ORDER } = DSC;

  const platformOpts = () => PLATFORM_ORDER.filter(p => p !== "other").map(p => [p, PLATFORMS[p].name]);
  const uniq = arr => [...new Set(arr.filter(Boolean))];
  const fixedPlatform = ctx => ctx.platform && ctx.platform !== "other" ? ctx.platform : "";
  function uniqueCode(base, taken) {
    base = base || "moi"; let c = base, n = 2;
    while (taken.has(c)) c = `${base}_${n++}`;
    return c;
  }
  // Medium prefix used by the other accounts of a platform: facebook -> "fanpage", tiktok -> "tiktok"…
  function mediumPrefix(D, p) {
    const n = {};
    D.accounts.filter(a => a.p === p && !a.paid && a.m).forEach(a => { const k = a.m.split("_")[0]; n[k] = (n[k] || 0) + 1; });
    const best = Object.entries(n).sort((a, b) => b[1] - a[1])[0];
    return best ? best[0] : p;
  }
  function hostOf(url) { try { return new URL(/^https?:\/\//i.test(url) ? url : "https://" + url).hostname.toLowerCase(); } catch (e) { return ""; } }
  function siteFor(D, url) {
    const h = hostOf(url), l = D.landings.find(x => hostOf(x.url) === h);
    return l ? l.site : /taichinhso/.test(h) ? "Tài Chính Số" : "Web chính";
  }

  // ---------------------------------------------------------------------------------------------
  // Schema per collection.
  //   cols:   edit-table columns. type: text | code | url | select | bool | multi. code columns are locked on existing rows.
  //           hide(ctx, all) hides a column; skip(row) renders a placeholder instead of an input.
  //   quick:  fields(ctx, D, draft) -> inputs of the quick-add form; derive(draft, ctx, D) -> full row;
  //           codes(row) -> [[label, value, editable]] shown as "Mã sẽ dùng"; note(row, ctx, D) -> extra line;
  //           after(row, draft, ctx, D) -> other collections to save as well ({ key: rows }).
  //   filter: (ctx) -> row predicate for the edit table, or null.
  //   inUse:  (D, row) -> reason when deleting would break other data.
  // ---------------------------------------------------------------------------------------------
  const SCHEMA = {
    accounts: {
      title: "Kênh",
      addTitle: ctx => fixedPlatform(ctx) === "ads" ? "Thêm tài khoản quảng cáo" : fixedPlatform(ctx) ? `Thêm kênh ${PLATFORMS[ctx.platform].name}` : "Thêm kênh",
      key: r => `${r.s}|${r.m}`,
      quick: {
        fields: (ctx, D, d) => {
          const fixed = fixedPlatform(ctx), p = fixed || d.p || "facebook";
          return [
            !fixed ? { k: "p", label: "Nền tảng", type: "select", options: platformOpts, rerender: true } : null,
            p === "ads" ? { k: "s", label: "Quảng cáo trên", type: "select", options: () => [["facebook", "Facebook / Instagram"], ["tiktok", "TikTok"], ["google", "Google"]] } : null,
            { k: "name", label: p === "ads" ? "Tên hiển thị" : "Tên kênh", required: true, placeholder: p === "ads" ? "Ví dụ: Zalo Ads" : "Ví dụ: D-Invest" },
            { k: "sub", label: p === "tiktok" || p === "youtube" ? "@handle" : "Mô tả ngắn", placeholder: "Không bắt buộc" },
            { k: "owner", label: "Team quản lý", placeholder: "Không bắt buộc", list: D => uniq(D.accounts.map(a => a.owner)) }
          ].filter(Boolean);
        },
        derive: (d, ctx, D) => {
          const p = fixedPlatform(ctx) || d.p || "facebook";
          const r = { p, s: "", m: "", name: (d.name || "").trim() };
          if ((d.sub || "").trim()) r.sub = d.sub.trim();
          if ((d.owner || "").trim()) r.owner = d.owner.trim();
          if (p === "ads") { r.s = d.s || "facebook"; r.m = "cpc"; r.paid = true; return r; }
          r.s = p;
          r.m = d.code || uniqueCode(`${mediumPrefix(D, p)}_${slug(r.name)}`, new Set(D.accounts.map(a => a.m)));
          const sib = D.accounts.find(a => a.p === p && !a.paid && a.pos);
          r.pos = sib ? clone(sib.pos) : [""];
          return r;
        },
        codes: r => r.paid ? [["utm_source", r.s], ["utm_medium", r.m]] : [["utm_source", r.s], ["utm_medium", r.m, true]],
        note: (r, ctx, D) => r.pos ? `Vị trí link: ${r.pos.map(c => DSC.posLabel(c, r.p)).join(", ")} (giống các kênh ${PLATFORMS[r.p].name} khác).` : ""
      },
      filter: ctx => fixedPlatform(ctx) ? (r => r.p === ctx.platform) : null,
      filterLabel: ctx => `Chỉ hiện kênh ${PLATFORMS[ctx.platform].name}`,
      cols: [
        { k: "p", label: "Nền tảng", type: "select", options: platformOpts, hide: (ctx, all) => !!fixedPlatform(ctx) && !all },
        { k: "name", label: "Tên kênh" },
        { k: "sub", label: "Mô tả / @handle" },
        { k: "owner", label: "Team", list: D => uniq(D.accounts.map(a => a.owner)) },
        { k: "pos", label: "Vị trí cho phép", type: "multi", options: (D, r) => D.positions.filter(p => !r || DSC.posAllowed(p.code, r.p)).map(p => [p.code || "", r ? DSC.posLabel(p.code, r.p) : p.label]), skip: r => r.paid, skipText: "Không cần" },
        // Source always equals the platform except for ads, so it is only worth showing for ads or the full list
        { k: "s", label: "utm_source", type: "code", hide: (ctx, all) => !!fixedPlatform(ctx) && ctx.platform !== "ads" && !all },
        { k: "m", label: "utm_medium", type: "code" }
      ],
      inUse: (D, r) => D.slots.some(s => s.m === r.m) ? "Kênh này đang có link cố định trong Kế hoạch." : ""
    },

    positions: {
      title: "Vị trí link",
      addTitle: () => "Thêm vị trí link",
      key: r => r.code || "",
      quick: {
        fields: ctx => [
          { k: "label", label: "Tên vị trí", required: true, placeholder: "Ví dụ: Link trong ảnh" },
          { k: "help", label: "Giải thích", placeholder: "Không bắt buộc", wide: true },
          ctx.account ? { k: "attach", label: `Bật cho kênh ${ctx.account.name}`, type: "bool", initial: true } : null
        ].filter(Boolean),
        derive: (d, ctx, D) => ({ code: d.code || uniqueCode(slug(d.label), new Set(D.positions.map(p => p.code))), label: (d.label || "").trim(), help: (d.help || "").trim() }),
        codes: r => [["Mã trong utm_content", r.code, true]],
        note: () => "Vị trí mới dùng hình minh họa “trong bài” của nền tảng.",
        after: (r, d, ctx, D) => {
          if (!d.attach || !ctx.account) return null;
          const rows = clone(D.accounts), a = rows.find(x => x.s === ctx.account.s && x.m === ctx.account.m);
          if (!a) return null;
          // Keep the catalog order of positions, new one last
          const want = new Set([...(a.pos || []), r.code]);
          a.pos = D.positions.map(p => p.code || "").concat(r.code).filter((c, i, arr) => want.has(c) && arr.indexOf(c) === i);
          return { accounts: rows };
        }
      },
      cols: [
        { k: "label", label: "Tên vị trí" },
        { k: "help", label: "Giải thích", wide: true },
        { k: "code", label: "Mã", type: "code", optional: true }
      ],
      inUse: (D, r) => {
        const n = D.accounts.filter(a => (a.pos || []).includes(r.code || "")).length;
        return n ? `${n} kênh đang dùng vị trí này.` : "";
      }
    },

    prefixes: {
      title: "Loại bài",
      addTitle: () => "Thêm loại bài",
      key: r => r.code,
      quick: {
        fields: () => [
          { k: "label", label: "Tên loại bài", required: true, placeholder: "Ví dụ: Phân tích kỹ thuật" },
          { k: "help", label: "Gợi ý ngắn", placeholder: "Không bắt buộc", wide: true }
        ],
        derive: (d, ctx, D) => ({ code: d.code || uniqueCode(slug(d.label), new Set(D.prefixes.map(p => p.code))), label: (d.label || "").trim(), help: (d.help || "").trim() }),
        codes: r => [["Mã trong utm_content", r.code, true]]
      },
      cols: [
        { k: "label", label: "Tên loại bài" },
        { k: "help", label: "Gợi ý", wide: true },
        { k: "code", label: "Mã", type: "code" }
      ],
      inUse: (D, r) => D.routes.some(x => x.prefix === r.code) ? "Loại bài này đang có gợi ý trang đích." : ""
    },

    landings: {
      title: "Trang đích",
      addTitle: () => "Thêm trang đích",
      key: r => r.id,
      quick: {
        fields: () => [
          { k: "label", label: "Tên trang", required: true, placeholder: "Ví dụ: Khóa học phái sinh" },
          { k: "url", label: "Link trang", type: "url", required: true, placeholder: "https://www.dsc.com.vn/…", wide: true },
          { k: "product", label: "Sản phẩm của trang", type: "select", options: D => [["", "Không có"], ...D.products.map(p => [p.code, p.name])] }
        ],
        derive: (d, ctx, D) => {
          let url = (d.url || "").trim(); if (url && !/^https?:\/\//i.test(url)) url = "https://" + url;
          const r = { id: d.code || uniqueCode(slug(d.label), new Set(D.landings.map(l => l.id))), site: siteFor(D, url), label: (d.label || "").trim(), url, product: d.product || "" };
          return r;
        },
        codes: r => [["Site", r.site]],
        note: () => "Site được nhận theo domain của link."
      },
      cols: [
        { k: "label", label: "Tên trang" },
        { k: "url", label: "Link trang", type: "url", wide: true },
        { k: "site", label: "Site", list: D => uniq(D.landings.map(l => l.site)) },
        { k: "product", label: "Sản phẩm", type: "select", options: D => [["", "Không có"], ...D.products.map(p => [p.code, p.name])] },
        { k: "state", label: "Trạng thái", type: "select", options: () => [["", "Đang dùng"], ["tam", "Tạm thời"], ["off", "Đã tắt"]] },
        { k: "id", label: "Mã nội bộ", type: "code" }
      ],
      inUse: (D, r) => D.slots.some(s => s.to === r.id) || D.routes.some(x => x.to === r.id)
        ? "Trang này đang dùng trong Kế hoạch hoặc Gợi ý trang đích. Có thể đổi Trạng thái thành “Đã tắt” thay vì xóa." : ""
    },

    campaigns: {
      title: "Chiến dịch gợi ý",
      addTitle: () => "Thêm chiến dịch",
      key: r => slug(r.name),
      quick: {
        fields: () => [{ k: "name", label: "Tên chiến dịch", required: true, placeholder: "Ví dụ: Mở tài khoản tháng 12", wide: true }],
        derive: d => ({ name: (d.name || "").trim() }),
        codes: r => [["utm_campaign", slug(r.name)]]
      },
      cols: [{ k: "name", label: "Tên chiến dịch", wide: true }]
    },

    products: {
      title: "Sản phẩm",
      addTitle: () => "Thêm sản phẩm",
      key: r => r.code,
      quick: {
        fields: () => [
          { k: "name", label: "Tên sản phẩm", required: true, placeholder: "Ví dụ: Khóa học phái sinh" },
          { k: "group", label: "Nhóm", placeholder: "Không bắt buộc", list: D => uniq(D.products.map(p => p.group)) }
        ],
        derive: (d, ctx, D) => ({ group: (d.group || "").trim(), name: (d.name || "").trim(), code: d.code || uniqueCode(slug(d.name), new Set(D.products.map(p => p.code))) }),
        codes: r => [["utm_product", r.code, true]]
      },
      cols: [
        { k: "name", label: "Tên sản phẩm" },
        { k: "group", label: "Nhóm", list: D => uniq(D.products.map(p => p.group)) },
        { k: "code", label: "Mã", type: "code" }
      ],
      inUse: (D, r) => D.landings.some(l => l.product === r.code) ? "Sản phẩm này là sản phẩm mặc định của một trang đích." : ""
    }
  };

  // ===== Validation (whole list) =====
  function validate(key, rows, D) {
    const S = SCHEMA[key], w = [], seen = {};
    rows.forEach((r, i) => {
      const n = `Dòng ${i + 1}`;
      S.cols.filter(c => c.type === "code" && !c.optional).forEach(c => { if (!r[c.k]) w.push([i, `${n}: thiếu ${c.label}.`]); });
      const k = S.key(r);
      if (seen[k] !== undefined && (k || key === "positions")) w.push([i, `${n}: trùng mã với dòng ${seen[k] + 1}.`]); else seen[k] = i;
      if (key === "accounts") {
        if (!r.name) w.push([i, `${n}: thiếu tên kênh.`]);
        if (!r.paid && /cp|ppc|^paid/.test(`${r.m}`)) w.push([i, `${n}: mã của kênh không trả tiền không được chứa “cp”, “ppc” hoặc bắt đầu bằng “paid”.`]);
        if (r.paid && r.m !== "cpc") w.push([i, `${n}: tài khoản quảng cáo phải có utm_medium “cpc”.`]);
      }
      if (key === "landings") {
        try { const u = new URL(r.url); if (!D.hosts.some(h => h.host === u.hostname)) w.push([i, `${n}: domain ${u.hostname} không thuộc website DSC.`]); }
        catch (e) { w.push([i, `${n}: link trang chưa đúng.`]); }
      }
      if ((key === "campaigns" || key === "products") && !r.name) w.push([i, `${n}: thiếu tên.`]);
      if ((key === "positions" || key === "prefixes") && !r.label) w.push([i, `${n}: thiếu tên.`]);
    });
    return w;
  }

  // ===== Inputs =====
  function input(c, obj, D, onChange, opt) {
    opt = opt || {};
    if (c.type === "select") {
      const s = el("select", { "aria-label": c.label, onchange: e => { obj[c.k] = e.target.value; if (!obj[c.k] && opt.table) delete obj[c.k]; onChange(c); } },
        c.options(D).map(([v, t]) => el("option", { value: v }, t)));
      s.value = obj[c.k] || "";
      if (obj[c.k] && s.value !== obj[c.k]) { s.append(el("option", { value: obj[c.k] }, obj[c.k] + " (không tồn tại)")); s.value = obj[c.k]; }
      if (s.selectedIndex < 0) s.selectedIndex = 0;
      if (!obj[c.k] && s.value && !opt.table) obj[c.k] = s.value;
      return s;
    }
    if (c.type === "bool") return el("input", { type: "checkbox", checked: !!obj[c.k], "aria-label": c.label,
      onchange: e => { if (e.target.checked) obj[c.k] = true; else delete obj[c.k]; onChange(c); } });
    if (c.type === "multi") {
      const sel = new Set(obj[c.k] || []);
      return el("div", { class: "pos-multi" }, c.options(D, obj).map(([v, t]) => el("label", {},
        el("input", { type: "checkbox", checked: sel.has(v), onchange: e => {
          e.target.checked ? sel.add(v) : sel.delete(v);
          obj[c.k] = c.options(D, obj).map(o => o[0]).filter(x => sel.has(x));
          if (!obj[c.k].length) delete obj[c.k];
          onChange(c);
        } }), t)));
    }
    const inp = el("input", { type: c.type === "url" ? "url" : "text", class: c.type === "code" ? "code" : "", value: obj[c.k] || "",
      "aria-label": c.label, placeholder: c.placeholder || null, list: c.list ? `qe_dl_${c.k}` : null, readonly: opt.locked || null,
      size: opt.locked ? Math.max(4, String(obj[c.k] || "").length) : null,
      oninput: e => { obj[c.k] = e.target.value; onChange(c, true); },
      onchange: e => { if (c.type === "code") { obj[c.k] = slug(e.target.value); e.target.value = obj[c.k]; } onChange(c); } });
    return inp;
  }

  // open(key, D, { platform, account, mode: "add" | "edit", onSave({ added }) })
  function open(key, D, opts) {
    const S = SCHEMA[key]; opts = opts || {};
    const ctx = { platform: opts.platform || "", account: opts.account || null };
    let work = clone(D[key]), dirty = false, showAll = false, draft = {};
    const unlocked = new WeakSet();
    const original = new WeakSet(work);

    const listCols = {};
    [].concat(S.cols, S.quick.fields(ctx, D, {})).forEach(c => { if (c.list) listCols[c.k] = c; });
    const datalists = el("div", { hidden: true }, Object.values(listCols)
      .map(c => el("datalist", { id: `qe_dl_${c.k}` }, c.list(D).map(v => el("option", { value: v })))));

    // ----- Quick add -----
    const qForm = el("form", { class: "qe-add", autocomplete: "off", onsubmit: e => { e.preventDefault(); quickAdd(); } });
    const qMsg = el("p", { class: "qe-msg", role: "alert" });
    function renderQuick(focusKey) {
      qForm.innerHTML = "";
      const fields = S.quick.fields(ctx, D, draft);
      fields.forEach(f => { if (f.initial !== undefined && draft[f.k] === undefined) draft[f.k] = f.initial; });
      const row = S.quick.derive(draft, ctx, D);
      const grid = el("div", { class: "qe-fields" }, fields.map(f => f.type === "bool"
        ? el("label", { class: "check qe-wide" }, input(f, draft, D, () => renderPreview()), f.label)
        : el("label", { class: "qe-field" + (f.wide ? " qe-wide" : "") },
            el("span", {}, f.label, f.required ? el("b", { "aria-hidden": "true" }, " *") : null),
            input(f, draft, D, (c, typing) => { qMsg.textContent = ""; if (c.rerender && !typing) renderQuick(c.k); else renderPreview(); }))));
      qForm.append(grid, el("div", { class: "qe-codes", id: "qeCodes" }), qMsg,
        el("div", { class: "qe-add-x" }, el("button", { type: "submit", class: "btn" }, S.addTitle(ctx))));
      renderPreview(row);
      const f = focusKey ? qForm.querySelector(`[aria-label="${fields.find(x => x.k === focusKey).label}"]`) : qForm.querySelector("input:not([type=checkbox]), select");
      if (f && opts.mode !== "edit") setTimeout(() => f.focus(), 0);
    }
    function renderPreview(row) {
      row = row || S.quick.derive(draft, ctx, D);
      const box = qForm.querySelector("#qeCodes"); if (!box) return;
      box.innerHTML = "";
      const codes = S.quick.codes(row);
      box.append(el("span", { class: "qe-codes-l" }, "Mã sẽ dùng:"));
      codes.forEach(([label, value, editable]) => {
        if (editable && draft.editCode) {
          box.append(el("label", { class: "qe-code-edit" }, label + " =",
            el("input", { type: "text", class: "code", value: draft.code || value, "aria-label": label,
              oninput: e => { draft.code = slug(e.target.value); }, onchange: e => { e.target.value = draft.code; } })));
        } else {
          box.append(el("span", { class: "qe-code" }, label, " = ", el("b", {}, value || "…")));
          if (editable) box.append(el("button", { type: "button", class: "qe-link", onclick: () => { draft.editCode = true; draft.code = value; renderPreview(); qForm.querySelector(".qe-code-edit input").focus(); } }, "Sửa mã"));
        }
      });
      const note = S.quick.note ? S.quick.note(row, ctx, D) : "";
      if (note) box.append(el("span", { class: "qe-note" }, note));
    }
    function quickAdd() {
      const fields = S.quick.fields(ctx, D, draft);
      const miss = fields.filter(f => f.required && !(draft[f.k] || "").trim());
      if (miss.length) { qMsg.textContent = `Điền ${miss.map(f => f.label.toLowerCase()).join(", ")}.`; qForm.querySelector(`[aria-label="${miss[0].label}"]`).focus(); return; }
      const row = S.quick.derive(draft, ctx, D);
      const all = work.concat([row]);
      const w = validate(key, all, D).filter(([i]) => i === all.length - 1);
      if (w.length) { qMsg.textContent = w.map(x => x[1].replace(/^Dòng \d+: /, "")).join(" "); return; }
      const extra = S.quick.after ? S.quick.after(row, draft, ctx, D) : null;
      if (!commit(all, extra)) return;
      done({ added: row });
    }

    // ----- Edit list -----
    const tbody = el("tbody"), thead = el("thead"), warnBox = el("ul", { class: "warns" });
    const saveBtn = el("button", { type: "button", class: "btn", disabled: true, onclick: () => { if (commit(work)) done({}); } }, "Lưu thay đổi");
    const filterOf = S.filter ? S.filter(ctx) : null;
    const editBox = el("details", { class: "qe-edit", open: opts.mode === "edit" || null },
      el("summary", {}, `Sửa hoặc xóa ${S.title.toLowerCase()} đã có`, el("span", { class: "qe-count" })),
      filterOf ? el("label", { class: "check qe-filter" }, el("input", { type: "checkbox", checked: true, onchange: e => { showAll = !e.target.checked; renderTable(); } }), S.filterLabel(ctx)) : null,
      el("div", { class: "qe-tbl" }, el("table", { class: "ed" }, thead, tbody)),
      warnBox);

    function visibleCols() { return S.cols.filter(c => !(c.hide && c.hide(ctx, showAll))); }
    function changed(c, typing) {
      dirty = true; saveBtn.disabled = false;
      if (!typing && c && c.k === "p") renderTable();
      renderWarns();
    }
    function renderWarns() {
      const w = validate(key, work, D); warnBox.innerHTML = "";
      w.forEach(([, t]) => warnBox.append(el("li", {}, t)));
      tbody.querySelectorAll("tr").forEach(tr => tr.classList.toggle("bad", w.some(x => x[0] === +tr.dataset.i)));
    }
    function renderTable() {
      const cols = visibleCols();
      thead.innerHTML = ""; tbody.innerHTML = "";
      thead.append(el("tr", {}, cols.map(c => el("th", { scope: "col" }, c.label)), el("th", {}, el("span", { class: "sr" }, "Thao tác"))));
      let n = 0;
      work.forEach((r, i) => {
        if (filterOf && !showAll && !filterOf(r)) return;
        n++;
        tbody.append(el("tr", { "data-i": i },
          cols.map(c => {
            if (c.skip && c.skip(r)) return el("td", { class: "hint" }, c.skipText || "—");
            const locked = c.type === "code" && original.has(r) && !unlocked.has(r);
            const field = input(c, r, D, changed, { table: true, locked });
            if (!locked) return el("td", {}, field);
            return el("td", {}, el("span", { class: "qe-codewrap" }, field,
              el("button", { type: "button", class: "qe-link", title: "Mã đã dùng trong link, đổi sẽ tách số liệu GA4", onclick: () => {
                if (!confirm("Mã này có thể đã nằm trong link đang chạy. Đổi mã sẽ tách số liệu GA4 thành hai dòng. Vẫn đổi?")) return;
                unlocked.add(r); renderTable(); } }, "Đổi")));
          }),
          el("td", { class: "x" },
            el("button", { type: "button", title: "Lên", "aria-label": "Đưa lên", onclick: () => move(i, -1) }, "↑"),
            el("button", { type: "button", title: "Xuống", "aria-label": "Đưa xuống", onclick: () => move(i, 1) }, "↓"),
            el("button", { type: "button", title: "Xóa", "aria-label": `Xóa ${r.name || r.label || r.code || ""}`, onclick: () => del(i) }, "✕"))));
      });
      if (!n) tbody.append(el("tr", {}, el("td", { colspan: cols.length + 1, class: "hint" }, "Chưa có mục nào.")));
      editBox.querySelector(".qe-count").textContent = ` (${n})`;
      renderWarns();
    }
    // Move within the visible (filtered) order
    function move(i, d) {
      const vis = work.map((r, k) => k).filter(k => !filterOf || showAll || filterOf(work[k]));
      const p = vis.indexOf(i), j = vis[p + d]; if (j === undefined) return;
      [work[i], work[j]] = [work[j], work[i]]; changed(); renderTable();
    }
    function del(i) {
      const r = work[i], why = S.inUse ? S.inUse(D, r) : "";
      if (!confirm(why ? `${why}\nVẫn xóa “${r.name || r.label || r.code}”?` : `Xóa “${r.name || r.label || r.code}”?`)) return;
      work.splice(i, 1); changed(); renderTable();
    }

    // ----- Save / close -----
    function commit(rows, extra) {
      const w = validate(key, rows, D);
      if (w.length && !confirm(`Còn ${w.length} cảnh báo:\n- ${w.slice(0, 5).map(x => x[1]).join("\n- ")}\n\nVẫn lưu?`)) return false;
      // Caller keeps its own draft (e.g. quick edit on the plan map): hand the rows over instead of saving
      if (opts.commit) { opts.commit(key, rows, extra || {}); return true; }
      DSC.saveCollection(key, rows);
      Object.entries(extra || {}).forEach(([k, v]) => DSC.saveCollection(k, v));
      return true;
    }
    function done(result) { dirty = false; dlg.close(); dlg.remove(); if (opts.onSave) opts.onSave(result); }
    function cancel() {
      if (dirty && !confirm("Có thay đổi chưa lưu trong bảng. Bỏ thay đổi?")) return;
      dlg.close(); dlg.remove();
    }

    const dlg = el("dialog", { class: "qe", "aria-labelledby": "qeTitle" },
      el("header", { class: "qe-h" },
        el("h2", { id: "qeTitle" }, opts.mode === "edit" ? `Sửa danh sách ${S.title.toLowerCase()}` : S.addTitle(ctx)),
        el("button", { type: "button", class: "qe-x", "aria-label": "Đóng", onclick: cancel }, "✕")),
      el("div", { class: "qe-b" }, datalists,
        el("details", { class: "qe-addbox", open: opts.mode !== "edit" || null }, el("summary", {}, S.addTitle(ctx)), qForm),
        editBox),
      el("footer", { class: "qe-f" },
        opts.commit ? el("p", { class: "hint" }, "Thêm vào bản nháp đang sửa. Bấm “Lưu” trên thanh sửa để lưu.")
          : el("p", { class: "hint" }, "Lưu trên trình duyệt này. Muốn cả team dùng: ", el("a", { href: "danh-muc.html#io" }, "Danh mục → Xuất data.js"), "."),
        el("button", { type: "button", class: "btn ghost", onclick: cancel }, "Đóng"),
        saveBtn));
    dlg.addEventListener("cancel", e => { e.preventDefault(); cancel(); });   // Esc
    dlg.addEventListener("close", () => dlg.remove());

    document.body.append(dlg);
    renderQuick();
    renderTable();
    dlg.showModal();
    if (opts.mode === "edit") setTimeout(() => editBox.scrollIntoView({ block: "start" }), 0);
  }

  DSC.QuickEdit = { open, SCHEMA };
})();
