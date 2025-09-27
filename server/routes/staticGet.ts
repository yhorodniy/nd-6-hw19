import express, { Request, Response } from 'express';
import path from 'path';
import { CLIENT_INDEX } from '../config/paths';

const router = express.Router();
const reactAppPath = CLIENT_INDEX;

router.get('/', (req: Request, res: Response) => {
    try {
        res.sendFile(reactAppPath);
    } catch (error) {
        res.status(404).json({ error: 'React app not found' });
    }
});

export default router;
