// 村里发枪了 - 提示词助手（桌面版）
// 数据结构兼容你的 keywords.json：
// [ { name: '分组名', keywords: [{label:'按钮名', value:'提示词'}] } ]

let library = null;
let DEFAULT_LIBRARY = null; // 从 keywords_default.json 读取

const els = {
  promptBox: document.getElementById("promptBox"),
  btnCopy: document.getElementById("btnCopy"),
  btnClear: document.getElementById("btnClear"),
  toggleNewline: document.getElementById("toggleNewline"),
  groups: document.getElementById("groups"),
  toast: document.getElementById("toast"),
  search: document.getElementById("search"),
  btnImport: document.getElementById("btnImport"),
  btnExport: document.getElementById("btnExport"),
  btnReset: document.getElementById("btnReset"),
  btnReveal: document.getElementById("btnReveal"),
  ver: document.getElementById("ver")
};

const UI_KEY = 'cunli_prompt_ui_v1'; // 只保存 UI 状态（换行、输入框内容）

function loadUI() {
  try { return JSON.parse(localStorage.getItem(UI_KEY) || '{}'); } catch { return {}; }
}
function saveUI(patch) {
  const cur = loadUI();
  const next = { ...cur, ...patch };
  localStorage.setItem(UI_KEY, JSON.stringify(next));
}



function toast(msg) {
  els.toast.textContent = msg;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => (els.toast.textContent = ""), 2400);
}

function sanitizeLibrary(lib) {
  if (!Array.isArray(lib)) throw new Error("JSON 顶层必须是数组");
  for (const g of lib) {
    if (!g || typeof g !== "object") throw new Error("分组必须是对象");
    if (typeof g.name !== "string") throw new Error("分组缺少 name 字段");
    if (!Array.isArray(g.keywords)) g.keywords = [];
    g.keywords = g.keywords
      .filter(k => k && typeof k.label === "string" && typeof k.value === "string")
      .map(k => ({ label: k.label, value: k.value }));
  }
  return lib;
}





// ===== 按钮事件 =====
els.btnCopy.addEventListener("click", async () => {
  const text = els.promptBox.value || "";
  try {
    await navigator.clipboard.writeText(text);
    toast("已复制到剪贴板");
  } catch (err) {
    console.error(err);
    toast("复制失败（系统限制）：请手动全选复制");
  }
});

els.btnClear.addEventListener("click", () => {
  els.promptBox.value = "";
  saveUI({ prompt: "" });
  toast("已清空");
});

els.toggleNewline.addEventListener("change", () => {
  saveUI({ newline: !!els.toggleNewline.checked });
});

els.promptBox.addEventListener("input", () => {
  saveUI({ prompt: els.promptBox.value });
});

els.search.addEventListener("input", () => render());

els.btnImport.addEventListener("click", async () => {
  try {
    const res = await window.desktopAPI.importKeywords();
    if (!res) return;
    library = sanitizeLibrary(res.data);
    await window.desktopAPI.saveKeywords(library);
    render();
    toast("导入成功（已写入本机库）");
  } catch (err) {
    console.error(err);
    toast("导入失败：" + (err?.message || String(err)));
  }
});

els.btnExport.addEventListener("click", async () => {
  try {
    const res = await window.desktopAPI.exportKeywords(library || []);
    if (!res) return;
    toast("已导出到：" + res.exportedTo);
  } catch (err) {
    console.error(err);
    toast("导出失败：" + (err?.message || String(err)));
  }
});

els.btnReveal.addEventListener("click", async () => {
  try {
    await window.desktopAPI.revealStore();
    toast("已打开库文件位置");
  } catch (err) {
    console.error(err);
    toast("打开失败：" + (err?.message || String(err)));
  }
});

els.btnReset.addEventListener("click", async () => {
  try {
    library = sanitizeLibrary(DEFAULT_LIBRARY || []);
    await window.desktopAPI.saveKeywords(library);
    render();
    toast("已重置为内置默认库");
  } catch (err) {
    console.error(err);
    toast("重置失败：" + (err?.message || String(err)));
  }
});

// ===== 初始化 =====
async function init() {
  // 版本号
  try {
    const v = await window.desktopAPI.version();
    if (els.ver) els.ver.textContent = "v" + v;
  } catch {}

  // 读默认库（打包在应用里）
  try {
    const resp = await fetch("./keywords_default.json");
    DEFAULT_LIBRARY = sanitizeLibrary(await resp.json());
  } catch (e) {
    console.error(e);
    DEFAULT_LIBRARY = [];
  }

  // 读本机库（userData/keywords.json）
  try {
    const res = await window.desktopAPI.loadKeywords();
    if (res && Array.isArray(res.data) && res.data.length) {
      library = sanitizeLibrary(res.data);
    } else {
      library = sanitizeLibrary(DEFAULT_LIBRARY);
      await window.desktopAPI.saveKeywords(library);
    }
  } catch (e) {
    console.error(e);
    library = sanitizeLibrary(DEFAULT_LIBRARY);
  }

  // UI 状态
  const ui = loadUI();
  if (typeof ui.newline === "boolean") els.toggleNewline.checked = ui.newline;
  if (typeof ui.prompt === "string") els.promptBox.value = ui.prompt;

  render();
}

init();
