import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import cors from 'cors';
import { decrypt } from './encrypt.js';
import path from 'path';
dotenv.config();
const encryptedApiKey = process.env.ENCRYPTED_GOOGLE_API_KEY;
if (!encryptedApiKey) {
    console.error("❌ Error: ENCRYPTED_GOOGLE_API_KEY is missing from .env file");
    process.exit(1);
}
let decryptedApiKey;
try {
    decryptedApiKey = decrypt(encryptedApiKey);
    console.log("🔓 Decrypted API Key loaded successfully.");
} catch (error) {
    console.error("❌ Error decrypting API key:", error.message);
    process.exit(1);
}
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
app.get('/api/places', async (req, res) => {
    try {
        const { latitude, longitude, radius = 5000, keyword = '', type = '' } = req.query;
        if (!latitude || !longitude) {
            return res.status(400).json({ error: 'Latitude and Longitude are required' });
        }
        const API_URL = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&keyword=${encodeURIComponent(keyword)}&type=${encodeURIComponent(type)}&key=${decryptedApiKey}`;
        console.log("Requesting:", API_URL);
        const response = await axios.get(API_URL);
        if (response.data.status !== "OK") {
            console.error("Error from Google API:", response.data.error_message);
            return res.status(500).json({ error: response.data.error_message });
        }
        res.json(response.data);
    } catch (error) {
        console.error('❌ Error fetching places:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
app.get('/api/placeDetails', async (req, res) => {
    try {
        const { place_id } = req.query;
        if (!place_id) {
            return res.status(400).json({ error: 'place_id is required' });
        }
        const API_URL = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&key=${decryptedApiKey}`;
        console.log("Requesting place details:", API_URL);
        const response = await axios.get(API_URL);
        if (response.data.status !== "OK") {
            console.error("Error from Google API:", response.data.error_message);
            return res.status(500).json({ error: response.data.error_message });
        }
        res.json(response.data);
    } catch (error) {
        console.error('❌ Error fetching place details:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
app.use(express.static(path.join(process.cwd(), 'public')));
app.get('/', (req, res) => {
    res.sendFile(path.resolve(process.cwd(), 'index.html'));
});
app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
});