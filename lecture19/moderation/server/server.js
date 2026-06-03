import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';

dotenv.config();
const app = express();
const PORT = 3001;
const upload = multer();
const provider = (process.env.AI_PROVIDER || 'openai').toLowerCase();

let openai;
let gemini;

if (provider === 'openai') {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
} else {
  gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

app.use(cors());

async function moderateWithOpenAI(req) {
  let isHuman = false;
  let descriptionFlagged = false;
  const { description } = req.body;

  if (req.file) {
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    const visionResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Does this image contain a human face? Answer yes or no.' },
            { type: 'image_url', image_url: { url: base64Image } }
          ]
        }
      ]
    });

    const answer = visionResponse.choices[0].message.content.trim().toLowerCase();
    isHuman = answer.includes('yes');
  }

  if (description) {
    const moderationRes = await openai.moderations.create({
      model: 'omni-moderation-latest',
      input: description,
    });
    descriptionFlagged = moderationRes.results[0].flagged;
  }

  return { isHuman, descriptionFlagged };
}

async function moderateWithGemini(req) {
  let isHuman = false;
  let descriptionFlagged = false;
  const { description } = req.body;

  if (req.file) {
    const base64Data = req.file.buffer.toString('base64');
    const response = await gemini.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: 'Does this image contain a human face? Answer yes or no.' },
            { inlineData: { mimeType: req.file.mimetype, data: base64Data } }
          ]
        }
      ]
    });

    const answer = response.text.trim().toLowerCase();
    isHuman = answer.includes('yes');
  }

  if (description) {
    const response = await gemini.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a content moderator. Analyze the following text and determine if it violates content policies (hate speech, harassment, violence, sexual content, self-harm, or dangerous content). Respond with ONLY a JSON object: {"flagged": true} or {"flagged": false}\n\nText: "${description}"`,
    });

    const content = response.text.trim();
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      descriptionFlagged = result.flagged === true;
    }
  }

  return { isHuman, descriptionFlagged };
}

app.post('/api/moderate', upload.single('image'), async (req, res) => {
  try {
    const result = provider === 'openai'
      ? await moderateWithOpenAI(req)
      : await moderateWithGemini(req);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Moderation failed' });
  }
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT} (using ${provider})`));
