// ----------------------------
// Anugraha Collections (GitHub Pages)
// Permanent products loaded from products.json
// Folders supported: images/Women, images/Men, images/Kids, images/Girl, images/Boy
// ----------------------------

/**
 * Keys MUST match your folder names + products.json keys exactly (case-sensitive on GitHub).
 */
const CATEGORY_KEYS = ["Women", "Men", "Kids", "Girl", "Boy"];

// Footer year
const YEAR_EL = document.getElementById("year");
if (YEAR_EL) YEAR_EL.textContent = new Date().getFullYear();

// ----------------------------
// Lightbox (Zoom)
// ----------------------------
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxName = document.getElementById("lightboxName");
const lightboxPrice = document.getElementById("lightboxPrice");
const lightboxClose = document.getElementById("lightboxClose");
const lightboxBackdrop = document.getElementById("lightboxBackdrop");

function openLightbox(item) {
  if (!lightbox || !item) return;

  lightboxImg.src = item.image || "";
  lightboxImg.alt = item.name ? `Preview of ${item.name}` : "Product preview";
  lightboxName.textContent = item.name || "";
  lightboxPrice.textContent = item.price || "";

  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  if (!lightbox) return;

  lightbox.setAttribute("aria-hidden", "true");
  lightboxImg.src = "";
  lightboxImg.alt = "Product preview";
  document.body.style.overflow = "";
}

if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
if (lightboxBackdrop) lightboxBackdrop.addEventListener("click", closeLightbox);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeLightbox();
});

// ----------------------------
// Small helpers
// ----------------------------
function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatMoney(value) {
  // If you already store "$29.99" in JSON, we keep it.
  // If you store "29.99" or 29.99, we auto format with $.
  if (value === undefined || value === null) return "";
  const s = String(value).trim();
  if (!s) return "";
  if (s.startsWith("$")) return s;
  const num = Number(s);
  if (!Number.isNaN(num)) return `$${num.toFixed(2)}`;
  return s;
}

// ----------------------------
// Rendering products
// ----------------------------
function renderCategory(categoryKey, items) {
  const grid = document.querySelector(`[data-products="${categoryKey}"]`);
  if (!grid) return;

  if (!Array.isArray(items) || items.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        No products yet for <b>${escapeHtml(categoryKey)}</b>.<br/>
        Add images to <b>images/${escapeHtml(categoryKey)}/</b> and update <b>products.json</b>.
      </div>
    `;
    return;
  }

  grid.innerHTML = items
    .map((p, idx) => {
      const name = escapeHtml(p.name || "Branded Surplus Item");
      const price = escapeHtml(formatMoney(p.price || ""));
      const img = escapeHtml(p.image || "");
      const badge = escapeHtml(p.badge || "Surplus Deal");

      return `
        <article class="product-card" data-cat="${escapeHtml(categoryKey)}" data-idx="${idx}">
          <div class="product-img-wrap">
            <img class="product-img" src="${img}" alt="${name}" loading="lazy" />
            <div class="zoom-hint">Click to zoom</div>
          </div>
          <div class="product-info">
            <div class="product-name">${name}</div>
            <div class="product-price">${price}</div>
            <div class="product-badge">${badge}</div>
            <button class="product-btn" type="button">Add to Cart</button>
          </div>
        </article>
      `;
    })
    .join("");

  // Zoom click (card click except button)
  grid.querySelectorAll(".product-card").forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target && e.target.classList.contains("product-btn")) return;

      const cat = card.getAttribute("data-cat");
      const idx = Number(card.getAttribute("data-idx"));
      const item = window.__PRODUCTS__?.[cat]?.[idx];
      if (!item) return;

      openLightbox({
        image: item.image,
        name: item.name,
        price: formatMoney(item.price),
      });
    });
  });

  // Demo cart button (simple UI feedback)
  grid.querySelectorAll(".product-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const original = btn.textContent;
      btn.textContent = "Added ✓";
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = original;
        btn.disabled = false;
      }, 1100);
    });
  });
}

// ----------------------------
// Load products.json (GitHub Pages)
// ----------------------------
async function loadProducts() {
  const res = await fetch("products.json", { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Could not load products.json (${res.status}). Ensure it is in your repo root.`);
  }
  return res.json();
}

function renderLoadError(err) {
  console.error(err);
  document.querySelectorAll("[data-products]").forEach((grid) => {
    grid.innerHTML = `
      <div class="empty-state">
        <b>Oops:</b> Could not load <b>products.json</b>.<br/>
        1) Confirm <b>products.json</b> is in the repo root<br/>
        2) Confirm GitHub Pages is enabled<br/>
        3) Confirm paths match exactly (case-sensitive)
      </div>
    `;
  });
}

// ----------------------------
// Init
// ----------------------------
(async function init() {
  try {
    const data = await loadProducts();
    window.__PRODUCTS__ = data;

    // Render all categories we support
    CATEGORY_KEYS.forEach((key) => renderCategory(key, data[key]));
  } catch (err) {
    renderLoadError(err);
  }
})();


