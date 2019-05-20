import { Router } from 'express';
import { queryPlantDetails } from '../config/usda';
var request = require('request');

const router = Router();

router.get('/', async function(req, res) {
  const resp = await queryPlantDetails('Persea americana', body => {
    res.json(body);
  });
});

export default router;
