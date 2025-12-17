# 村里发枪了 - 提示词助手（桌面版）

这是把你原来的“网页版离线工具”打包成 **Electron 桌面应用** 的工程源码。  
支持：分组按钮拼接提示词、搜索、复制、清空、导入/导出 JSON、打开本机库文件位置。

## 1) 安装依赖
需要先装 Node.js (建议 18+ / 20+)。

在本目录打开终端：

```bash
npm install
```

## 2) 本地运行
```bash
npm run start
```

## 3) 打包出安装包 / 可执行文件
### Windows
```bash
npm run dist
```
输出在 `dist/`，一般会有 `*.exe`（NSIS 安装包）和 `*.zip`。

### macOS
```bash
npm run dist
```
输出在 `dist/`，一般会有 `*.dmg` 和 `*.zip`。

### Linux
```bash
npm run dist
```
输出在 `dist/`，一般会有 `*.AppImage` / `*.deb`。

## 数据保存位置
- 应用内部库文件：`(userData)/keywords.json`
- 你可以在应用里点 **“打开库位置”** 直接打开它所在目录。

## 导入/导出
- 导入：选择一个外部 `keywords.json`，会覆盖本机库
- 导出：把当前库保存到你指定的位置（用于备份/同步）


---
## 一键拿到 exe（推荐：GitHub Actions）
1. 把整个工程上传到 GitHub（main 分支）。
2. 打开仓库 → Actions → **Build Windows EXE** → Run workflow。
3. 跑完后在 Artifacts 里下载 `cunli-faqiang-windows-dist`，里面就是 `dist/*.exe`。
