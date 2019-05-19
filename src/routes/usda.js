import { Router } from 'express';
//import { queryPlantDetails } from '../config/usda';
var request = require('request');

const router = Router();

router.get('/', async function(req, res) {
  request('http://plantsdb.xyz/search?Genus=Abutilon&Species=abutiloides', function(
    error,
    response,
    body,
  ) {
    if (error) {
      console.log(error);
    }
    console.log(body);
    res.json(body);
  });
});

export default router;
