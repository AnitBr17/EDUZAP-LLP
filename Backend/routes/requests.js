const express = require('express');
const router = express.Router();
const RequestModel = require('../models/Request');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// multer setup - store files in uploads directory with timestamped names
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '';
    const name = `${Date.now()}-${Math.random().toString(36).slice(2,8)}${ext}`;
    cb(null, name);
  }
});
const upload = multer({ storage });

// router factory to inject io and cache
module.exports = (io, cache) => {
  // POST /request (multipart - optional image)
  router.post('/request', upload.single('image'), async (req, res) => {
    try {
      const { name, phone, title } = req.body;
      if (!name || !phone || !title) {
        // If an image was uploaded, remove it because validation failed
        if (req.file && req.file.path) fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: 'name, phone and title are required' });
      }

      let imagePath = '';
      if (req.file) {
        // expose as path relative to server (client should fetch from server base URL)
        imagePath = `/${uploadDir}/${req.file.filename}`;
      } else if (req.body.image) {
        // optional: accept image url in body
        imagePath = req.body.image;
      }

      const newReq = new RequestModel({ name, phone, title, image: imagePath });
      const saved = await newReq.save();

      // Invalidate caches
      cache.del('allRequests');
      cache.del('sortedRequests');

      if (io) io.emit('requestAdded', saved.toJSON());
      return res.status(201).json(saved);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Server error' });
    }
  });

  // GET /requests
  router.get('/requests', async (req, res) => {
    try {
      const cached = cache.get('allRequests');
      if (cached) return res.json(cached);
      const docs = await RequestModel.find().sort({ timestamp: -1 }).lean();
      cache.set('allRequests', docs);
      return res.json(docs);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Server error' });
    }
  });

  // GET /requests/sorted
  router.get('/requests/sorted', async (req, res) => {
    try {
      const cached = cache.get('sortedRequests');
      if (cached) return res.json(cached);
      const docs = await RequestModel.find().sort({ title: 1 }).lean();
      cache.set('sortedRequests', docs);
      return res.json(docs);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Server error' });
    }
  });

  // GET /requests/search?title=...
  router.get('/requests/search', async (req, res) => {
    try {
      const { title } = req.query;
      if (!title) return res.status(400).json({ error: 'title query required' });
      const docs = await RequestModel.find({
        title: { $regex: title, $options: 'i' }
      }).sort({ timestamp: -1 }).lean();
      return res.json(docs);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Server error' });
    }
  });

  // DELETE /request/:id
  router.delete('/request/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await RequestModel.findByIdAndDelete(id).lean();
      if (!deleted) return res.status(404).json({ error: 'Not found' });

      // attempt to remove file if it's local upload path
      if (deleted.image && deleted.image.startsWith(`/${uploadDir}/`)) {
        const filePath = path.join(process.cwd(), deleted.image);
        fs.unlink(filePath, (err) => { /* ignore */ });
      }

      cache.del('allRequests');
      cache.del('sortedRequests');

      if (io) io.emit('requestDeleted', deleted);
      return res.json({ success: true, deleted });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Server error' });
    }
  });

  return router;
};
