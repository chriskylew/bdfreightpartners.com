(function () {
  const DEBUG_ENABLED =
    window.location.search.includes("debug=1") ||
    localStorage.getItem("debugSubmit") === "1";

  if (!DEBUG_ENABLED) return;

  const state = { logs: [] };

  function safeStringify(value) {
    try {
      return JSON.stringify(value, null, 2);
    } catch (e) {
      return String(value);
    }
  }

  function log(type, message, data) {
    const entry = {
      time: new Date().toISOString(),
      type,
      message,
      data: data || null
    };
    state.logs.push(entry);

    console[type === "error" ? "error" : "log"]("[DEBUG]", message, data || "");

    const box = document.getElementById("debug-submit-box");
    if (box) {
      const row = document.createElement("div");
      row.style.borderBottom = "1px solid rgba(255,255,255,0.12)";
      row.style.padding = "6px 0";
      row.innerHTML =
        "<div><strong>" + type.toUpperCase() + "</strong> " + message + "</div>" +
        (data ? "<pre>" + safeStringify(data) + "</pre>" : "");
      box.prepend(row);
    }
  }

  function addPanel() {
    if (document.getElementById("debug-submit-wrap")) return;

    const wrap = document.createElement("div");
    wrap.id = "debug-submit-wrap";
    wrap.style.position = "fixed";
    wrap.style.right = "12px";
    wrap.style.bottom = "12px";
    wrap.style.width = "420px";
    wrap.style.maxHeight = "60vh";
    wrap.style.background = "#111";
    wrap.style.color = "#fff";
    wrap.style.zIndex = "999999";
    wrap.style.fontSize = "12px";
    wrap.style.fontFamily = "monospace";
    wrap.style.border = "1px solid rgba(255,255,255,0.2)";
    wrap.style.borderRadius = "10px";
    wrap.style.overflow = "hidden";

    wrap.innerHTML = `
      <div style="display:flex;justify-content:space-between;padding:10px;background:#1b1b1b;">
        <strong>Debug Panel</strong>
        <div>
          <button id="debug-copy">Copy</button>
          <button id="debug-clear">Clear</button>
          <button id="debug-close">X</button>
        </div>
      </div>
      <div id="debug-submit-box" style="padding:10px;overflow:auto;max-height:50vh;"></div>
    `;

    document.body.appendChild(wrap);

    document.getElementById("debug-close").onclick = () => wrap.remove();

    document.getElementById("debug-clear").onclick = () => {
      state.logs = [];
      document.getElementById("debug-submit-box").innerHTML = "";
    };

    document.getElementById("debug-copy").onclick = async () => {
      try {
        await navigator.clipboard.writeText(safeStringify(state.logs));
        log("info", "Copied logs");
      } catch (e) {
        log("error", "Copy failed", e);
      }
    };
  }

  window.addEventListener("error", function (e) {
    log("error", "JS Error", {
      message: e.message,
      file: e.filename,
      line: e.lineno
    });
  });

  window.addEventListener("load", function () {
    addPanel();
    log("info", "Page loaded", { url: window.location.href });
  });
})();
