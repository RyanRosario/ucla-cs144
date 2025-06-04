import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { OpenAI } from 'openai';

dotenv.config();
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/api/review', async (req, res) => {
  const { code } = req.body;

  const prompt = `Grade this student's FizzBuzz solution out of 10. Provide brief feedback.

  Speak directly to the student when giving the feedback but don't give away the answer.

Code:
${code}

Respond only with a valid JSON object: { "score": <number>, "feedback": "<string>" }`;

  try {
    const completion = await openai.chat.completions.create(
	{
      		model: 'gpt-4o',
      		messages: [{ role: 'user', content: prompt }],
    	});

    let content = completion.choices[0].message.content.trim();
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
	    content = jsonMatch[1];
    }

    //if (content.startsWith('```')) {
    //  content = content.split('```')[1].trim(); // This grabs the stuff between the first and second ```
    // }
    const result = JSON.parse(content);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ score: 0, feedback: 'There was an error generating feedback.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
