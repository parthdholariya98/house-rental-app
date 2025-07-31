// server.js or index.js
import express from "express"
import mongoose  from "mongoose";
import dotenv from "dotenv"
import cors from "cors"
import listingRoutes from './routes/listing.route.js';
import authRoutes from './routes/auth.route.js'; 


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);


app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true, 
}));

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err.message));


app.use('/api/listing.route.js', listingRoutes);
app.use('/api/auth', authRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
