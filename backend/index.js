const express = require('express');
const cors = require('cors');
const app = express();
const { Translate } = require('@google-cloud/translate').v2;
const translator = new Translate();
const SpeechToText = require('@google-cloud/speech').v1p1beta1;

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Welcome to the Translation app.');
});

app.post('/translate', async (req, res) => {
  try {
    const { text, dest_language } = req.body;
    const [translation] = await translator.translate(text, dest_language);
    res.json({ translated_text: translation });
  } catch (error) {
    console.error('Error translating text:', error);
    res.status(500).json({ error: 'Failed to translate text' });
  }
});

app.post('/speech-to-text', async (req, res) => {
  try {
    const client = new SpeechToText.SpeechClient();
    const audio = {
      content: req.body.audio_content,
    };
    const config = {
      encoding: 'LINEAR16',
      sampleRateHertz: 16000,
      languageCode: 'es-ES',
    };
    const request = {
      audio: audio,
      config: config,
    };
    const [response] = await client.recognize(request);
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');
    res.json({ text: transcription });
  } catch (error) {
    console.error('Error transcribing speech:', error);
    res.status(500).json({ error: 'Failed to transcribe speech' });
  }
});

app.post('/text-to-speech', (req, res) => {
  try {
    const { text } = req.body;
    const audio = {
      input: { text: text },
      voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
      audioConfig: { audioEncoding: 'MP3' },
    };
    const client = new TextToSpeech.TextToSpeechClient();
    client.synthesizeSpeech(audio, (err, response) => {
      if (err) {
        console.error('Error generating speech:', err);
        res.status(500).json({ error: 'Failed to generate speech' });
        return;
      }
      res.send(response.audioContent);
    });
  } catch (error) {
    console.error('Error generating speech:', error);
    res.status(500).json({ error: 'Failed to generate speech' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
