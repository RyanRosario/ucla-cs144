import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';

dotenv.config();
const app = express();
const PORT = 3001;
const provider = (process.env.AI_PROVIDER || 'openai').toLowerCase();

let openai;
let gemini;

if (provider === 'openai') {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
} else {
  gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

app.use(cors());
app.use(express.json());

const prompt = `Grade this student's FizzBuzz solution out of 10. Provide brief feedback.

  Speak directly to the student when giving the feedback but don't give away the answer.

Respond only with a valid JSON object: { "score": <number>, "feedback": "<string>" }`;

app.post('/api/review', async (req, res) => {
  const { code } = req.body;
  const fullPrompt = `${prompt}\n\nCode:\n${code}`;

  try {
    let content;

    if (provider === 'openai') {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: fullPrompt }],
      });
      content = completion.choices[0].message.content.trim();
    } else {
      const response = await gemini.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
      });
      content = response.text.trim();
    }

    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      content = jsonMatch[1];
    }

    const result = JSON.parse(content);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ score: 0, feedback: 'There was an error generating feedback.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT} (using ${provider})`);
});
