import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { redisClient } from './redisClient';
import { UserCreateRequest, LoginResponse } from '../types';

export class UserService {
  private static readonly SALT_ROUNDS = 10;
  private static readonly JWT_SECRET = process.env.JWT_SECRET || '1234567890abcdef';
  private static readonly JWT_EXPIRES_IN = '7d';

  async createUser(userData: UserCreateRequest): Promise<LoginResponse> {
    try {
      // Перевіряємо чи існує користувач
      const existingUser = await redisClient.get(`user:email:${userData.email}`);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Хешуємо пароль
      const passwordHash = await bcrypt.hash(userData.password, UserService.SALT_ROUNDS);

      // Створюємо користувача
      const user = new User(userData.email, passwordHash);

      // Зберігаємо в Redis (зберігаємо всі дані включно з passwordHash)
      const fullUserData = {
        id: user.id,
        email: user.email,
        passwordHash: user.passwordHash,
        createdAt: user.createdAt
      };
      await redisClient.set(`user:${user.id}`, JSON.stringify(fullUserData));
      await redisClient.set(`user:email:${user.email}`, user.id);

      // Публікуємо повідомлення для логування
      await redisClient.publish('user:created', JSON.stringify({
        action: 'user_created',
        userId: user.id,
        email: user.email,
        timestamp: new Date().toISOString()
      }));

      // Генеруємо JWT токен
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email 
        },
        UserService.JWT_SECRET,
        { expiresIn: UserService.JWT_EXPIRES_IN }
      );

      return {
        token,
        user: user.toJSON()
      };
    } catch (error) {
      throw error;
    }
  }

  async loginUser(email: string, password: string): Promise<LoginResponse> {
    try {
      // Отримуємо ID користувача за email
      const userId = await redisClient.get(`user:email:${email}`);
      if (!userId) {
        throw new Error('Invalid email or password');
      }

      // Отримуємо дані користувача
      const userData = await redisClient.get(`user:${userId}`);
      if (!userData) {
        throw new Error('Invalid email or password');
      }

      const user = JSON.parse(userData);

      // Перевіряємо пароль
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Генеруємо JWT токен
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email 
        },
        UserService.JWT_SECRET,
        { expiresIn: UserService.JWT_EXPIRES_IN }
      );

      // Публікуємо повідомлення для логування
      await redisClient.publish('user:logged_in', JSON.stringify({
        action: 'user_logged_in',
        userId: user.id,
        email: user.email,
        timestamp: new Date().toISOString()
      }));

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.createdAt
        }
      };
    } catch (error) {
      throw error;
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      const userData = await redisClient.get(`user:${userId}`);
      if (!userData) {
        return null;
      }

      return JSON.parse(userData);
    } catch (error) {
      throw error;
    }
  }
}
