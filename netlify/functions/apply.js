(function () {
  const DEBUG_ENABLED =
    window.location.search.includes("debug=1") ||
    localStorage.getItem("debugSubmit") === "1";

  if (!DEBUG_ENABLED) return;

  const state = {
    startedAt: new Date().toISOString(),
    logs: [],
  };

  function log(type, message, data) {
    const entry = {
      time: new Date().toISOString(),
      type,
      message,
      data: data || null,
    };
    state.logs.push(entry);

    const method =
      type === "error" ? "error" :
      type === "warn" ? "warn" :
      "log";

    console[method]("[DEBUG-SUBMIT]", message, data || "");

    const box = document.getElementById("debug-submit-box");
    if (box) {
      const row = document.createElement("div");
      row.style.borderBottom = "1px solid rgba(255,255,255,0.12)";
      row.style.padding = "6px 0";
      row.innerHTML =
        "<div><strong>" + escapeHtml(type.toUpperCase()) + "</strong> " +
        escapeHtml(message) + "</div>" +
        (data ? "<pre style='white-space:pre-wrap;margin:4px 0 0;'>" +
          escapeHtml(safeStringify(data)) +
          "</pre>" : "");
      box.prepend(row);
    }
  }

  function safeStringify(value) {
    try {
      return JSON.stringify(value, null, 2);
    } catch (e) {
      return String(value);
    }
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function addPanel() {
    const wrap = document.createElement("div");
    wrap.id = "debug-submit-wrap";
    wrap.style.position = "fixed";
    wrap.style.right = "12px";
    wrap.style.bottom = "12px";
    wrap.style.width = "420px";
    wrap.style.maxWidth = "95vw";
    wrap.style.maxHeight = "60vh";
    wrap.style.background = "#111";
    wrap.style.color = "#fff";
    wrap.style.zIndex = "999999";
    wrap.style.fontSize = "12px";
    wrap.style.fontFamily = "monospace";
    wrap.style.border = "1px solid rgba(255,255,255,0.2)";
    wrap.style.borderRadius = "10px";
    wrap.style.boxShadow = "0 10px 30px rgba(0,0,0,0.35)";
    wrap.style.overflow = "hidden";

    wrap.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;background:#1b1b1b;border-bottom:1px solid rgba(255,255,255,0.12);">
        <strong>Submit Debug</strong>
        <div style="display:flex;gap:8px;">
          <button id="debug-copy-btn" style="cursor:pointer;">Copy Logs</button>
          <button id="debug-clear-btn" style="cursor:pointer;">Clear</button>
          <button id="debug-close-btn" style="cursor:pointer;">Close</button>
        </div>
      </div>
      <div id="debug-submit-box" style="padding:10px;overflow:auto;max-height:50vh;"></div>
    `;
    document.body.appendChild(wrap);

    document.getElementById("debug-copy-btn").addEventListener("click", async function () {
      const text = safeStringify(state.logs);
      try {
        await navigator.clipboard.writeText(text);
        log("info", "Logs copied to clipboard");
      } catch (e) {
        log
