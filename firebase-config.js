// 把这里替换成你自己的 Firebase Web App 配置。
// Firebase 控制台 → Project settings → Your apps → Web app → SDK setup and configuration。
window.FIREBASE_CONFIG = {
  apiKey: "替换为你的apiKey",
  authDomain: "替换为你的项目.firebaseapp.com",
  databaseURL: "https://替换为你的项目-default-rtdb.firebaseio.com",
  projectId: "替换为你的项目ID",
  storageBucket: "替换为你的项目.appspot.com",
  messagingSenderId: "替换为你的messagingSenderId",
  appId: "替换为你的appId"
};

// 可按需修改。
// sessionId：每次课堂可以换一个，比如 ecer27-0520，避免旧投票混在一起。
// adminResetCode：老师后台清空投票时需要输入的口令；只是防误触，不是严格安全密码。
// showResultsToVoters：false 表示学生投票后不显示百分比，只在老师后台看结果。
window.POLL_SETTINGS = {
  sessionId: "ecer27-class-vote",
  adminResetCode: "123456",
  showResultsToVoters: false
};
