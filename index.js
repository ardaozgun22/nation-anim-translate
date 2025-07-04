const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
const googleTranslate = require('@vitalets/google-translate-api');
app.use(cors());
app.use(express.json());
const translationCache = new Map();
const translate = async (text, sourceLang, targetLang, res) => {
    const cacheKey = `${text}|${sourceLang || 'auto'}|${targetLang}`;
    if (translationCache.has(cacheKey)) {
        return res.json({
            text: translationCache.get(cacheKey)
        });
    }
    try {
        const result = await googleTranslate(text, {
            from: sourceLang || 'auto',
            to: targetLang
        });
        translationCache.set(cacheKey, result.text);
        res.json({
            text: result.text
        });
    } catch (error) {
        console.error('Çeviri hatası:', error);
        res.status(500).json({ error: 'Translation failed' });
    }
}

app.post('/translate', async (req, res) => {
    const { text, sourceLang, targetLang } = req.body;
    if (!text || !targetLang) {
        return res.status(400).json({ error: 'Missing text or targetLang' });
    }
    await translate(text, sourceLang, targetLang, res);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
