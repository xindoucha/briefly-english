# GitHub Pages 发布

项目名称保持 `briefly-english`，产品名称为 Briefly。

- 代码仓库：https://github.com/xindoucha/briefly-english
- GitHub Pages 默认地址：https://xindoucha.github.io/briefly-english/
- 自定义域名：https://briefly-english.xindoucha.com/

## 发布流程

推送到 `main` 后，`.github/workflows/pages.yml` 自动执行：

1. 使用 Node.js 24 运行测试。
2. 构建静态资源到 `dist/`。
3. 上传 Pages 构建产物。
4. 使用 `github-pages` 环境部署。

Pull request 只运行检查和构建，不公开部署。没有第三方依赖，不需要安装步骤或额外的部署密钥。

## 域名配置

仓库 Settings → Pages 选择 GitHub Actions，Custom domain 设为 `briefly-english.xindoucha.com`。

GoDaddy DNS 添加单条记录：

| 类型 | 名称 | 指向 |
| --- | --- | --- |
| CNAME | briefly-english | xindoucha.github.io |

保留主域名和其他子域名的现有记录。GitHub 域名保存后再配置 DNS；DNS 生效后等待 GitHub 证书签发，并开启 Enforce HTTPS。

`CNAME` 和 `.nojekyll` 会复制到静态构建目录。GitHub Actions 发布时，自定义域名以仓库 Pages 设置为准，不能只靠 `CNAME` 文件启用。

## 验证与后续维护

检查 Actions 的 build 和 deploy 均成功；域名 DNS 指向 `xindoucha.github.io`；通过正常 HTTPS 验证访问首页、课程页和静态资源。不得绕过证书警告来宣称发布成功。

默认 Pages 地址会在自定义域名生效后跳转至自定义域名。应用使用相对资源路径和 hash 路由，同时兼容仓库路径与域名根路径。

从 localhost 切换到线上属于不同浏览器来源，本机保存的进度、收藏和录音不会自动迁移。线上录音依赖有效 HTTPS 和用户麦克风许可。

## 本轮操作记录

- 已创建公开仓库，首个代码提交为 `4e2ec9d`。
- 首次发布的测试和构建通过；Configure Pages 因当时 Pages 尚未启用而失败。
- 已在仓库设置启用 GitHub Actions 发布，并保存项目自定义域名。
- DNS 与证书的最终验证结果将在确认后记录，不能将待生效状态视为已上线。
