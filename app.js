const express = require('express');
const path = require('path');
const app = express();

// serve static folder
app.use(express.static(path.join(__dirname, 'public')));

// routing "ngắn gọn" cho HTML
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public','pages', 'login.html'));
});

app.get('/shop', (req, res) => {
  res.sendFile(path.join(__dirname, 'public','pages', 'shop.html'));
});

app.get('/cart', (req, res) => {
  res.sendFile(path.join(__dirname, 'public','pages', 'cart.html'));
});

app.get("/checkout", (req, res) => {
  res.sendFile(path.join(__dirname, "public/pages/checkout.html"));
});

app.get("/search", (req, res) => {
  res.sendFile(path.join(__dirname, "public/pages/search.html"));
});

app.get("/account", (req, res) => {
  res.sendFile(path.join(__dirname, "public/pages/account.html"));
});

app.get("/success", (req, res) => {
  res.sendFile(path.join(__dirname, "public/pages/success.html"));
});
app.get("/fail", (req, res) => {
  res.sendFile(path.join(__dirname, "public/pages/fail.html"));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public','pages', 'index.html'));
});


// ===================
// ADMIN ROUTES
// ===================

app.get('/admin', (req, res) => {
  res.redirect('/admin/login');
});

app.get('/admin/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public','admin','login.html'));
});

app.get('/admin/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public','admin','dashboard.html'));
});

app.get('/admin/products', (req, res) => {
  res.sendFile(path.join(__dirname, 'public','admin','products.html'));
});

app.get('/admin/categories', (req, res) => {
  res.sendFile(path.join(__dirname, 'public','admin','categories.html'));
});

app.get('/admin/orders', (req, res) => {
  res.sendFile(path.join(__dirname, 'public','admin','orders.html'));
});

app.get('/admin/chat', (req, res) => {
  res.sendFile(path.join(__dirname, 'public','admin','chat.html'));
});

app.get('/admin/users', (req, res) => {
  res.sendFile(path.join(__dirname, 'public','admin','users.html'));
});

app.get('/admin/banners', (req, res) => {
  res.sendFile(path.join(__dirname, 'public','admin','banners.html'));
});

app.get('/:slug', (req, res) => {
  res.sendFile(
    path.join(__dirname, 'public', 'pages', 'product-detail.html')
  );
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
