const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure directories exist
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const DATA_FILE = path.join(__dirname, 'data.json');

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify([]));

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, uuidv4() + ext);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(UPLOADS_DIR));

// Helpers
function readData() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
  catch { return []; }
}
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// API: Get all items
app.get('/api/items', (req, res) => {
  const items = readData();
  res.json(items.slice().reverse()); // newest first
});

// API: Upload file
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const items = readData();
  const item = {
    id: uuidv4(),
    type: 'file',
    name: req.file.originalname,
    filename: req.file.filename,
    mimetype: req.file.mimetype,
    size: req.file.size,
    createdAt: new Date().toISOString()
  };
  items.push(item);
  writeData(items);
  res.json(item);
});

// API: Post text
app.post('/api/text', (req, res) => {
  const { content, label } = req.body;
  if (!content || !content.trim()) return res.status(400).json({ error: 'No text provided' });
  const items = readData();
  const item = {
    id: uuidv4(),
    type: 'text',
    label: label?.trim() || '文字片段',
    content: content.trim(),
    createdAt: new Date().toISOString()
  };
  items.push(item);
  writeData(items);
  res.json(item);
});

// API: Delete item
app.delete('/api/items/:id', (req, res) => {
  let items = readData();
  const item = items.find(i => i.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });

  if (item.type === 'file') {
    const filepath = path.join(UPLOADS_DIR, item.filename);
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
  }

  items = items.filter(i => i.id !== req.params.id);
  writeData(items);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  // Keep-alive: 每 4 分鐘自己打自己，防止 Render 免費版休眠
  const RENDER_URL = process.env.RENDER_EXTERNAL_URL;
  if (RENDER_URL) {
    const https = require('https');
    const http = require('http');
    setInterval(() => {
      const url = RENDER_URL.startsWith('https') ? https : http;
      url.get(RENDER_URL, (res) => {
        console.log(`[keep-alive] ping ${RENDER_URL} → ${res.statusCode}`);
      }).on('error', (e) => {
        console.warn(`[keep-alive] ping failed: ${e.message}`);
      });
    }, 4 * 60 * 1000); // 240 秒
  }
});
