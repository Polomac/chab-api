import express, {Request, Response }from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { StreamChat } from 'stream-chat';
import OpenAI from 'openai';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Stream init
const chatClient = StreamChat.getInstance(process.env.STREAM_KEY!, process.env.STREAM_SECRET!);

// OpenAI init
const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY});

/* Routes */
// Register
app.post('/register', async (req: Request, res: Response): Promise<any> => {
  const { email, name } = req.body;
  if (!email || !name) {
    return res.status(400).json({
      error: 'Username and password are required',
    });
  }
  
  const uid = email.replace(/[^a-zA-Z0-9_-]/g, '_');

  try {
    const userResponse = await chatClient.queryUsers({id: {$eq: uid}});

    if (!userResponse.users.length) {
      await chatClient.upsertUser({
        id: uid,
        name: name,
        //@ts-ignore
        email: email,
        role: 'user',
      });
    } else {
      return res.status(400).json({
        error: 'User already exists',
      });
    }

    return res.status(200).json({ message: 'User registered successfully', uid, name });
  
  } catch (error) {
    return res.status(500).json({
      error,
    });
  }
});

// Chat
app.post('/chat', async (req: Request, res: Response): Promise<any> => {
  const { message, uid } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required'});
  }

  if (!uid) {
    return res.status(401).json({ error: 'Please sign in to send a message' });
  }

  try {
    const userResponse = await chatClient.queryUsers({id: {$eq: uid}});
    if (!userResponse.users.length) {
      return res.status(404).json({ error: 'User not found, please register'});
    }
    const response = await openai.chat.completions.create({
      model: 'gpt-5-nano',
      messages: [
        { role: 'user', content: message },
      ],
    });

    res.status(200).json({ message: response.choices[0].message?.content });

  } catch (error) {
    return res.status(500).json({
      error,
    });
  }
})

const PORT = process.env.PORT || 6000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});