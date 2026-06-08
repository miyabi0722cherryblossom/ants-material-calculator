/* =============================================================
   シーズン果物ショップ シミュレーター（ゲームUIスタイル）
   ============================================================= */

const ITEMS = [
  { id: 1, image: "images/item-01.png", name: "No.1",  qty:   1, maxEx:  1, price:  3000 },
  { id: 2, image: "images/item-02.png", name: "No.2",  qty: 500, maxEx: 10, price:   100 },
  { id: 3, image: "images/item-03.png", name: "No.3",  qty:  10, maxEx:  2, price:  1500 },
  { id: 4, image: "images/item-04.png", name: "No.4",  qty:   1, maxEx:  4, price:  4000 },
  { id: 5, image: "images/item-05.png", name: "No.5",  qty:   1, maxEx:  1, price:  3750 },
  { id: 6, image: "images/item-06.png", name: "No.6",  qty:  30, maxEx:  2, price:  1500 },
  { id: 7, image: "images/item-07.png", name: "No.7",  qty: 100, maxEx:  1, price:  1500 },
  { id: 8, image: "images/item-08.png", name: "No.8",  qty:  10, maxEx:  1, price:  1500 },
  { id: 9,  image: "images/item-09.png", name: "No.9",  qty:    20, maxEx:  1, price: 10000 },
  { id: 10, image: "images/item-10.png", name: "No.10", qty:   100, maxEx:  1, price: 10000 },
  { id: 11, image: "images/item-11.png", name: "No.11", qty:   200, maxEx:  5, price:  2000 },
  { id: 12, image: "images/item-12.png", name: "No.12", qty:   200, maxEx:  2, price: 10000 },
  { id: 13, image: "images/item-13.png", name: "No.13", qty:     1, maxEx: 10, price:  1000 },
  { id: 14, image: "images/item-14.png", name: "No.14", qty:    15, maxEx:  1, price: 20000 },
  { id: 15, image: "images/item-15.png", name: "No.15", qty:     1, maxEx:  1, price:  2500 },
  { id: 16, image: "images/item-16.png", name: "No.16", qty:    40, maxEx:  4, price:  5000 },
  { id: 17, image: "images/item-17.png", name: "No.17", qty: 100000, maxEx: 20, price:   200 },
  { id: 18, image: "images/item-18.png", name: "No.18", qty:   100, maxEx:  10, price:  1250 },
  { id: 19, image: "images/item-19.png", name: "No.19", qty:     1, maxEx:  20, price:   125 },
  { id: 20, image: "images/item-20.png", name: "No.20", qty:     1, maxEx: 100, price:   150 },
  { id: 21, image: "images/item-21.png", name: "No.21", qty:     1, maxEx: 500, price:     1 },
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

  // 画像アイテムは <img> で表示（ゲーム画像内に数量が含まれるため自前バッジは出さない）
  // 絵文字アイテムは絵文字＋数量バッジ
  const visual = item.image
    ? `<img class="item-img" src="${item.image}" alt="${item.name}" />`
    : `<span class="item-emoji">${item.emoji}</span>
       <span class="qty-badge">×${item.qty.toLocaleString("ja-JP")}</span>`;

  card.innerHTML = `
    <div class="card-image">
      ${visual}
    </div>
    <div class="card-body">
      <p class="item-name">${item.name}</p>
      <p class="exchanges" id="ex-${item.id}">
        残り交換回数：<span class="ex-count">${item.maxEx}</span>
      </p>
      <div class="price-row">
        <span class="price-fruit">🍊</span>
        <span class="price-num">${item.price.toLocaleString("ja-JP")}</span>
      </div>
      <div class="qty-controls">
        <button class="qty-btn minus-btn" id="minus-${item.id}" type="button">－</button>
        <span class="qty-count" id="count-${item.id}">0</span>
        <button class="qty-btn plus-btn"  id="plus-${item.id}"  type="button">＋</button>
      </div>
    </div>
  `;

  card.querySelector(`#minus-${item.id}`).addEventListener("click", () => decrement(item.id));
  card.querySelector(`#plus-${item.id}`).addEventListener("click",  () => increment(item.id));
  return card;
}

/* =====================================================
   増減処理
   ===================================================== */
function increment(id) {
  const item = ITEMS.find(i => i.id === id);
  if (!item) return;
  const bought = purchased[id] || 0;
  if (bought >= item.maxEx) return;
  if (totalFruits - calcSpent() < item.price) return;
  purchased[id] = bought + 1;
  updateHeader();
  updateCard(item);
}

function decrement(id) {
  const item = ITEMS.find(i => i.id === id);
  if (!item) return;
  if (!purchased[id]) return;
  purchased[id]--;
  if (purchased[id] === 0) delete purchased[id];
  updateHeader();
  updateCard(item);
}

/* =====================================================
   カード状態の更新
   ===================================================== */
function updateCard(item) {
  const card = document.querySelector(`.item-card[data-id="${item.id}"]`);
  if (!card) return;

  const bought    = purchased[item.id] || 0;
  const remaining = item.maxEx - bought;
  const left      = totalFruits - calcSpent();

  /* 残り交換回数 */
  const exEl = document.getElementById(`ex-${item.id}`);
  exEl.innerHTML = `残り交換回数：<span class="ex-count">${remaining}</span>`;
  exEl.className = "exchanges" + (remaining === 1 ? " low" : "");

  /* 購入数カウント */
  document.getElementById(`count-${item.id}`).textContent = bought;

  /* ＋ボタン：残り回数0 or 果物不足で無効 */
  document.getElementById(`plus-${item.id}`).disabled  = remaining <= 0 || left < item.price;
  /* －ボタン：0個なら無効 */
  document.getElementById(`minus-${item.id}`).disabled = bought <= 0;

  /* 売り切れオーバーレイ */
  card.classList.toggle("sold-out", remaining <= 0);
}

function updateAllCards() {
  ITEMS.forEach(item => updateCard(item));
}

/* =====================================================
   ヘッダー更新
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
