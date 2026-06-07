/* =============================================================
   シーズンショップシミュレーター
   - ＋/－ボタンで各アイテムの数量を調整
   - 合計・残りポイントを画面下部に常時表示
   - 予算超過で警告
   ============================================================= */

const ITEMS = [
  // スピードアップ
  { id:  1, emoji: "⚡", name: "建設高速化 1分",   price:  10, category: "スピードアップ" },
  { id:  2, emoji: "⚡", name: "建設高速化 10分",  price:  45, category: "スピードアップ" },
  { id:  3, emoji: "⚡", name: "建設高速化 1時間", price: 200, category: "スピードアップ" },
  { id:  4, emoji: "⚡", name: "建設高速化 8時間", price: 1200, category: "スピードアップ" },
  { id:  5, emoji: "🔬", name: "研究高速化 1分",   price:  10, category: "スピードアップ" },
  { id:  6, emoji: "🔬", name: "研究高速化 10分",  price:  45, category: "スピードアップ" },
  { id:  7, emoji: "🔬", name: "研究高速化 1時間", price: 200, category: "スピードアップ" },
  { id:  8, emoji: "💊", name: "治療高速化 1分",   price:  10, category: "スピードアップ" },
  { id:  9, emoji: "💊", name: "治療高速化 10分",  price:  45, category: "スピードアップ" },
  { id: 10, emoji: "⚔️", name: "訓練高速化 1分",   price:  10, category: "スピードアップ" },
  { id: 11, emoji: "⚔️", name: "訓練高速化 10分",  price:  45, category: "スピードアップ" },
  // 素材
  { id: 12, emoji: "🍚", name: "砂糖 ×50,000",       price: 100, category: "素材" },
  { id: 13, emoji: "🥩", name: "タンパク質 ×50,000",  price: 100, category: "素材" },
  { id: 14, emoji: "🌿", name: "植物繊維 ×50,000",    price: 100, category: "素材" },
  { id: 15, emoji: "🟤", name: "土 ×50,000",          price:  80, category: "素材" },
  // アイテム
  { id: 16, emoji: "📚", name: "女王の書物",      price: 500, category: "アイテム" },
  { id: 17, emoji: "💎", name: "アントジェム ×5",  price: 200, category: "アイテム" },
  { id: 18, emoji: "🎁", name: "シーズン宝箱",    price: 300, category: "アイテム" },
];

/* ----- 状態管理 ----- */
const quantities = {}; // { itemId: number }
let budget = 0;

/* ----- 起動 ----- */
document.getElementById("budget").addEventListener("input", onBudgetChange);
renderItems();
updateSummary();

/* =====================================================
   予算入力
   ===================================================== */
function onBudgetChange() {
  budget = Math.max(0, Number(document.getElementById("budget").value) || 0);
  updateSummary();
}

/* =====================================================
   アイテム一覧の描画
   ===================================================== */
function renderItems() {
  const categories = [...new Set(ITEMS.map(i => i.category))];
  const container = document.getElementById("itemList");
  container.innerHTML = "";

  categories.forEach(category => {
    const section = document.createElement("div");
    section.className = "item-category";

    const label = document.createElement("p");
    label.className = "category-label";
    label.textContent = category;
    section.appendChild(label);

    ITEMS.filter(i => i.category === category).forEach(item => {
      section.appendChild(createItemRow(item));
    });

    container.appendChild(section);
  });
}

