import { Request, Response, NextFunction } from 'express';
import { LoggingService } from '../services/LoggingService';

const loggingService = new LoggingService();

export const createLog = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const logData = req.body;

    if (!logData) {
      return res.status(400).json({ error: 'Log data is required' });
    }

    const result = await loggingService.logMessage(logData);

    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};
