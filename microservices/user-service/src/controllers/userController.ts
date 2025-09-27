import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/UserService';

const userService = new UserService();

export const createUser = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { email, password, confirmPassword } = req.body;

    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Email, password, and confirmPassword are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const result = await userService.createUser({ email, password });

    return res.status(201).json({
      message: 'User created successfully',
      token: result.token,
      user: result.user
    });
  } catch (error: any) {
    if (error.message === 'User with this email already exists') {
      return res.status(409).json({ error: error.message });
    }
    next(error);
  }
};

export const loginUser = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await userService.loginUser(email, password);

    return res.status(200).json({
      message: 'Login successful',
      token: result.token,
      user: result.user
    });
  } catch (error: any) {
    if (error.message === 'Invalid email or password') {
      return res.status(401).json({ error: error.message });
    }
    next(error);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const user = await userService.getUserById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};
