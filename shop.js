/* =============================================================
   シーズンショップシミュレーター
   機能：
   - 所持シーズンポイントを入力
   - アイテムをカートに入れる
   - 各アイテムの購入可能数を表示
   - 合計がポイントを超えたら警告
   ============================================================= */

/* ----- デフォルトアイテム一覧 ----- */
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
  { id: 12, emoji: "🍚", name: "砂糖 ×50,000",      price: 100, category: "素材" },
  { id: 13, emoji: "🥩", name: "タンパク質 ×50,000", price: 100, category: "素材" },
  { id: 14, emoji: "🌿", name: "植物繊維 ×50,000",   price: 100, category: "素材" },
  { id: 15, emoji: "🟤", name: "土 ×50,000",         price:  80, category: "素材" },
  // アイテム
  { id: 16, emoji: "📚", name: "女王の書物",     price: 500, category: "アイテム" },
  { id: 17, emoji: "💎", name: "アントジェム ×5", price: 200, category: "アイテム" },
  { id: 18, emoji: "🎁", name: "シーズン宝箱",   price: 300, category: "アイテム" },
];

/* ----- 状態管理 ----- */
let budget = 0;
const cart = {}; // { itemId: quantity }

/* ----- 起動時の処理 ----- */
document.getElementById("budget").addEventListener("input", onBudgetChange);
renderItems();

/* ポイント入力が変わったとき */
function onBudgetChange() {
  budget = Math.max(0, Number(document.getElementById("budget").value) || 0);
  updateAffordable();
  renderCart();
}

/* =============================================================
   アイテム一覧の描画
   ============================================================= */
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
  infoDiv.innerHTML = `
    <span class="item-emoji">${item.emoji}</span>
    <span class="item-name">${item.name}</span>
  `;

  /* 右：価格・購入可能数・ボタン */
  const actionsDiv = document.createElement("div");
  actionsDiv.className = "item-actions";

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
    updateAffordable();
    renderCart();
  });

  const ptLabel = document.createElement("span");
  ptLabel.className = "price-unit";
  ptLabel.textContent = "pt";

  priceWrap.appendChild(priceInput);
  priceWrap.appendChild(ptLabel);

  /* 購入可能数 */
  const affordable = document.createElement("span");
  affordable.className = "item-affordable";
  affordable.id = `affordable-${item.id}`;

  /* カートへボタン */
  const addBtn = document.createElement("button");
  addBtn.className = "add-btn";
  addBtn.type = "button";
  addBtn.textContent = "カートへ";
  addBtn.addEventListener("click", () => addToCart(item.id));

  actionsDiv.appendChild(priceWrap);
  actionsDiv.appendChild(affordable);
  actionsDiv.appendChild(addBtn);

  row.appendChild(infoDiv);
  row.appendChild(actionsDiv);
  return row;
}

/* 購入可能数の表示を更新 */
function updateAffordable() {
  ITEMS.forEach(item => {
    const el = document.getElementById(`affordable-${item.id}`);
    if (!el) return;
    if (budget > 0) {
      const count = Math.floor(budget / item.price);
      el.textContent = `${count.toLocaleString("ja-JP")}個まで`;
    } else {
      el.textContent = "";
    }
  });
}

/* =============================================================
   カート操作
   ============================================================= */
function addToCart(itemId) {
  cart[itemId] = (cart[itemId] || 0) + 1;
  renderCart();
}

function removeOneFromCart(itemId) {
  if (!cart[itemId]) return;
  if (cart[itemId] > 1) {
    cart[itemId]--;
  } else {
    delete cart[itemId];
  }
  renderCart();
}

/* =============================================================
   カートの描画
   ============================================================= */
function renderCart() {
  const cartSection = document.getElementById("cartSection");
  const itemIds = Object.keys(cart).map(Number);

  if (itemIds.length === 0) {
    cartSection.hidden = true;
    return;
  }

  cartSection.hidden = false;

  /* カート内アイテムの描画 */
  const cartItemsEl = document.getElementById("cartItems");
  cartItemsEl.innerHTML = "";
  let total = 0;

  itemIds.forEach(id => {
    const item = ITEMS.find(i => i.id === id);
    if (!item) return;

    const qty = cart[id];
    const subtotal = item.price * qty;
    total += subtotal;

    const row = document.createElement("div");
    row.className = "cart-row";
    row.innerHTML = `
      <div class="cart-item-info">
        <span class="cart-item-name">${item.emoji} ${item.name}</span>
        <span class="cart-item-price">${item.price.toLocaleString("ja-JP")} pt × ${qty}個</span>
      </div>
      <div class="cart-item-right">
        <span class="cart-subtotal">${subtotal.toLocaleString("ja-JP")} pt</span>
        <div class="qty-buttons">
          <button class="qty-btn remove-btn" type="button" aria-label="1個減らす">−</button>
          <span class="qty-num">${qty}</span>
          <button class="qty-btn add-btn-sm" type="button" aria-label="1個増やす">＋</button>
        </div>
      </div>
    `;

    row.querySelector(".remove-btn").addEventListener("click", () => removeOneFromCart(id));
    row.querySelector(".add-btn-sm").addEventListener("click", () => addToCart(id));
    cartItemsEl.appendChild(row);
  });

  /* サマリーの描画 */
  const remaining = budget - total;
  const isOver = budget > 0 && remaining < 0;
  const summaryEl = document.getElementById("cartSummary");

  let summaryHTML = `
    <div class="summary-row">
      <span class="summary-label">合計</span>
      <span class="summary-total ${isOver ? "over" : ""}">${total.toLocaleString("ja-JP")} pt</span>
    </div>
  `;

  if (budget > 0) {
    summaryHTML += `
      <div class="summary-row">
        <span class="summary-label">${isOver ? "超過" : "残りポイント"}</span>
        <span class="${isOver ? "over-amount" : "remain-amount"}">${Math.abs(remaining).toLocaleString("ja-JP")} pt</span>
      </div>
    `;
    if (isOver) {
      summaryHTML += `<p class="budget-warning">⚠️ 予算を超えています！</p>`;
    }
  }

  summaryEl.innerHTML = summaryHTML;
}
