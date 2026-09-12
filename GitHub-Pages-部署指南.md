# GitHub Pages 部署指南

## 你的文件在哪里？

你的项目在电脑上的路径是：
```
C:\Users\Nicole\CodeBuddy\20260912133908
```

其中：
- `app\` — 应用源代码
- `app\src\` — React 组件源码
- `app\dist\` — 构建后的成品（每次 build 会更新）
- `.github\workflows\deploy.yml` — GitHub Pages 自动部署配置（已为你创建好）
- `.gitignore` — 告诉 Git 哪些文件不需要上传（已为你创建好）

---

## 第一步：安装 Git（只需一次）

你的电脑还没有安装 Git，需要先安装：

1. 打开 https://git-scm.com/download/win
2. 下载 **64-bit Git for Windows Setup**
3. 双击安装，一路点"Next"用默认设置即可
4. 安装完成后，**关闭并重新打开** PowerShell / 终端
5. 验证安装成功：
   ```
   git --version
   ```
   如果显示 `git version 2.xx.x` 就成功了

---

## 第二步：在 GitHub 上创建仓库

1. 打开 https://github.com 并登录你的账号
2. 右上角点 **+** → **New repository**
3. 设置：
   - **Repository name**：`vicky-pocket`（或你喜欢的名字）
   - **Visibility**：选 **Public**（公开）— 免费账户 GitHub Pages 仅支持公开仓库
   - **不要勾选** "Add a README file" 等任何初始化选项
4. 点 **Create repository**
5. 创建后页面会显示仓库地址，类似：
   ```
   https://github.com/你的用户名/vicky-pocket.git
   ```
   把这个地址记下来

---

## 第三步：把代码上传到 GitHub

打开 PowerShell（Windows），依次执行以下命令（把 `你的用户名` 替换为实际的用户名）：

```powershell
# 1. 进入项目目录
cd C:\Users\Nicole\CodeBuddy\20260912133908

# 2. 初始化 Git 仓库
git init

# 3. 把所有文件加入暂存区
git add .

# 4. 提交
git commit -m "Vicky Pocket 记账应用"

# 5. 设置主分支名
git branch -M main

# 6. 关联你的 GitHub 仓库（把地址替换成你的）
git remote add origin https://github.com/你的用户名/vicky-pocket.git

# 7. 推送到 GitHub
git push -u origin main
```

> **如果提示需要登录**：推送到 GitHub 时可能会弹出窗口要求登录，用浏览器完成 GitHub 授权即可。

---

## 第四步：开启 GitHub Pages

1. 打开你的仓库页面：`https://github.com/你的用户名/vicky-pocket`
2. 点顶部 **Settings** 标签
3. 左侧菜单找到 **Pages**
4. 在 **Build and deployment** 下：
   - **Source**：选 **GitHub Actions**
5. 不需要其他设置，关掉页面即可

---

## 第五步：等待自动部署完成

你刚推送的代码会自动触发 GitHub Actions 构建：

1. 打开仓库页面，点顶部 **Actions** 标签
2. 会看到一个名为 **Deploy to GitHub Pages** 的任务在运行
3. 等待 2-3 分钟，状态从黄色圆圈变为绿色对勾
4. 部署成功后，回到 **Settings → Pages**，你会看到：
   ```
   Your site is live at https://你的用户名.github.io/vicky-pocket/
   ```

**这就是你的访问链接！手机和电脑都打开这个链接就能用。**

---

## 第六步：在手机和电脑上使用

### 电脑使用
- 直接用浏览器打开：`https://你的用户名.github.io/vicky-pocket/`
- 建议加入书签

### 手机使用

**iPhone**：
1. 用 **Safari** 打开上面的链接
2. 点底部分享按钮（向上箭头图标）
3. 选 **"添加到主屏幕"**
4. 桌面会生成一个图标，点开就像原生 App 一样全屏使用

**Android**：
1. 用 **Chrome** 打开上面的链接
2. 点右上角菜单（三个点）
3. 选 **"添加到主屏幕"**
4. 桌面生成图标，点开使用

---

## 离线可以使用吗？

**可以！** 数据存储在浏览器本地（localStorage），不依赖网络。

但需要注意：
- **首次打开**需要联网加载网页
- 之后如果浏览器缓存还在，断网时仍可打开使用
- 添加到手机主屏幕后，浏览器会缓存页面，断网也能打开
- 所有记账、图表、设置功能在离线时完全正常

---

## 以后更新怎么办？

每次修改代码后，只需：
```powershell
cd C:\Users\Nicole\CodeBuddy\20260912133908
git add .
git commit -m "更新说明"
git push
```
GitHub 会自动重新构建部署，几分钟后刷新网页就能看到更新。

---

## 常见问题

**Q: 推送时提示 "rejected - non-fast-forward"**
A: 先执行 `git pull origin main --rebase`，再 `git push`

**Q: Actions 部署失败**
A: 检查 Actions 页面的错误日志，常见原因是 package-lock.json 不一致，可在本地执行 `cd app && npm install` 后重新提交

**Q: 页面打开是空白**
A: 确认仓库是 Public（免费账户 GitHub Pages 仅支持公开仓库）

**Q: 想换自定义域名**
A: 在仓库 Settings → Pages → Custom domain 中输入你的域名，按提示配置 DNS

**Q: 不同设备间数据会同步吗？**
A: 不会。每个设备的数据存储在各自的浏览器中，互相独立。如需跨设备同步，需要接入后端数据库（如 Supabase）。