function createItemRow(item) {
  const row = document.createElement("div");
  row.className = "item-row";

  /* 左：絵文字＋名前 */
  const infoDiv = document.createElement("div");
  infoDiv.className = "item-info";
  infoDiv.innerHTML = `<span class="item-emoji">${item.emoji}</span><span class="item-name">${item.name}</span>`;

  /* 右：コントロール群 */
  const controls = document.createElement("div");
  controls.className = "item-controls";

  /* 価格入力 */
  const priceWrap = document.createElement("div");
  priceWrap.className = "price-wrap";

  const priceInput = document.createElement("input");
  priceInput.type = "number";
  priceInput.className = "price-input";
  priceInput.value = item.price;
  priceInput.min = 1;
  priceInput.setAttribute("aria-label", `${item.name}の価格`);
  priceInput.addEventListener("change", () => {
    item.price = Math.max(1, Number(priceInput.value) || 1);
    priceInput.value = item.price;
    refreshSubtotal(item, subtotalEl);
    updateSummary();
  });

  const ptLabel = document.createElement("span");
  ptLabel.className = "price-unit";
  ptLabel.textContent = "pt";

  priceWrap.appendChild(priceInput);
  priceWrap.appendChild(ptLabel);

  /* ＋/－コントロール */
  const qtyControls = document.createElement("div");
  qtyControls.className = "qty-controls";

  const minusBtn = document.createElement("button");
  minusBtn.className = "qty-btn minus-btn";
  minusBtn.type = "button";
  minusBtn.textContent = "−";
  minusBtn.setAttribute("aria-label", "1個減らす");

  const qtyNum = document.createElement("span");
  qtyNum.className = "qty-num";
  qtyNum.textContent = "0";

  const plusBtn = document.createElement("button");
  plusBtn.className = "qty-btn plus-btn";
  plusBtn.type = "button";
  plusBtn.textContent = "＋";
  plusBtn.setAttribute("aria-label", "1個増やす");

  /* 小計表示 */
  const subtotalEl = document.createElement("span");
  subtotalEl.className = "item-subtotal";
  subtotalEl.textContent = "0 pt";

  /* イベント */
  plusBtn.addEventListener("click", () => {
    quantities[item.id] = (quantities[item.id] || 0) + 1;
    qtyNum.textContent = quantities[item.id];
    refreshSubtotal(item, subtotalEl);
    updateSummary();
  });

  minusBtn.addEventListener("click", () => {
    if (!quantities[item.id]) return;
    quantities[item.id]--;
    if (quantities[item.id] === 0) delete quantities[item.id];
    qtyNum.textContent = quantities[item.id] || 0;
    refreshSubtotal(item, subtotalEl);
    updateSummary();
  });

  qtyControls.appendChild(minusBtn);
  qtyControls.appendChild(qtyNum);
  qtyControls.appendChild(plusBtn);

  controls.appendChild(priceWrap);
  controls.appendChild(qtyControls);
  controls.appendChild(subtotalEl);

  row.appendChild(infoDiv);
  row.appendChild(controls);
  return row;
}

/* 小計の表示を更新 */
function refreshSubtotal(item, el) {
  const qty = quantities[item.id] || 0;
  const subtotal = item.price * qty;
  el.textContent = subtotal.toLocaleString("ja-JP") + " pt";
  el.classList.toggle("active", qty > 0);
}

/* =====================================================
   合計バーの更新（常時表示）
   ===================================================== */
function updateSummary() {
  const total = ITEMS.reduce((sum, item) => sum + item.price * (quantities[item.id] || 0), 0);
  const remaining = budget - total;
  const isOver = budget > 0 && remaining < 0;

  /* 合計 */
  const totalEl = document.getElementById("summaryTotal");
  totalEl.textContent = total.toLocaleString("ja-JP") + " pt";
  totalEl.className = "summary-bar-value" + (isOver ? " over" : "");

  /* 残り／超過 */
  const remainCol = document.getElementById("summaryRemainCol");
  if (budget > 0) {
    remainCol.hidden = false;
    document.getElementById("summaryRemainLabel").textContent = isOver ? "超過" : "残り";
    const remainEl = document.getElementById("summaryRemain");
    remainEl.textContent = Math.abs(remaining).toLocaleString("ja-JP") + " pt";
    remainEl.className = "summary-bar-value " + (isOver ? "over" : "remain");
  } else {
    remainCol.hidden = true;
  }

  /* 警告 */
  document.getElementById("overWarning").hidden = !isOver;
}
