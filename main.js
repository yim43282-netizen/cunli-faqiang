const { app, BrowserWindow, ipcMain, dialog, shell } = require("electron");
const path = require("path");
const fs = require("fs/promises");

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 780,
    backgroundColor: "#111111",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  win.loadFile(path.join(__dirname, "renderer", "index.html"));
}

function storePath() {
  return path.join(app.getPath("userData"), "keywords.json");
}

async function readJsonMaybe(p) {
  try {
    const txt = await fs.readFile(p, "utf-8");
    return JSON.parse(txt);
  } catch (e) {
    return null;
  }
}

async function writeJson(p, data) {
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, JSON.stringify(data, null, 2), "utf-8");
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// IPC
ipcMain.handle("app-version", async () => app.getVersion());

ipcMain.handle("load-keywords", async () => {
  const p = storePath();
  const data = await readJsonMaybe(p);
  return { path: p, data };
});

ipcMain.handle("save-keywords", async (_evt, data) => {
  const p = storePath();
  await writeJson(p, data);
  return { path: p };
});

ipcMain.handle("import-keywords", async () => {
  const res = await dialog.showOpenDialog({
    title: "导入 keywords.json",
    properties: ["openFile"],
    filters: [{ name: "JSON", extensions: ["json"] }]
  });
  if (res.canceled || !res.filePaths?.length) return null;

  const pIn = res.filePaths[0];
  const txt = await fs.readFile(pIn, "utf-8");
  const data = JSON.parse(txt);

  // 保存到应用内部库
  const pStore = storePath();
  await writeJson(pStore, data);
  return { importedFrom: pIn, path: pStore, data };
});

ipcMain.handle("export-keywords", async (_evt, data) => {
  const res = await dialog.showSaveDialog({
    title: "导出 keywords.json",
    defaultPath: "keywords.json",
    filters: [{ name: "JSON", extensions: ["json"] }]
  });
  if (res.canceled || !res.filePath) return null;

  await writeJson(res.filePath, data);
  return { exportedTo: res.filePath };
});

ipcMain.handle("reveal-store", async () => {
  const p = storePath();
  await fs.mkdir(path.dirname(p), { recursive: true });
  // 先确保文件存在（如果不存在就创建空数组）
  const existing = await readJsonMaybe(p);
  if (existing === null) await writeJson(p, []);
  shell.showItemInFolder(p);
  return { path: p };
});
