# 修复 GitHub Pages 空白页面

## 问题原因

你的页面打开是空白的，原因是 **GitHub Pages 的部署来源设置不对**。

你当前可能设置的是 "Deploy from a branch"（从分支部署），这种方式会从仓库根目录找 `index.html`，但你的 `index.html` 在 `app/dist/` 里，根目录没有，所以页面空白。

## 解决方法（2步）

### 第1步：修改 GitHub Pages 的 Source 设置

1. 打开 https://github.com/lhj305183048/Vicky-Pocket/settings/pages
2. 在 **Build and deployment** 下的 **Source** 下拉框中：
   - 如果当前显示的是 **"Deploy from a branch"** → 改为 **"GitHub Actions"**
   - 如果已经是 **"GitHub Actions"** → 不用改，进行第2步
3. 改完后页面会自动保存

### 第2步：重新推送代码触发部署

我已经更新了部署工作流文件（改用 `npm install` 替代 `npm ci`，更稳定）。你需要重新推送代码：

```powershell
cd C:\Users\Nicole\CodeBuddy\20260912133908
git add .
git commit -m "修复 Pages 部署配置"
git push
```

### 第3步：等待部署完成

1. 打开 https://github.com/lhj305183048/Vicky-Pocket/actions
2. 看到新的 "Deploy to GitHub Pages" 运行
3. 等待 2-3 分钟，绿色对勾 = 成功
4. 打开 https://lhj305183048.github.io/Vicky-Pocket/ 刷新

---

## 如果还是空白

打开浏览器开发者工具（F12），查看 Console 标签页的报错信息，截图发给我。

常见问题：
- **404 for assets/xxx.js** → 说明 dist 没被正确部署，检查 Actions 是否成功
- **CORS error** → 不应该出现，如果出现检查仓库是否 Public
- **MIME type error** → .nojekyll 文件问题，已在工作流中添加
