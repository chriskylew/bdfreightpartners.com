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

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function log(type, message, data) {
    const entry = {
      time: new Date().toISOString(),
      type,
      message,
      data: data || null
    };
    state.logs.push(entry);

    const method = type === "error" ? "error" : (type === "warn" ? "warn" : "log");
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

  function addPanel() {
    if (document.getElementById("debug-submit-wrap")) return;

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
        log("error", "Clipboard copy failed", { error: String(e) });
      }
    });

    document.getElementById("debug-clear-btn").addEventListener("click", function () {
      state.logs = [];
      const box = document.getElementById("debug-submit-box");
      if (box) box.innerHTML = "";
      log("info", "Logs cleared");
    });

    document.getElementById("debug-close-btn").addEventListener("click", function () {
      wrap.remove();
    });
  }

  window.addEventListener("error", function (e) {
    log("error", "Window error", {
      message: e.message,
      source: e.filename,
      line: e.lineno,
      col: e.colno
    });
  });

  window.addEventListener("unhandledrejection", function (e) {
    log("error", "Unhandled promise rejection", {
      reason: String(e.reason)
    });
  });

  const originalFetch = window.fetch;
  if (originalFetch) {
    window.fetch = async function (...args) {
      log("info", "fetch start", { input: args[0] });
      try {
        const res = await originalFetch.apply(this, args);
        let preview = "";
        try {
          const clone = res.clone();
          preview = (await clone.text()).slice(0, 500);
        } catch (e) {}

        log("info", "fetch response", {
          url: res.url,
          status: res.status,
          ok: res.ok,
          preview
        });
        return res;
      } catch (err) {
        log("error", "fetch failed", { error: String(err) });
        throw err;
      }
    };
  }

  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method, url) {
    this.__debugMethod = method;
    this.__debugUrl = url;
    return originalOpen.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function (body) {
    const xhr = this;
    xhr.addEventListener("load", function () {
      log("info", "xhr response", {
        method: xhr.__debugMethod,
        url: xhr.__debugUrl,
        status: xhr.status,
        response: String(xhr.responseText || "").slice(0, 500)
      });
    });
    xhr.addEventListener("error", function () {
      log("error", "xhr failed", {
        method: xhr.__debugMethod,
        url: xhr.__debugUrl
      });
    });
    return originalSend.apply(this, arguments);
  };

  function inspectTurnstile() {
    const widget = document.querySelector(".cf-turnstile");
    const hiddenInput = document.querySelector('[name="cf-turnstile-response"]');

    log("info", "Turnstile check", {
      widgetPresent: !!widget,
      hiddenInputPresent: !!hiddenInput,
      hiddenValuePresent: !!(hiddenInput && hiddenInput.value),
      widgetHtml: widget ? widget.outerHTML.slice(0, 400) : null
    });
  }

  function inspectForm() {
    const form = document.querySelector("form");
    if (!form) {
      log("error", "No form found on page");
      return;
    }

    log("info", "Form found", {
      action: form.getAttribute("action"),
      method: form.getAttribute("method"),
      id: form.id || null
    });

    form.addEventListener("submit", function (e) {
      const formData = new FormData(form);
      const entries = {};
      for (const [key, value] of formData.entries()) {
        entries[key] = value instanceof File ? "[file]" : value;
      }

      const turnstileField =
        form.querySelector('[name="cf-turnstile-response"]') ||
        document.querySelector('[name="cf-turnstile-response"]');

      log("info", "Form submit fired", {
        defaultPrevented: e.defaultPrevented,
        action: form.getAttribute("action"),
        method: form.getAttribute("method"),
        fields: entries,
        hasTurnstileField: !!turnstileField,
        turnstileValuePresent: !!(turnstileField && turnstileField.value),
        currentUrl: window.location.href
      });

      setTimeout(function () {
        log("info", "2s after submit", { currentUrl: window.location.href });
      }, 2000);
    }, true);
  }

  window.addEventListener("load", function () {
    addPanel();
    log("info", "Page loaded", { url: window.location.href });
    inspectForm();
    inspectTurnstile();
  });
})();
