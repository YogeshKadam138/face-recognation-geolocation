import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { pool } from './db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));
app.use('/models', express.static('models'));

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('File harus berupa gambar (jpeg, jpg, png)'));
  }
});

// Routes

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM data_user ORDER BY created_at DESC');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data user' });
  }
});

// Get user by username
app.get('/api/users/:username', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM data_user WHERE username = ?', [req.params.username]);
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }
    
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data user' });
  }
});

// Create new user
app.post('/api/users', upload.single('image'), async (req, res) => {
  try {
    const { username, kelas } = req.body;
    
    if (!username || !kelas || !req.file) {
      return res.status(400).json({ success: false, message: 'Username, kelas, dan image wajib diisi' });
    }

    // Check if username exists
    const [existing] = await pool.query('SELECT id FROM data_user WHERE username = ?', [username]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Username sudah terdaftar' });
    }

    const imagePath = `/uploads/${req.file.filename}`;
    
    const [result] = await pool.query(
      'INSERT INTO data_user (username, images, kelas, created_at) VALUES (?, ?, ?, NOW())',
      [username, imagePath, kelas]
    );

    res.json({ 
      success: true, 
      message: 'User berhasil didaftarkan',
      data: { id: result.insertId, username, images: imagePath, kelas }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ success: false, message: 'Gagal mendaftarkan user' });
  }
});

// Update user
app.put('/api/users/:id', upload.single('image'), async (req, res) => {
  try {
    const { username, kelas } = req.body;
    const userId = req.params.id;
    
    let updateQuery = 'UPDATE data_user SET username = ?, kelas = ?';
    let params = [username, kelas];
    
    if (req.file) {
      const imagePath = `/uploads/${req.file.filename}`;
      updateQuery += ', images = ?';
      params.push(imagePath);
    }
    
    updateQuery += ' WHERE id = ?';
    params.push(userId);
    
    await pool.query(updateQuery, params);

    res.json({ success: true, message: 'User berhasil diupdate' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, message: 'Gagal mengupdate user' });
  }
});

// Delete user
app.delete('/api/users/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM data_user WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'User berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus user' });
  }
});

// Get all attendance records
app.get('/api/absensi', async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT a.*, u.username, u.kelas 
      FROM absen_user a 
      JOIN data_user u ON a.user_id = u.id 
      ORDER BY a.time_absen DESC
    `;
    
    let params = [];
    
    if (status) {
      query = `
        SELECT a.*, u.username, u.kelas 
        FROM absen_user a 
        JOIN data_user u ON a.user_id = u.id 
        WHERE a.status = ?
        ORDER BY a.time_absen DESC
      `;
      params = [status];
    }
    
    const [rows] = await pool.query(query, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data absensi' });
  }
});

// Create attendance record
app.post('/api/absensi', async (req, res) => {
  try {
    const { username, location, similarity } = req.body;
    
    if (!username || !location || similarity === undefined) {
      return res.status(400).json({ success: false, message: 'Data tidak lengkap' });
    }

    // Get user by username
    const [users] = await pool.query('SELECT id FROM data_user WHERE username = ?', [username]);
    
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }

    const userId = users[0].id;
    const status = similarity >= 60 ? 'success' : 'failed';

    const [result] = await pool.query(
      'INSERT INTO absen_user (user_id, location, status, time_absen) VALUES (?, ?, ?, NOW())',
      [userId, location, status]
    );

    res.json({ 
      success: true, 
      message: `Absensi ${status}`,
      data: { 
        id: result.insertId, 
        user_id: userId, 
        status, 
        similarity,
        location 
      }
    });
  } catch (error) {
    console.error('Error creating attendance:', error);
    res.status(500).json({ success: false, message: 'Gagal menyimpan absensi' });
  }
});

// Delete attendance record
app.delete('/api/absensi/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM absen_user WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Data absensi berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting attendance:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus data absensi' });
  }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});