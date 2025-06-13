let products = JSON.parse(localStorage.getItem('products')) || [];

const productList = document.getElementById('product-list');
const productForm = document.getElementById('product-form');
const nameInput = document.getElementById('product-name');
const priceInput = document.getElementById('product-price');
const categoryInput = document.getElementById('product-category');
const imageInput = document.getElementById('product-image');
const searchInput = document.getElementById('search');
const categoryFilter = document.getElementById('category-filter');

function saveToStorage() {
  localStorage.setItem('products', JSON.stringify(products));
}

function updateCategoryFilter() {
  const categories = [...new Set(products.map(p => p.category))];
  categoryFilter.innerHTML = `<option value="">All Categories</option>` +
    categories.map(cat => `<option value="\${cat}">\${cat}</option>`).join('');
}

function renderProducts(search = '', category = '') {
  productList.innerHTML = '';
  products
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()) &&
                 (category === '' || p.category === category))
    .forEach((product, index) => {
      const li = document.createElement('li');
      li.innerHTML = `
        <strong>\${product.name}</strong> - ₹\${product.price} <br>
        <em>\${product.category}</em>
        \${product.image ? `<img src="\${product.image}" class="product-img" />` : ''}
        <div class="product-actions">
          <button onclick="editProduct(\${index})">Edit</button>
          <button onclick="deleteProduct(\${index})">Delete</button>
          <button onclick="shareProduct(\${index})">Share</button>
        </div>
      `;
      productList.appendChild(li);
    });
}

productForm.addEventListener('submit', function (e) {
  e.preventDefault();

  const reader = new FileReader();
  const file = imageInput.files[0];

  const addProduct = (imgData = '') => {
    const newProduct = {
      name: nameInput.value,
      price: priceInput.value,
      category: categoryInput.value,
      image: imgData
    };
    products.push(newProduct);
    saveToStorage();
    renderProducts();
    updateCategoryFilter();
    productForm.reset();
  };

  if (file) {
    reader.onloadend = () => addProduct(reader.result);
    reader.readAsDataURL(file);
  } else {
    addProduct();
  }
});

searchInput.addEventListener('input', () => {
  renderProducts(searchInput.value, categoryFilter.value);
});

categoryFilter.addEventListener('change', () => {
  renderProducts(searchInput.value, categoryFilter.value);
});

window.editProduct = function (index) {
  const product = products[index];
  const newName = prompt('Edit name', product.name);
  const newPrice = prompt('Edit price', product.price);
  const newCategory = prompt('Edit category', product.category);
  if (newName && newPrice && newCategory) {
    products[index].name = newName;
    products[index].price = newPrice;
    products[index].category = newCategory;
    saveToStorage();
    renderProducts();
    updateCategoryFilter();
  }
};

window.deleteProduct = function (index) {
  if (confirm('Delete this product?')) {
    products.splice(index, 1);
    saveToStorage();
    renderProducts();
    updateCategoryFilter();
  }
};

window.shareProduct = function (index) {
  const product = products[index];
  const msg = `Product: \${product.name}\nPrice: ₹\${product.price}\nCategory: \${product.category}`;
  const whatsappUrl = `https://wa.me/?text=\${encodeURIComponent(msg)}`;
  window.open(whatsappUrl, '_blank');
};

window.exportCSV = function () {
  let csv = "Name,Price,Category\n";
  products.forEach(p => {
    csv += `"\${p.name}","\${p.price}","\${p.category}"\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'products.csv';
  a.click();
  URL.revokeObjectURL(url);
};

renderProducts();
updateCategoryFilter();
