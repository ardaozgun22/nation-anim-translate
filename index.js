const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Basit in-memory cache
const translationCache = {};
const getCacheKey = (text, sourceLang, targetLang) => `${sourceLang}:${targetLang}:${text}`;

// Batch çeviri fonksiyonu
const batchTranslate = async (req, res) => {
  const { texts, sourceLang, targetLang } = req.body;

  if (!Array.isArray(texts) || !sourceLang || !targetLang) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  // 1️⃣ Cache kontrolü
  const cachedResults = {};
  const toTranslate = [];
  const toTranslateIndexes = [];

  texts.forEach((text, idx) => {
    const key = getCacheKey(text, sourceLang, targetLang);
    if (translationCache[key]) {
      cachedResults[idx] = translationCache[key];
    } else {
      toTranslate.push(text);
      toTranslateIndexes.push(idx);
    }
  });

  let translatedTexts = [];
  if (toTranslate.length > 0) {
    try {
      // 2️⃣ Sadece cache'te olmayanları Google Translate'e gönder
      const response = await axios.post('https://translation.googleapis.com/language/translate/v2', null, {
        params: {
          q: toTranslate,
          source: sourceLang,
          target: targetLang,
          key: 'AIzaSyByuw5Nusr9di1Gbk9WqjJ-hE9R5frDziA'
        }
      });
      translatedTexts = response.data.data.translations.map(t => t.translatedText);

      // 3️⃣ Sonuçları cache'e kaydet
      translatedTexts.forEach((translated, i) => {
        const originalIndex = toTranslateIndexes[i];
        const originalText = texts[originalIndex];
        const key = getCacheKey(originalText, sourceLang, targetLang);
        translationCache[key] = translated;
        cachedResults[originalIndex] = translated;
      });
    } catch (error) {
      console.error('Batch translate error:', error.response?.data || error.message);
      return res.status(500).json({ error: 'Translation failed' });
    }
  }

  // 4️⃣ Sıralı sonuçları geri döndür
  const finalResults = texts.map((_, idx) => cachedResults[idx]);

  res.json({ translations: finalResults });
};

app.post('/translate', batchTranslate);

app.listen(port, () => {
  console.log(`Translation server listening on port ${port}`);
});
