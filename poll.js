const OPTIONS = {
  A: "可以，因为产品出口欧洲，就应当符合欧洲相关标准。",
  B: "不可以，因为合同没有写，就完全不能要求。",
  C: "不一定，要看ECER27是否已经通过合同约定、交易习惯或特定用途告知进入合同内容。"
};

let db = null;
let votesRef = null;
let currentMode = "vote";
let currentResults = {counts:{A:0,B:0,C:0}, total:0, percentages:{A:0,B:0,C:0}};

function showToast(text){
  const t = document.getElementById("toast");
  if(!t) return;
  t.textContent = text;
  t.classList.add("show");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(()=>t.classList.remove("show"), 1400);
}

function warn(text){
  const box = document.getElementById("configWarn");
  if(!box) return;
  box.style.display = "block";
  box.innerHTML = text;
}

function isConfigMissing(){
  const cfg = window.FIREBASE_CONFIG || {};
  return !cfg.apiKey || String(cfg.apiKey).includes("替换");
}

function getSessionId(){
  const url = new URL(location.href);
  return url.searchParams.get("session") || (window.POLL_SETTINGS && window.POLL_SETTINGS.sessionId) || "ecer27-class-vote";
}

function voterId(){
  const key = "ecer27_poll_voter_id_" + getSessionId();
  let id = localStorage.getItem(key);
  if(!id){
    id = (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + "_" + Math.random());
    localStorage.setItem(key, id);
  }
  return id;
}

function calcResults(votes){
  const counts = {A:0,B:0,C:0};
  Object.values(votes || {}).forEach(v=>{
    const c = typeof v === "string" ? v : v.choice;
    if(counts[c] !== undefined) counts[c] += 1;
  });
  const total = counts.A + counts.B + counts.C;
  const percentages = {};
  ["A","B","C"].forEach(k=>{
    percentages[k] = total ? Math.round(counts[k] * 1000 / total) / 10 : 0;
  });
  return {counts,total,percentages};
}

function renderResults(results){
  currentResults = results;
  const totalEl = document.getElementById("total");
  const listEl = document.getElementById("resultList");
  if(totalEl) totalEl.textContent = "当前总票数：" + results.total;
  if(!listEl) return;
  listEl.innerHTML = ["A","B","C"].map(k => `
    <div class="result-row">
      <div class="row-head">
        <div>
          <div class="r-label">${k}</div>
          <div class="footer" style="margin-top:4px">${OPTIONS[k]}</div>
        </div>
        <div class="r-percent">${results.percentages[k]}%</div>
      </div>
      <div class="bar"><div class="fill" style="width:${results.percentages[k]}%"></div></div>
      <div class="r-count">${results.counts[k]}票</div>
    </div>
  `).join("");
}

function vote(choice){
  if(!votesRef) {
    showToast("还没有连接数据库");
    return;
  }
  document.querySelectorAll(".option").forEach(el => {
    el.classList.toggle("selected", el.dataset.choice === choice);
  });
  votesRef.child(voterId()).set({
    choice,
    updatedAt: firebase.database.ServerValue.TIMESTAMP
  }).then(()=>{
    showToast("已提交：" + choice);
  }).catch(err=>{
    showToast("提交失败");
    console.error(err);
  });
}

function buildVoteLink(){
  const sessionId = getSessionId();
  const url = new URL("vote.html", location.href);
  url.searchParams.set("session", sessionId);
  return url.toString();
}

function copyVoteLink(){
  const link = buildVoteLink();
  navigator.clipboard.writeText(link).then(()=>showToast("已复制投票链接")).catch(()=>alert(link));
}

function resetVotes(){
  const code = prompt("请输入清空口令：");
  const expected = (window.POLL_SETTINGS && window.POLL_SETTINGS.adminResetCode) || "123456";
  if(code !== expected){
    showToast("口令不正确");
    return;
  }
  if(!confirm("确定清空本次投票吗？")) return;
  votesRef.remove().then(()=>showToast("已清空")).catch(err=>{console.error(err);showToast("清空失败");});
}

function initFirebase(){
  if(isConfigMissing()){
    warn("还没有填写Firebase配置。请打开 <b>firebase-config.js</b>，把里面的占位内容替换成你自己的Firebase Web App配置。");
    return false;
  }
  firebase.initializeApp(window.FIREBASE_CONFIG);
  db = firebase.database();
  const sessionId = getSessionId();
  votesRef = db.ref("ecer27Poll/" + sessionId + "/votes");
  return true;
}

function initPoll(mode){
  currentMode = mode;
  const ok = initFirebase();
  const sessionText = document.getElementById("sessionText");
  if(sessionText) sessionText.textContent = "Session：" + getSessionId();

  if(mode === "admin"){
    const voteLink = buildVoteLink();
    document.getElementById("voteLink").textContent = voteLink;
    document.getElementById("openVote").href = voteLink;
    if(window.QRCode){
      new QRCode(document.getElementById("qrcode"), {
        text: voteLink,
        width: 300,
        height: 300,
        correctLevel: QRCode.CorrectLevel.M
      });
    }
  }

  if(!ok) return;

  votesRef.on("value", snap=>{
    const results = calcResults(snap.val());
    renderResults(results);
    if(mode === "vote" && window.POLL_SETTINGS && window.POLL_SETTINGS.showResultsToVoters){
      const voterResults = document.getElementById("voterResults");
      if(voterResults) voterResults.style.display = "block";
    }
  }, err=>{
    warn("数据库连接失败。请检查Firebase Realtime Database是否已创建，以及安全规则是否允许读写。");
    console.error(err);
  });
}
