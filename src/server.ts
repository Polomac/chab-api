import express, {Request, Response }from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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
  res.status(200).json({
    message: 'User registered successfully',
  });
});

const PORT = process.env.PORT || 6000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});