// backend/routes/listing.js
import express from 'express';
import Listing from '../models/listing.model.js';
import verifyToken from '../utils/verifyUser.js';

const router = express.Router();



// CREATE A LISTING
router.post('/create', verifyToken, async (req, res) => {
  try {
    const newListing = new Listing(req.body);
    const savedListing = await newListing.save();
    res.status(201).json(savedListing);
  } catch (error) {
    console.error('Error creating listing:', error.message);
    res.status(500).json({ error: 'Failed to create listing', message: error.message });
  }
});

export default router;
