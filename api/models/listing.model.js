// backend/models/listing.model.js
import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  address: String,
  bedrooms: Number,
  bathrooms: Number,
  regularPrice: Number,
  discountPrice: Number,
  furnished: Boolean,
  parking: Boolean,
  offer: Boolean,
  type: { type: String, enum: ['rent', 'sale'], required: true },
  imageUrls: [String],
  userRef: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const Listing = mongoose.model('Listing', listingSchema);

export default Listing;
