const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/translate', async (req, res) => {
    const { texts, sourceLang, targetLang } = req.body;

    if (!Array.isArray(texts) || texts.length === 0) {
        return res.status(400).json({ error: 'Invalid texts array' });
    }

    try {
        const response = await axios.post(
            'https://translation.googleapis.com/language/translate/v2',
            null,
            {
                params: {
                    q: texts,
                    source: sourceLang,
                    target: targetLang,
                    key: 'AIzaSyByuw5Nusr9di1Gbk9WqjJ-hE9R5frDziA'
                }
            }
        );

        const translatedTexts = response.data.data.translations.map(t => t.translatedText);

        res.json({
            translated: translatedTexts
        });

    } catch (error) {
        console.error('Çeviri hatası:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Translation failed' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
