import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import crypto from 'crypto';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Root info (avoid 404 at domain root)
app.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'church-api',
    message: 'API server is running. Try /api/health',
    endpoints: ['/api/health', '/api/admin/ping', '/api/cloudinary/signature'],
  });
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'church-api' });
});

// Admin placeholder route
app.get('/api/admin/ping', (_req, res) => {
  res.json({ ok: true });
});

// Cloudinary config (server-side only)
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  // Optional: provide a signature for signed uploads if you decide to switch from unsigned
  app.post('/api/cloudinary/signature', (req, res) => {
    const { timestamp = Math.floor(Date.now() / 1000), folder = 'church', public_id, eager, source = 'church-app' } = req.body || {};
    // Build params to sign (must match what the client will send to Cloudinary)
    const paramsToSign = { timestamp, folder };
    if (public_id) paramsToSign.public_id = public_id;
    if (eager) paramsToSign.eager = eager;
    // Cloudinary sorts keys alpha internally; use their helper to generate signature
    const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET);
    res.json({
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      timestamp,
      folder,
      signature,
    });
  });
}

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/church';

async function start() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected');
  } catch (e) {
    console.warn('MongoDB not connected yet. Continuing without DB. Set MONGODB_URI in .env');
  }
  app.listen(PORT, () => console.log(`API đang chạy tại http://localhost:${PORT}`));
}

start();
