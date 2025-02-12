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

// إعداد CORS للسماح فقط بالنطاقات المحددة (أضف نطاق موقعك هنا)
const allowedOrigins = ['http://localhost:3000', 'https://yourdomain.com'];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));

// تشغيل الملفات الثابتة (Frontend)
app.use(express.static(path.join(__dirname, 'public')));

// API لاسترجاع مفتاح Google API من بيئة التشغيل
app.get('/get-api-key', (req, res) => {
    if (!process.env.GOOGLE_API_KEY) {
        return res.status(500).json({ error: 'API Key not found' });
    }
    res.json({ apiKey: process.env.GOOGLE_API_KEY });
});

// API لاستدعاء أماكن قريبة باستخدام Google Places API
app.get('/api/places', async (req, res) => {
    try {
        const { location, radius, keyword, type } = req.query;
        const apiKey = process.env.GOOGLE_API_KEY;

        if (!location || !radius) {
            return res.status(400).json({ error: "Missing required parameters" });
        }

        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=${radius}&keyword=${keyword || ''}&type=${type || ''}&key=${apiKey}`;
        const response = await axios.get(url);

        if (response.data.status !== "OK" && response.data.status !== "ZERO_RESULTS") {
            throw new Error(response.data.error_message || "Failed to fetch places");
        }

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching places:', error.message);
        res.status(500).json({ error: "An error occurred while fetching places" });
    }
});

// تشغيل السيرفر
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
