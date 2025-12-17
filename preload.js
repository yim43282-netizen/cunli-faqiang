const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("desktopAPI", {
  version: () => ipcRenderer.invoke("app-version"),
  loadKeywords: () => ipcRenderer.invoke("load-keywords"),
  saveKeywords: (data) => ipcRenderer.invoke("save-keywords", data),
  importKeywords: () => ipcRenderer.invoke("import-keywords"),
  exportKeywords: (data) => ipcRenderer.invoke("export-keywords", data),
  revealStore: () => ipcRenderer.invoke("reveal-store")
});
