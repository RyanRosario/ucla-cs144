import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';

dotenv.config();
const app = express();
const PORT = 3001;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const upload = multer();

app.use(cors());

app.post('/api/moderate', upload.single('image'), async (req, res) => {
  const { description } = req.body;

  let isHuman = false;
  let descriptionFlagged = false;

  try {
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
      const moderationRes = await openai.moderations.create({ input: description });
      descriptionFlagged = moderationRes.results[0].flagged;
    }
    res.json({ isHuman, descriptionFlagged });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Moderation failed' });
  }
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

