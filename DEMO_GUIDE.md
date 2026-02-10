# 演示说明：blog-manual 与 blog-ai 的区别与讲解要点

给老师讲解/演示时，可按下面结构和要点进行。

---

## 一、两个项目的定位区别

| 对比项 | blog-manual（人工版） | blog-ai（AI 辅助版） |
|--------|------------------------|------------------------|
| **开发方式** | 模拟传统人工开发：手写、少抽象、逻辑直白 | 现代栈 + AI 辅助生成：组件化、类型安全、迭代式开发 |
| **技术栈** | Python Flask + SQLite + 原生 HTML/CSS/JS | Next.js + TypeScript + Tailwind + Prisma + NextAuth |
| **代码风格** | 单文件/少文件、重复代码较多、无构建步骤 | 多文件、组件拆分、有构建与类型检查 |
| **部署形态** | 单进程（Gunicorn）+ 单 SQLite 文件 | Node 单进程 + SQLite（可换 PostgreSQL） |

**向老师说明**：两个站点实现的是同一套需求（角色、博客、评论、评分、管理后台），便于对比“同一产品、不同开发方式”的差异。

---

## 二、技术差异（可演示的点）

### 1. 项目结构

- **blog-manual**：根目录下 `app.py`、`database.py`、`auth_utils.py`、`config.py`，再加 `templates/`、`static/`，结构扁平。
- **blog-ai**：`src/app/` 下按路由分目录（如 `post/[id]/`、`admin/users/`），`api/` 单独放接口，组件在 `components/`，结构分层清晰。

**讲解**：人工版偏“一个文件干一件事”；AI 版按现代前端习惯拆页面、拆 API、拆组件，便于维护和扩展。

### 2. 前端与样式

- **blog-manual**：服务端渲染 HTML，一套 `style.css`，几乎无前端框架，表单提交即跳转。
- **blog-ai**：React 组件、Tailwind 工具类、部分交互用客户端状态（如登录表单、评分），体验更接近 SPA。

**讲解**：人工版侧重“能跑、简单”；AI 版侧重可读性和交互体验，适合作为“AI 擅长生成的现代前端”示例。

### 3. 数据与认证

- **blog-manual**：手写 SQL（sqlite3）、Session 存 user_id、自己实现密码哈希与权限判断。
- **blog-ai**：Prisma ORM、NextAuth 会话、类型安全的模型与 API。

**讲解**：人工版更贴近数据库和协议细节；AI 版更多依赖成熟库，开发效率高，但需要理解框架约定。

### 4. 功能对应关系（两站一致）

两边的功能是对齐的，演示时可用同一套账号和操作流程：

- **未登录**：首页列表、搜索、读文章。
- **读者**：注册 → 等管理员审核 → 登录后评论、打分。
- **撰稿人**：登录后发/改/删自己的文章（含图片）、举报评论。
- **管理员**：审核用户、编辑/删任意文章、删除不当评论、侧栏开关。

---

## 三、演示流程建议（给老师演示时用）

### 1. 先展示“同一需求”

- 打开两个浏览器标签：`http://localhost:5000`（manual）、`http://localhost:3000`（ai）。
- 对比首页：都能看到博客列表、搜索、布局类似，说明“功能一致、实现不同”。

### 2. 用同一批账号在两站分别登录

建议使用预先插入的模拟账号（见下一节），例如：

- **管理员**：`admin` / `admin123` → 演示审核用户、管理评论、侧栏设置。
- **撰稿人**：`author1` / `demo123` → 演示发帖、编辑、上传图片。
- **读者**：`reader1` / `demo123` → 演示评论、星级评分、举报评论。

### 3. 对比“实现方式”而非只对比界面

- 在老师面前打开两边代码：  
  - manual：看 `app.py` 里路由和 SQL、`templates/` 里 Jinja2。  
  - ai：看 `src/app/post/[id]/page.tsx` 服务端组件、`src/app/api/` 里接口。
- 说明：同一业务（例如“文章详情 + 评论”）在 manual 里是少量大文件、多段 SQL；在 ai 里是页面组件 + API 路由 + Prisma，更模块化。

