# 本地媒体与随身听

媒体不加入 main 的代码历史。线上发布使用 GitHub Release 保存媒体包，Actions 校验 SHA-256 后将媒体一并部署到 Pages。

## 来源

- 制作主体：The White House。
- 记者会日期：2025-01-28。
- 原文件与许可记录：https://commons.wikimedia.org/wiki/File:Press_Secretary_Karoline_Leavitt_Briefs_Members_of_the_Media,_Jan._28,_2025.webm
- 获取日期：2026-10-24。文件页标注为美国联邦政府公有领域作品；并非本站对全球所有地区权利状况的担保。
- 保留官方来源链接；独立学习网站，不表示白宫背书。

## 文件与重建

原始母版：`media-source/first-briefing.webm`，不会通过本地开发服务器提供。

安装好的 FFmpeg 用于转码。运行：

```sh
npm run media:download
npm run media:prepare
npm run media:verify
```

下载使用 curl 支持断点续传，校验固定文件大小和 MD5。若源站返回 Retry-After，停止并按要求等待后再运行；如网络需代理，可通过 HTTPS_PROXY 环境变量配置。

生成在 `media/first-briefing/`：

- `full-720p.mp4`：720p，H.264 / AAC，faststart。
- `full-audio.mp3`：96 kbps MP3，响度目标 -18 LUFS，保留时长与语速。
- `clips/{segment-id}.mp4`、`.mp3`：按课程数据精确裁切，片段从零开始。
- `manifest.json`：生成日期、来源、裁切时间。

播放适配器将片段的相对时间映射回原片时间，字幕、逐句跟读和录音对比沿用既有时间轴。切换独立音频时保留播放位置和语速。

## 本地开发与打包

`npm start` 后访问 http://127.0.0.1:4173/ 。服务器以流式返回媒体，支持 Range/206、HEAD 和正确的 MP4/MP3 MIME 类型。

`npm run build -- --with-media` 可打包完整本地版本；默认 build 不复制大文件。媒体与母版都被 Git 忽略。

当前第一期直接通过 Pages 同域提供媒体。后续扩展可将生成文件上传对象存储/CDN，修改 `source.mediaRoot` 指向媒体域名，并配置 HTTPS、Range 和必要的 CORS。不能只发布网页而遗漏媒体文件。

## 随身听

课程页提供完整音频、下载 MP3、前后 15 秒、倍速及本机播放位置记忆。支持 Media Session 的浏览器还接入系统播放/暂停/快进控制与课程标题；不支持的浏览器继续使用原生音频控件。下载后可在支持本地音频的 App 中收听。尚无 RSS 订阅；手机锁屏和后台播放依实际浏览器支持。

验证命令：`npm test`（播放器时间映射与 HTTP Range 测试）；`npm run media:verify`（18 个文件的时长、编码与视频尺寸）；`npm run build -- --with-media`（包含本地媒体的静态包）。

## 2026-10-24 本轮验收结果

- 原片下载完成：464,139,447 字节，MD5 `199bc47f5b97d8ee2eb22654c3e9163e`，与源文件 ETag 一致。
- 整期视频：209.48 MiB、2814.01 秒；整期 MP3：32.20 MiB、2814 秒。
- 8 个片段各生成 MP4 和 MP3，连同整期共 18 个文件，时长、编码、720p 尺寸全部通过校验。
- 19 项自动测试通过；含媒体构建完成。MP3 下载 HTTP 200，指定字节请求 HTTP 206。
- 浏览器验证：开场播放、独立音频切换、字幕定位、单句循环、后半场片段定位、整期视频元数据、音频倍速和 15 秒跳转；390px 布局无横向溢出。
- 原始 Opus 流转码时出现包头解析警告，但原片校验和一致；生成的整期 MP3 与 MP4 音轨完整解码检查未报错。未逐分钟人工复听全部原声，也未进行手机真机后台播放验收。
- 后续发布使用 Release 媒体备份与 Pages 同域托管，部署记录见 deployment.md。
