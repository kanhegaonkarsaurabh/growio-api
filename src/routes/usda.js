/* Important Note: This is a test route and should not be exposed to the frontend */
import { Router } from 'express';
import { queryPlantDetails } from '../config/usda';
var request = require('request');

const router = Router();

router.get('/', async function(req, res) {
  const resp = await queryPlantDetails('Acacia melanoxylon', 'sciName', body => {
    var resJson = res.json(body);
  });
});

export default router;
