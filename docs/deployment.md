# GitHub Pages 发布

项目名称保持 `briefly-english`，产品名称为 Briefly。

- 代码仓库：https://github.com/xindoucha/briefly-english
- GitHub Pages 默认地址：https://xindoucha.github.io/briefly-english/
- 自定义域名：https://briefly-english.xindoucha.com/

## 发布流程

推送到 `main` 后，`.github/workflows/pages.yml` 自动执行：

1. 使用 Node.js 24 运行测试。
2. 从 `media-v1` Release 下载媒体包并校验固定 SHA-256，验证课程片段时间。
3. 将网页与全部 18 个 MP4/MP3 文件构建到 `dist/`。
4. 上传 Pages 构建产物。
5. 使用 `github-pages` 环境部署。

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
- 工作流 [40063982959](https://github.com/xindoucha/briefly-english/actions/runs/40063982959) 的 build、deploy 均已成功。
- GoDaddy 已保存 `briefly-english → xindoucha.github.io`；Google、Cloudflare 与权威 DNS 查询均已返回该记录。
- DNS 生效后按 GitHub 文档重新绑定过一次域名以触发 HTTPS 证书签发。当前正在验证证书与边缘缓存；未通过正常 HTTPS 验证前，不宣称安全上线完成。

## 第一期开源媒体部署

媒体备份：`https://github.com/xindoucha/briefly-english/releases/tag/media-v1`。附件 `first-briefing-media-v1.tar` 为已验证的转码成品，不包含原始 443 MB 母版。媒体包 SHA-256：`461355159c730f9577017d11b9e0d56849efe546e898f17ff793b92d7a03972b`。

`scripts/fetch-deploy-media.mjs` 会在下载失败、摘要不符、缺少媒体文件或字幕时间与媒体清单不一致时停止发布。发布时使用 `npm run build -- --with-media`。Pull request 只检查代码，不下载整套媒体。

媒体通过一次性独立分支传输，再由 GitHub Actions 保存为 Release；发布确认后删除临时上传分支。main 不包含媒体二进制。所有播放器地址保持 `/media/first-briefing/`，访问者不需要连接 YouTube。

当前第一期完整站点约 250 MiB，低于 Pages 1 GB 上限。Pages 月带宽有软限制，扩展多期或流量增长时可将媒体迁移到对象存储/CDN，仅修改 mediaRoot；不应无限累积整期视频。
