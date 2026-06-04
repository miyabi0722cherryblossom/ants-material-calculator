/* =========================================================
   素材計算機 計算処理
   やること：
   1. 入力欄から数字を受け取る
   2. 入力が正しいかチェックする（おかしければエラー表示）
   3. 不足素材・到達日数・到達予定日を計算する
   4. 結果を画面に表示する
   ========================================================= */

/* ----- 画面の各パーツを変数に取っておく（毎回探さなくて済むように） ----- */
const requiredInput = document.getElementById("required"); // 必要素材
const ownedInput    = document.getElementById("owned");    // 所持素材
const perdayInput   = document.getElementById("perday");   // 1日の獲得量
const calcButton    = document.getElementById("calcButton"); // 計算ボタン
const errorMessage  = document.getElementById("errorMessage"); // エラー表示欄
const resultSection = document.getElementById("result");     // 結果カード全体
const resultBody    = document.getElementById("resultBody");  // 結果の中身

/* ----- 「計算する」ボタンが押されたら calculate を実行する ----- */
calcButton.addEventListener("click", calculate);


/* =========================================================
   メインの計算関数
   ========================================================= */
function calculate() {
  // 前回のエラー表示をいったん消す
  errorMessage.textContent = "";

  // 入力欄の文字を「数値」に変換する
  // ※ 空っぽや文字が入っていると NaN（数字じゃない）になります
  const required = Number(requiredInput.value);
  const owned    = Number(ownedInput.value);
  const perday   = Number(perdayInput.value);

  // ----- 入力チェック（バリデーション） -----
  // 1つでもおかしければエラーを出して、計算をストップします
  const errorText = validate(required, owned, perday);
  if (errorText !== "") {
    showError(errorText);
    return; // ここで処理を中断
  }

  // ----- 不足している素材の量を計算 -----
  const shortage = required - owned;

  // ----- 不足が0以下なら「足りている」 -----
  if (shortage <= 0) {
    showEnough();
    return;
  }

  // ----- 不足がある場合、到達日数を計算 -----
  // 「÷」の結果に小数が出たら切り上げる（Math.ceil）
  // 例：750 ÷ 100 = 7.5 → 8日
  const days = Math.ceil(shortage / perday);

  // ----- 到達予定日を計算（今日 ＋ 到達日数） -----
  const targetDate = addDays(new Date(), days);

  // ----- 結果を画面に表示 -----
  showResult(shortage, days, targetDate);
}


/* =========================================================
   入力チェック
   問題があればエラー文を、問題なければ空文字 "" を返す
   ========================================================= */
function validate(required, owned, perday) {
  // 未入力 or 数字じゃない場合（NaN）
  if (isNaN(required) || isNaN(owned) || isNaN(perday)) {
    return "3つの項目すべてに数字を入力してください。";
  }

  // 必要素材は1以上であること
  if (required <= 0) {
    return "「必要な素材の量」は1以上で入力してください。";
  }

  // 所持素材はマイナス禁止（0はOK）
  if (owned < 0) {
    return "「今持っている素材の量」は0以上で入力してください。";
  }

  // 1日の獲得量は1以上であること（0だと永遠に貯まらないため）
  if (perday <= 0) {
    return "「1日に手に入る量」は1以上で入力してください。";
  }

  // すべて問題なし
  return "";
}


/* =========================================================
   表示まわりの関数たち
   ========================================================= */

/* エラーメッセージを表示し、結果カードは隠す */
function showError(text) {
  errorMessage.textContent = text;
  resultSection.hidden = true;
}

/* 「素材は足りています」を表示 */
function showEnough() {
  resultBody.innerHTML = `
    <div class="success-message">
      <p class="big">🎉 素材は足りています！</p>
      <p class="sub">必要な分はすでに集まっています。</p>
    </div>
  `;
  resultSection.hidden = false;
}

/* 不足・到達日数・到達予定日を表示 */
function showResult(shortage, days, targetDate) {
  resultBody.innerHTML = `
    <div class="result-row">
      <span class="result-label">不足している素材</span>
      <span class="result-value">${formatNumber(shortage)}</span>
    </div>
    <div class="result-row">
      <span class="result-label">到達までの日数</span>
      <span class="result-value highlight">${days}日</span>
    </div>
    <div class="result-row">
      <span class="result-label">到達予定日</span>
      <span class="result-value">${formatDate(targetDate)}</span>
    </div>
  `;
  resultSection.hidden = false;
}


/* =========================================================
   小さな便利関数（ヘルパー）
   ========================================================= */

/* 日付に日数を足した、新しい日付を返す */
function addDays(date, days) {
  const result = new Date(date);     // 元の日付をコピー（元を壊さない）
  result.setDate(result.getDate() + days); // 日にちを足す
  return result;
}

/* 日付を「2025年6月12日（木）」の形に整える */
function formatDate(date) {
  const week = ["日", "月", "火", "水", "木", "金", "土"];
  const y = date.getFullYear();
  const m = date.getMonth() + 1; // 月は0から始まるので+1する
  const d = date.getDate();
  const w = week[date.getDay()];
  return `${y}年${m}月${d}日（${w}）`;
}

/* 数字に3桁ごとのカンマを付ける（例：1000 → 1,000） */
function formatNumber(num) {
  return num.toLocaleString("ja-JP");
}
