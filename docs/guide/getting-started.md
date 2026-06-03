# 快速开始

ToolKit 是一个**离线可用的 PWA 在线工具箱**，包含 20+ 常用开发与日常工具。无需安装、无需注册，打开浏览器即可使用。

## 访问方式

- **GitHub Pages**：[https://zyssnh.github.io/toolbox/](https://zyssnh.github.io/toolbox/)
- **本地运行**：见下方说明

## 本地开发

```bash
# 克隆仓库
git clone https://github.com/zyssnh/toolbox.git
cd toolbox

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React 19 + TypeScript |
| 构建 | Vite 8 |
| 路由 | React Router (HashRouter) |
| 状态管理 | Zustand + persist 中间件 |
| PWA | vite-plugin-pwa + Workbox |
| 文档 | VitePress |
| 部署 | GitHub Actions → GitHub Pages |

## PWA 特性

ToolKit 支持 **PWA 离线使用**：

1. 首次访问后在浏览器地址栏会出现安装图标
2. 点击安装即可添加到桌面/主屏幕
3. 所有工具在无网络环境下也能正常使用
4. Service Worker 自动缓存静态资源

## 项目结构

```
toolbox-pwa/
├── docs/                # VitePress 文档
│   └── .vitepress/
├── src/
│   ├── tools/           # 20 个工具（各自独立目录）
│   │   ├── unit-xxx/    # 单位换算类 (4)
│   │   ├── time-xxx/    # 时间日期类 (4)
│   │   ├── text-xxx/    # 文本处理类 (4)
│   │   ├── dev-xxx/     # 开发工具类 (4)
│   │   └── game-xxx/    # 游戏类 (4)
│   ├── components/      # 共享 UI 组件
│   ├── pages/           # 路由页面
│   ├── store/           # Zustand 状态
│   └── theme.ts         # 双主题色板
├── .github/workflows/   # CI/CD
└── vite.config.ts       # Vite + PWA 配置
```

## 添加新工具

1. 在 `src/tools/` 下创建 `{category}-{name}/` 目录
2. 编写 `index.tsx`（导出默认组件）和 `meta.ts`
3. 在 `src/registry.ts` 中注册工具元信息和懒加载
4. 工具会自动出现在首页并支持搜索
