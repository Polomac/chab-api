import express, {Request, Response }from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { StreamChat } from 'stream-chat';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const chatClient = StreamChat.getInstance(process.env.STREAM_KEY!, process.env.STREAM_SECRET!);

app.post('/register', async (req: Request, res: Response): Promise<any> => {

  if (!req.body) {
    return res.status(400).json({
      error: 'Request body is required',
    });
  }
  const { email, name } = req.body;
  
  if (!email || !name) {
    return res.status(400).json({
      error: 'Username and password are required',
    });
  }
  
  const uid = email.replace(/[^a-zA-Z0-9_-]/g, '_');

  try {
    console.log(uid)
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

    return res.status(200).json({ message: 'User registered successfully' });
  
  } catch (error) {
    console.error('Error registering user:', error);
    return res.status(500).json({
      error: 'Internal server error',
    });
  }
});

const PORT = process.env.PORT || 6000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});