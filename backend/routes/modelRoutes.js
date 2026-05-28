import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
    saveModelFromExperiment,
    getModels,
    deleteModel,
} from '../controllers/modelController.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getModels);
router.post('/save', saveModelFromExperiment);
router.delete('/:id', deleteModel);

export default router;
