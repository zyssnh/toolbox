import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '/toolbox/docs/',
  title: 'ToolKit 文档',
  description: '在线工具箱 — 开发者文档',
  lang: 'zh-CN',
  lastUpdated: true,
  cleanUrls: true,

  head: [
    ['link', { rel: 'icon', href: '/toolbox/favicon.ico' }],
  ],

  themeConfig: {
    logo: '⚡',
    nav: [
      { text: '首页', link: '/' },
      { text: '工具文档', link: '/tools/unit-converters' },
      { text: '打开工具箱', link: '/toolbox/' },
    ],

    sidebar: {
      '/guide/': [
        { text: '指南', items: [
          { text: '快速开始', link: '/guide/getting-started' },
          { text: '项目架构', link: '/guide/architecture' },
        ]},
      ],
      '/tools/': [
        {
          text: '工具文档',
          items: [
            { text: '单位换算', link: '/tools/unit-converters' },
            { text: '时间日期', link: '/tools/time-tools' },
            { text: '文本处理', link: '/tools/text-tools' },
            { text: '开发工具', link: '/tools/dev-tools' },
            { text: '小游戏', link: '/tools/game-tools' },
          ]
        }
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/zyssnh/toolbox' }
    ],

    footer: {
      message: '基于 Vite + React + TypeScript 构建',
      copyright: 'MIT Licensed'
    },

    outline: {
      level: [2, 3],
      label: '本页目录',
    },

    docFooter: {
      prev: '上一页',
      next: '下一页',
    },

    lastUpdated: {
      text: '最后更新于',
    },

    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索文档' },
          modal: { noResultsText: '无结果', displayDetails: '显示详情' }
        }
      }
    },
  },
})
