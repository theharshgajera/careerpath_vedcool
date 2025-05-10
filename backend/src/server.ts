import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import questionnaireRoutes from './routes/questionnaireRoutes';
import marksRoutes from './routes/marksRoutes';
import fileRoute from './routes/fileRoute';

dotenv.config();

const app = express();

mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use(cors());
app.use(express.json());

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`Received ${req.method} request to ${req.path}`);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/questionnaire', questionnaireRoutes);
app.use('/api/marks', marksRoutes);
app.use('/api/files', fileRoute);

app.get('/', (req, res) => {
  res.send('Server is running');
});

const PORT = process.env.PORT || 5173;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));