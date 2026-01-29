// controllers/authController.js
import asyncHandler from 'express-async-handler';
import validator from 'validator';
import User from '../models/User.js';


export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !validator.isLength(name.trim(), { min: 2, max: 100 })) {
    res.status(400);
    throw new Error('Name must be between 2 and 100 characters');
  }

  if (!email || !validator.isEmail(email)) {
    res.status(400);
    throw new Error('Please provide a valid email address');
  }

  if (!password || password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters long');
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    res.status(400);
    throw new Error('Email is already in use');
  }

  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
  });

  return res.status(201).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
});


export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !validator.isEmail(email)) {
    res.status(400);
    throw new Error('Please provide a valid email address');
  }

  if (!password) {
    res.status(400);
    throw new Error('Password is required');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid email or password');
  }
  return res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
});