// === Select Elements ===
const titleInput = document.getElementById("title");
const priceInput = document.getElementById("price");
const taxesInput = document.getElementById("taxes");
const adsInput = document.getElementById("ads");
const discountInput = document.getElementById("discount");
const totalOutput = document.getElementById("total");
const countInput = document.getElementById("count");
const categoryInput = document.getElementById("category");
const submitBtn = document.getElementById("submit");
const tbody = document.getElementById("tbody");
const searchInput = document.getElementById("search");
const popupContainer = document.createElement("div");
popupContainer.className = "popup-container";
document.body.appendChild(popupContainer);

let products = JSON.parse(localStorage.getItem("products")) || [];
let mode = "create";
let tempIndex = null;
let searchMode = "title";

// === Popup Notification ===
function showPopup(message, type = "success") {
  const popup = document.createElement("div");
  popup.className = `popup ${type}`;
  popup.textContent = message;

  popupContainer.appendChild(popup);
  popup.classList.add("show");

  setTimeout(() => {
    popup.style.opacity = "0";
    setTimeout(() => popup.remove(), 500);
  }, 2000);
}

// === Calculate Total ===
function getTotal() {
  const price = +priceInput.value || 0;
  const taxes = +taxesInput.value || 0;
  const ads = +adsInput.value || 0;
  const discount = +discountInput.value || 0;

  if (price > 0) {
    const total = price + taxes + ads - discount;
    totalOutput.textContent = total;
    totalOutput.style.backgroundColor = "#8BC34A";
  } else {
    totalOutput.textContent = "";
    totalOutput.style.backgroundColor = "#e96767";
  }
}

// === Clear Input Fields ===
function clearForm() {
  [
    titleInput,
    priceInput,
    taxesInput,
    adsInput,
    discountInput,
    countInput,
    categoryInput,
  ].forEach((input) => (input.value = ""));
  totalOutput.textContent = "";
}

// === Create or Update Product ===
function saveProduct() {
  const product = {
    title: titleInput.value.trim().toLowerCase(),
    price: priceInput.value,
    taxes: taxesInput.value,
    ads: adsInput.value,
    discount: discountInput.value,
    total: totalOutput.textContent,
    count: +countInput.value || 1,
    category: categoryInput.value.trim().toLowerCase(),
  };

  // === Validation ===
  if (!product.title || !product.price || !product.category) {
    showPopup("⚠️ Please fill in all required fields.", "error");
    return;
  }

  // === Add or Update ===
  if (mode === "create") {
    // إذا المستخدم كتب count أكبر من 1، نضيف منتج واحد فقط (بدون تكرار)
    products.push(product);
    showPopup("✅ Product added successfully!");
  } else {
    products[tempIndex] = product;
    mode = "create";
    submitBtn.textContent = "Create";
    countInput.style.display = "block";
    showPopup("✏️ Product updated successfully!");
  }

  localStorage.setItem("products", JSON.stringify(products));
  clearForm();
  renderTable();
}

// === Render Products Table ===
function renderTable(data = products) {
  tbody.innerHTML = data
    .map(
      (p, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${p.title}</td>
        <td>${p.price}</td>
        <td>${p.taxes || 0}</td>
        <td>${p.ads || 0}</td>
        <td>${p.discount || 0}</td>
        <td>${p.total}</td>
        <td>${p.count > 1 ? p.count : "-"}</td>
        <td>${p.category}</td>
        <td><button class="btn-update" onclick="editProduct(${i})">Update</button></td>
        <td><button class="btn-delete" onclick="deleteProduct(${i})">Delete</button></td>
      </tr>
    `
    )
    .join("");

  // === Delete All Button ===
  const deleteAllContainer = document.getElementById("deleteAllContainer");
  if (products.length > 0) {
    deleteAllContainer.innerHTML = `
      <button class="btn-delete-all" onclick="deleteAllProducts()">
        Delete All (${products.length})
      </button>
    `;
  } else {
    deleteAllContainer.innerHTML = "";
  }
}


// === Delete Single Product ===
function deleteProduct(index) {
  if (confirm("Are you sure you want to delete this product?")) {
    products.splice(index, 1);
    localStorage.setItem("products", JSON.stringify(products));
    renderTable();
    showPopup("🗑️ Product deleted!", "error");
  }
}

// === Delete All Products ===
function deleteAllProducts() {
  if (confirm("Delete ALL products?")) {
    products = [];
    localStorage.removeItem("products");
    renderTable();
    showPopup("🗑️ All products deleted!", "error");
  }
}

// === Edit Product ===
function editProduct(index) {
  const p = products[index];
  titleInput.value = p.title;
  priceInput.value = p.price;
  taxesInput.value = p.taxes;
  adsInput.value = p.ads;
  discountInput.value = p.discount;
  countInput.value = p.count;
  categoryInput.value = p.category;

  getTotal();

  countInput.style.display = "none"; // نخفي الـ count أثناء التعديل
  submitBtn.textContent = "Update";
  mode = "update";
  tempIndex = index;

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// === Search Functions ===
function setSearchMode(modeType) {
  searchMode = modeType;
  searchInput.placeholder = `Search by ${modeType}`;
  searchInput.focus();
  searchInput.value = "";
  renderTable();
}

function searchProducts(value) {
  const filtered = products.filter((p) =>
    p[searchMode].includes(value.toLowerCase())
  );
  renderTable(filtered);
}

// === Event Listeners ===
submitBtn.addEventListener("click", saveProduct);

// === Initial Render ===
renderTable();
console.log("✅ CRUD app loaded successfully!");
