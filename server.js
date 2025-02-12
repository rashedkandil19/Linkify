import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// تحديد المسار الصحيح عند استخدام ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// تفعيل CORS للسماح للفرونت إند بالتواصل مع السيرفر
app.use(cors());

// تشغيل الملفات الثابتة (Frontend)
app.use(express.static(path.join(__dirname, 'public')));

// API لاسترجاع مفتاح Google API من بيئة التشغيل
app.get('/get-api-key', (req, res) => {
    res.json({ apiKey: process.env.GOOGLE_API_KEY });
});

// API لاستدعاء أماكن قريبة باستخدام Google Places API
app.get('/api/places', async (req, res) => {
    try {
        const { location, radius, keyword, type } = req.query;
        const apiKey = process.env.GOOGLE_API_KEY;

        // بناء رابط طلب البيانات من Google Places API
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=${radius}&keyword=${keyword}&type=${type}&key=${apiKey}`;

        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching places:', error);
        res.status(500).json({ error: "Error fetching places" });
    }
});

// تشغيل السيرفر
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
