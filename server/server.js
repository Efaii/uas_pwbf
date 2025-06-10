require('dotenv').config();

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// CORS configuration yang diperbaiki
const dynamicAllowedOrigins = [
    'http://127.0.0.1:5500',
    'http://localhost:5500',
    'https://127.0.0.1:5500',
    'https://localhost:5500',
];

// Tambahkan frontend URL jika ada
if (process.env.FRONTEND_URL && process.env.FRONTEND_URL.trim() !== '') {
    dynamicAllowedOrigins.push(process.env.FRONTEND_URL.trim());
}

console.log('=== CORS CONFIGURATION ===');
console.log('Allowed origins:', dynamicAllowedOrigins);

app.use(cors({
    origin: function (origin, callback) {
        // Izinkan request tanpa origin (seperti Postman, curl, atau akses langsung)
        if (!origin) {
            console.log('Request without origin - allowing');
            return callback(null, true);
        }
        
        // Cek apakah origin diizinkan
        if (dynamicAllowedOrigins.includes(origin)) {
            console.log(`Origin ${origin} - ALLOWED`);
            callback(null, true);
        } else {
            console.log(`Origin ${origin} - BLOCKED`);
            console.log('Allowed origins:', dynamicAllowedOrigins);
            
            // Untuk development, kita bisa lebih permisif
            if (process.env.NODE_ENV !== 'production') {
                console.log('Development mode - allowing all origins');
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'), false);
            }
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true
}));

// Enhanced database connection
console.log('=== DATABASE CONNECTION ATTEMPT ===');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***SET***' : 'NOT SET');

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
});

db.connect(err => {
    if (err) {
        console.error('=== DATABASE CONNECTION FAILED ===');
        console.error('Error code:', err.code);
        console.error('Error message:', err.message);
        return;
    }
    console.log('=== DATABASE CONNECTION SUCCESS ===');
});

db.on('error', function(err) {
    console.error('=== DATABASE ERROR ===');
    console.error('Error code:', err.code);
    console.error('Error message:', err.message);
    
    if(err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log('Mencoba menyambung kembali ke database...');
    }
});

// === API Routes ===

app.get('/api/portofolio', (req, res) => {
    console.log('=== GET /api/portofolio REQUEST ===');
    console.log('Origin:', req.get('Origin'));
    console.log('User-Agent:', req.get('User-Agent'));
    
    const sql = 'SELECT id, nama_kegiatan, waktu_kegiatan FROM portofolio';

    db.query(sql, (err, results) => {
        if (err) {
            console.error('=== DATABASE QUERY ERROR ===');
            console.error('Error:', err);
            return res.status(500).json({ 
                error: 'Gagal mengambil data portofolio.',
                details: err.message
            });
        }
        
        console.log('Query berhasil, jumlah data:', results.length);
        res.json(results);
    });
});

app.post('/api/portofolio', (req, res) => {
    console.log('=== POST /api/portofolio REQUEST ===');
    console.log('Origin:', req.get('Origin'));
    
    const { nama_kegiatan, waktu_kegiatan } = req.body;

    if (!nama_kegiatan || !waktu_kegiatan) {
        return res.status(400).json({ error: 'Nama kegiatan dan waktu kegiatan diperlukan!' });
    }

    const sql = 'INSERT INTO portofolio (nama_kegiatan, waktu_kegiatan) VALUES (?, ?)';
    db.query(sql, [nama_kegiatan, waktu_kegiatan], (err, result) => {
        if (err) {
            console.error('Database insert error:', err);
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
    console.log('=== DELETE /api/portofolio/:id REQUEST ===');
    console.log('Origin:', req.get('Origin'));
    
    const id = req.params.id;

    if (isNaN(id)) {
        return res.status(400).json({ error: 'ID harus berupa angka!' });
    }

    const sql = 'DELETE FROM portofolio WHERE id = ?';

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Database delete error:', err);
            return res.status(500).json({ error: 'Gagal menghapus data.' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Data dengan ID tersebut tidak ditemukan.' });
        }

        res.json({ message: 'Data berhasil dihapus!' });
    });
});

// Health check endpoint
app.get('/', (req, res) => {
    console.log('=== HEALTH CHECK ===');
    console.log('Origin:', req.get('Origin'));
    
    res.json({
        status: 'Backend API is running!',
        timestamp: new Date().toISOString(),
        database_state: db.state,
        cors_origins: dynamicAllowedOrigins
    });
});

// Test database connection
app.get('/api/test-db', (req, res) => {
    console.log('=== DATABASE TEST ===');
    
    db.query('SELECT 1 as test', (err, results) => {
        if (err) {
            console.error('Database test failed:', err);
            return res.status(500).json({ 
                error: 'Database test failed',
                details: err.message
            });
        }
        
        res.json({ 
            success: true, 
            message: 'Database connection OK',
            state: db.state
        });
    });
});

// Global error handler
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Start server
app.listen(port, () => {
    console.log('=== SERVER STARTED ===');
    console.log(`Server running on port ${port}`);
    console.log('CORS origins:', dynamicAllowedOrigins);
    console.log('Environment:', process.env.NODE_ENV || 'development');
});