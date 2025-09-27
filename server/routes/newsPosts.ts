import express from 'express';
import { 
    getNewsPosts, 
    getSinglePost, 
    createPost, 
    updatePost, 
    deletePost,
    getCategories,
} from '../controller/newspostsController';
import { authenticateToken, optionalAuth } from '../helpers/auth';

const router = express.Router();

router.get('/categories', getCategories);

router.get('/', optionalAuth, getNewsPosts);
router.get('/:id', optionalAuth, getSinglePost);

router.post('/', authenticateToken, createPost);
router.put('/:id', authenticateToken, updatePost);
router.delete('/:id', authenticateToken, deletePost);

export default router;
