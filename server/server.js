require('dotenv').config();

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const dynamicAllowedOrigins = [
    'http://127.0.0.1:5500',
    'http://localhost:5500',
];

if (process.env.FRONTEND_URL && process.env.FRONTEND_URL.trim() !== '') {
    dynamicAllowedOrigins.push(process.env.FRONTEND_URL.trim());
}

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || dynamicAllowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.error(`CORS Error: Origin ${origin} not allowed. Allowed origins:`, dynamicAllowedOrigins);
            callback(new Error('Not allowed by CORS'), false);
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect(err => {
    if (err) {
        console.error('Koneksi database gagal:', err);
        return;
    }
    console.log('Terhubung ke database...');
});

db.on('error', function(err) {
    console.error('Kesalahan database tak terduga:', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log('Mencoba menyambung kembali ke database...');
        db.connect(err => {
            if (err) {
                console.error('Koneksi ulang gagal:', err);
            } else {
                console.log('Koneksi ulang berhasil!');
            }
        });
    } else {
        throw err;
    }
});

// === API Routes ===

app.get('/api/portofolio', (req, res) => {
    const sql = 'SELECT id, nama_kegiatan, waktu_kegiatan FROM portofolio';

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Kesalahan kueri database:', err);
            return res.status(500).json({ error: 'Gagal mengambil data portofolio.' });
        }
        res.json(results);
    });
});

app.put('/api/portofolio/:id', (req, res) => {
    const id = req.params.id;
    const { nama_kegiatan, waktu_kegiatan } = req.body;

    if (!nama_kegiatan || !waktu_kegiatan) {
        return res.status(400).json({ error: 'Nama kegiatan dan waktu kegiatan diperlukan!' });
    }

    const sql = 'UPDATE portofolio SET nama_kegiatan = ?, waktu_kegiatan = ? WHERE id = ?';
    db.query(sql, [nama_kegiatan, waktu_kegiatan, id], (err, result) => {
        if (err) {
            console.error('Kesalahan saat memperbarui data di database:', err);
            return res.status(500).json({ message: 'Terjadi kesalahan server saat memperbarui data.' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Data tidak ditemukan.' });
        }
        res.status(200).json({ message: 'Data berhasil diperbarui!' });
    });
});

app.post('/api/portofolio', (req, res) => {
    const { nama_kegiatan, waktu_kegiatan } = req.body;

    if (!nama_kegiatan || !waktu_kegiatan) {
        return res.status(400).json({ error: 'Nama kegiatan dan waktu kegiatan diperlukan!' });
    }

    const sql = 'INSERT INTO portofolio (nama_kegiatan, waktu_kegiatan) VALUES (?, ?)';
    db.query(sql, [nama_kegiatan, waktu_kegiatan], (err, result) => {
        if (err) {
            console.error('Kesalahan saat menambah data:', err);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ error: 'Data dengan nilai ini sudah ada.' });
            }
            return res.status(500).json({ error: 'Gagal menambah data portofolio.' });
        }
        res.status(201).json({
            message: 'Data berhasil ditambahkan!',
            id: result.insertId,
            nama_kegiatan: nama_kegiatan,
            waktu_kegiatan: waktu_kegiatan
        });
    });
});

app.delete('/api/portofolio/:id', (req, res) => {
    const id = req.params.id;

    const sql = 'DELETE FROM portofolio WHERE id = ?';

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Kesalahan saat menghapus data:', err);
            return res.status(500).json({ error: 'Gagal menghapus data.' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Data dengan ID tersebut tidak ditemukan.' });
        }

        res.json({ message: 'Data berhasil dihapus!' });
    });
});

// Endpoint dasar untuk Health Check Render
app.get('/', (req, res) => {
    res.send('Backend API is running!');
});


// Mulai server
app.listen(port, () => {
    console.log(`Server backend berjalan di ${port}`);
});