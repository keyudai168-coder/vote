# ECER27扫码投票系统（学生投票页 + 老师后台页）

这个版本适合你要的效果：

- 学生扫码进入投票页；
- 页面不标注正确答案；
- 学生选择A/B/C后提交；
- 老师在后台页实时看到票数和百分比；
- 后台可以生成二维码、复制投票链接、清空本次投票。

## 文件说明

- `vote.html`：学生投票页
- `admin.html`：老师后台页
- `index.html`：默认跳转到后台页
- `firebase-config.js`：填写Firebase配置
- `poll.js`：投票逻辑，不需要改

## 你需要先做一次Firebase配置

因为“学生扫码各自投票，老师后台实时汇总”必须有一个在线数据库。这个包使用Firebase Realtime Database。

### 第1步：创建Firebase项目

1. 打开Firebase控制台。
2. 新建项目。
3. 在项目里创建一个Web App。
4. 复制它给你的Firebase配置。

### 第2步：创建Realtime Database

1. 在Firebase项目里找到Realtime Database。
2. 创建数据库。
3. 为了课堂临时演示，可以先使用测试规则或下面这组规则：

```json
{
  "rules": {
    "ecer27Poll": {
      ".read": true,
      ".write": true
    }
  }
}
```

注意：这组规则适合课堂临时演示，投票结束后建议关闭数据库或改回更严格规则。

### 第3步：填写配置

打开`firebase-config.js`，把里面这些占位内容替换成Firebase控制台给你的配置：

```js
window.FIREBASE_CONFIG = {
  apiKey: "...",
  authDomain: "...",
  databaseURL: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

如果一节课想重新开始，可以把：

```js
sessionId: "ecer27-class-vote"
```

改成新的名字，比如：

```js
sessionId: "ecer27-0520"
```

## 上传到哪里

这是静态网页，配置好后可以上传到任意静态网页平台，例如GitHub Pages、Netlify、Vercel、Cloudflare Pages，也可以发给会部署网页的同学帮你上传。

上传后打开：

```text
https://你的网址/admin.html
```

这就是老师后台页。后台页会自动生成学生扫码投票二维码。

## 课堂使用

1. 老师打开`admin.html`并投屏。
2. 同学扫码进入`vote.html`。
3. 同学选择A/B/C。
4. 老师后台自动显示百分比。
5. 需要重新来一轮时，点击“清空本次投票”，默认口令是`123456`。

## 不想让学生看到结果

默认配置是：

```js
showResultsToVoters: false
```

学生投票后不会看到百分比，只有老师后台能看到。