### 4. 简要说明毕设结论方向

- 人工版：开发节奏可控、代码直观，但重复多、扩展时要改多处。
- AI 版：搭架子快、类型和组件清晰，但需要懂框架和调试 AI 生成代码。
- 论文里可从：开发时间、代码量、可维护性、人工干预程度等角度做对比（具体数据以你实际记录为准）。

---

## 四、模拟账号与数据说明

两个项目都已准备好**同一套**模拟账号和示例数据，便于在两站用相同步骤演示。

### 账号一览（密码见下）

| 角色 | 用户名 | 密码 | 说明 |
|------|--------|------|------|
| 管理员 | admin | admin123 | 审核用户、管理文章与评论、侧栏 |
| 撰稿人 | author1 | demo123 | 已审核，可发帖、编辑自己的文章 |
| 撰稿人 | author2 | demo123 | 已审核，可发帖 |
| 读者 | reader1 | demo123 | 已审核，可评论、评分、举报 |
| 读者 | reader2 | demo123 | 已审核 |
| 待审核 | pending1 | demo123 | 撰稿人申请，未审核，用于演示管理员“批准/拒绝” |

**统一密码**：演示账号除 admin 外均为 `demo123`，便于记忆。

### 示例内容

- 若干篇博客（标题、正文、地点），由 author1、author2 发布。
- 部分文章下有 reader1、reader2 的评论和星级评分。
- 可选：一条被举报的评论，用于演示管理员“删除不当评论”。

**导入方式：**

- **blog-manual**（在项目目录下）：
  ```bash
  source venv/bin/activate   # 或 . venv/bin/activate
  python init_admin.py       # 若无管理员先执行
  python seed_demo_data.py   # 插入演示账号与博文/评论/评分
  python seed_demo_images.py # 为每篇博文插入示例图片（需先有 static/uploads/travel_seed.jpg）
  ```
- **blog-ai**（在项目目录下）：
  ```bash
  npx prisma migrate dev     # 若无数据库先执行
  npx tsx scripts/seed.ts    # 创建 admin
  npx tsx scripts/seed-demo.ts  # 插入演示账号与博文/评论/评分
  npx tsx scripts/seed-demo-images.ts  # 为每篇博文插入示例图片（需先有 public/uploads/travel_seed.jpg）
  ```
  博文配图：每篇文章使用**不同**的 Unsplash 免费旅游图（travel1.jpg～travel4.jpg 循环分配）。需先将这 4 张图放入 `static/uploads/`（manual）或 `public/uploads/`（ai），再运行上述图片种子脚本。

演示前各运行一次，两站数据一致，便于对比演示。

---

## 五、常见问题（老师可能问到）

1. **为什么两个站技术栈不一样？**  
   毕设目的是对比“人工开发”与“AI 辅助开发”，所以人工版用更传统的 Flask+SQLite+简单前端，AI 版用 AI 更擅长的 Next.js+TypeScript 等，以体现两种开发路径的差异。

2. **功能有没有少做？**  
   核心功能一致：四类角色、博客 CRUD、评论、评分、举报、管理员审核与侧栏。部分扩展功能（如 18 个月自动删文、邮件通知）在规划中记为“未来工作”。

3. **数据是共用的吗？**  
   不共用。两个项目各有一个 SQLite 数据库，只是通过“种子脚本”插入了相同的账号和类似的示例内容，便于两边用相同账号做对比演示。

4. **如何恢复干净数据重新演示？**  
   - manual：删除 `blog-manual/blog.db` 后，重新执行 `python init_admin.py` 再执行 `python seed_demo_data.py`。  
   - ai：删除 `blog-ai/prisma/dev.db`（或 Prisma 使用的数据库文件）后，执行 `npx prisma migrate dev` 再执行 `npx tsx scripts/seed.ts` 和 `npx tsx scripts/seed-demo.ts`。

---

以上内容可直接用于给老师讲解和演示；模拟数据脚本见各项目中的 `seed_demo_data.py`（manual）与 `scripts/seed-demo.ts`（ai）。
