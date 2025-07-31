import User from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { errorHandler } from '../utils/error.js';

// Helper function to generate JWT
const createToken = (userId) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not defined in environment');

  return jwt.sign({ id: userId }, secret, { expiresIn: '7d' });
};

// User Sign-Up
export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return next(errorHandler(400, 'All fields are required'));
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return next(errorHandler(409, 'Email already registered'));

    const hashedPassword = bcryptjs.hashSync(password, 10);

    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ success: true, message: 'User created successfully!' });
  } catch (error) {
    next(error);
  }
};

// User Sign-In
export const signin = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(errorHandler(400, 'Email and password are required'));
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return next(errorHandler(404, 'User not found'));

    const isPasswordCorrect = bcryptjs.compareSync(password, user.password);
    if (!isPasswordCorrect) return next(errorHandler(401, 'Invalid credentials'));

    const token = createToken(user._id);
    const { password: _, ...userData } = user._doc;

    res
      .cookie('access_token', token, {
        httpOnly: true,
        sameSite: 'Strict',
        secure: process.env.NODE_ENV === 'production',
      })
      .status(200)
      .json({ success: true, user: userData });
  } catch (error) {
    next(error);
  }
};

// Google Sign-In
export const google = async (req, res, next) => {
  const { email, name, photo } = req.body;

  if (!email || !name) {
    return next(errorHandler(400, 'Email and name are required from Google'));
  }

  try {
    let user = await User.findOne({ email });

    if (user) {
      const token = createToken(user._id);
      const { password: _, ...userData } = user._doc;

      return res
        .cookie('access_token', token, {
          httpOnly: true,
          sameSite: 'Strict',
          secure: process.env.NODE_ENV === 'production',
        })
        .status(200)
        .json({ success: true, user: userData });
    }

    const generatedPassword =
      Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
    const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);

    const username = name.trim().toLowerCase().replace(/\s+/g, '') + Math.floor(Math.random() * 10000);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      avatar: photo || '',
    });

    await newUser.save();

    const token = createToken(newUser._id);
    const { password: _, ...userData } = newUser._doc;

    res
      .cookie('access_token', token, {
        httpOnly: true,
        sameSite: 'Strict',
        secure: process.env.NODE_ENV === 'production',
      })
      .status(200)
      .json({ success: true, user: userData });
  } catch (error) {
    next(error);
  }
};

// Sign-Out
export const signOut = (_req, res, next) => {
  try {
    res.clearCookie('access_token');
    res.status(200).json({ success: true, message: 'User has been logged out!' });
  } catch (error) {
    next(error);
  }
};
