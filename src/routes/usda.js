import { Router } from 'express';
import { queryPlantDetails } from '../config/usda';

const router = Router();

router.get('/usda', async function(req, res) {
  const ret = queryPlantDetails('omg');
  return ret;
});
