import express from 'express';
import { google, signOut, signin, signup } from '../controllers/auth.controller.js';

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post('/google', google);
router.get('/signout', signOut)

router.get('/signout', (req, res) => {
  res.clearCookie('access_token'); // or whatever cookie/token you're using
  return res.status(200).json({ message: 'User signed out' });
});

export default router;