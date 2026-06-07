/* =============================================================
   シーズン果物ショップ シミュレーター（ゲームUIスタイル）
   ============================================================= */

/* スクリーンショットの実際の価格・数量・交換回数を使用 */
const ITEMS = [
  { id: 1, emoji: "🔮", name: "バイオエッセンス",         qty:   1, maxEx: 4,  price:  4000 },
  { id: 2, emoji: "🧬", name: "上級変異素材チェスト",     qty:  20, maxEx: 1,  price: 10000 },
  { id: 3, emoji: "🐚", name: "異種の殻",                 qty: 100, maxEx: 1,  price: 10000 },
  { id: 4, emoji: "🥚", name: "橙色の昆虫の卵",           qty: 200, maxEx: 5,  price:  2000 },
  { id: 5, emoji: "💧", name: "月光エッセンス",           qty: 200, maxEx: 2,  price: 10000 },
  { id: 6, emoji: "💎", name: "強化樹脂",                 qty:   1, maxEx: 10, price:  1000 },
  { id: 7, emoji: "🌕", name: "異種花蜜",                 qty:  15, maxEx: 1,  price: 20000 },
  { id: 8, emoji: "⭐", name: "シーズンエッグ",           qty:   1, maxEx: 1,  price:  2500 },
  { id: 9, emoji: "🪨", name: "宝の粘土",                 qty:  40, maxEx: 4,  price:  5000 },
];

/* ----- 状態 ----- */
let totalFruits = Number(document.getElementById("fruitsInput").value) || 0;
const purchased = {}; // { id: 購入回数 }

/* ----- 起動 ----- */
document.getElementById("fruitsInput").addEventListener("input", onFruitsChange);
renderGrid();
updateHeader();

/* =====================================================
   果物数の入力変更
   ===================================================== */
function onFruitsChange() {
  totalFruits = Math.max(0, Number(document.getElementById("fruitsInput").value) || 0);
  updateHeader();
  updateAllCards();
}

/* =====================================================
   グリッドの初期描画
   ===================================================== */
function renderGrid() {
  const grid = document.getElementById("shopGrid");
  grid.innerHTML = "";
  ITEMS.forEach(item => grid.appendChild(createCard(item)));
}

function createCard(item) {
  const card = document.createElement("div");
  card.className = "item-card";
  card.dataset.id = item.id;

  card.innerHTML = `
    <div class="card-image">
      <span class="item-emoji">${item.emoji}</span>
      <span class="qty-badge">×${item.qty.toLocaleString("ja-JP")}</span>
    </div>
    <div class="card-body">
      <p class="item-name">${item.name}</p>
      <p class="exchanges" id="ex-${item.id}">
        残り交換回数：<span class="ex-count">${item.maxEx}</span>
      </p>
      <button class="buy-btn" id="btn-${item.id}" type="button">
        <span class="btn-fruit">🍊</span>
        <span class="btn-price">${item.price.toLocaleString("ja-JP")}</span>
      </button>
    </div>
  `;

  card.querySelector(`#btn-${item.id}`).addEventListener("click", () => buyItem(item.id));
  return card;
}

/* =====================================================
   購入処理
   ===================================================== */
function buyItem(id) {
  const item = ITEMS.find(i => i.id === id);
  if (!item) return;

  const bought = purchased[id] || 0;
  const remaining = item.maxEx - bought;
  const spent = calcSpent();
  const left = totalFruits - spent;

  if (remaining <= 0 || left < item.price) return;

  purchased[id] = bought + 1;
  updateHeader();
  updateCard(item);
}

/* =====================================================
   カード状態の更新
   ===================================================== */
function updateCard(item) {
  const card = document.querySelector(`.item-card[data-id="${item.id}"]`);
  if (!card) return;

  const bought   = purchased[item.id] || 0;
  const remaining = item.maxEx - bought;
  const spent    = calcSpent();
  const left     = totalFruits - spent;

  /* 残り交換回数の更新 */
  const exEl = document.getElementById(`ex-${item.id}`);
  exEl.innerHTML = `残り交換回数：<span class="ex-count">${remaining}</span>`;
  exEl.className = "exchanges" + (remaining === 1 && remaining > 0 ? " low" : "");

  /* ボタンの有効・無効 */
  const btn = document.getElementById(`btn-${item.id}`);
  btn.disabled = remaining <= 0 || left < item.price;

  /* 売り切れオーバーレイ */
  card.classList.toggle("sold-out", remaining <= 0);
}

function updateAllCards() {
  ITEMS.forEach(item => updateCard(item));
}

/* =====================================================
   ヘッダーの使用済み・残り更新
   ===================================================== */
function updateHeader() {
  const spent = calcSpent();
  const left  = totalFruits - spent;

  document.getElementById("spentTotal").textContent = spent.toLocaleString("ja-JP");
  document.getElementById("fruitsLeft").textContent = Math.max(0, left).toLocaleString("ja-JP");

  updateAllCards();
}

function calcSpent() {
  return ITEMS.reduce((sum, item) => sum + item.price * (purchased[item.id] || 0), 0);
}
