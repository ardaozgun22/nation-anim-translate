const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const translate = async (text, sourceLang, targetLang, res) => {
    try {
        const response = await axios.post('https://translation.googleapis.com/language/translate/v2', null, {
            params: {
                q: text,
                source: sourceLang,
                target: targetLang,
                key: 'AIzaSyByuw5Nusr9di1Gbk9WqjJ-hE9R5frDziA'
            }
        });
        res.json({
            text: response.data.data.translations[0].translatedText
        });
    } catch (error) {
        console.error('Çeviri hatası:', error.response ? error.response.data : error.message);
    }
}

app.post('/translate', async (req, res) => {
    const { text, sourceLang, targetLang } = req.body;
    await translate(text, sourceLang, targetLang, res);
});

app.listen(port, () => {});
