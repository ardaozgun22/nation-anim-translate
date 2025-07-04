const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const translate = async (text, sourceLang, targetLang, res) => {
  try {
    const response = await axios.post('https://libretranslate.de/translate', {
      q: text,
      source: sourceLang,
      target: targetLang,
      format: 'text'
    });
   console.log({
  data: response.data,
  status: response.status
});
    res.json({
      text: response.data.translatedText
    });
  } catch (error) {
    console.error('Çeviri hatası:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Translation failed' });
  }
};

app.post('/translate', async (req, res) => {
    const { text, sourceLang, targetLang } = req.body;
    await translate(text, sourceLang, targetLang, res);
});

app.listen(port, () => {});
