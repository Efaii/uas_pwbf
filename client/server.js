const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Middleware untuk menyajikan file statis dari folder client (atau root kontainer setelah build)
app.use(express.static(path.join(__dirname, '/')));

// Semua permintaan lainnya akan mengembalikan index.html (untuk SPA, tapi aman untuk Anda)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`Frontend server berjalan di http://localhost:${port}`);
});