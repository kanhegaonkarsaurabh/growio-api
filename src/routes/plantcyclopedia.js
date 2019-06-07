import { Router } from 'express';
import { parse } from 'querystring';
import mongoose from 'mongoose';
import { queryPlantDetails } from '../config/usda';
import { getPlantImage } from '../utils/scrape';
import { isAuthenticated } from '../config/authJwt';

const router = Router();

const searchPlantsInUSDA = async (req, res) => {
  // extract the query to search and the searchBy field
  let searchPlant, searchBy;
  if (req.query) {
    searchPlant = req.query.searchPlant;
    searchBy = req.query.searchBy;
  }

  if (searchBy == 'sciName' || searchBy == 'commonName') {
    // Pass these values and query USDA api and fetch details
    try {
      const foundPlant = await queryPlantDetails(searchPlant, searchBy);
      console.log(`LOG: Using the search query ${searchPlant} and searching by ${searchBy}, the following plant was found`, foundPlant);

      // Scrape and get an image for the plant from USDA's website
      getPlantImage(foundPlant.symbol)
        .then(imgScraped => {
          console.log(imgScraped);
          if (imgScraped) {
            foundPlant.img = imgScraped;
          } else {
            foundPlant.img = null;
          }
          
          // return the plant found if search was successful
          res.status(200);
          res.send({ msg: 'SUCCESS: The following plant was found in the plantcyclopedia', data: foundPlant, success: true });
        })
    } catch (e) {   // catch errors if search was unsuccessful
      res.status(404);
      res.send({ msg: 'NOT FOUND: Could not find any plants that match the search query in Plantcyclopedia', success: false, data: {} });
    }
  } else {
    res.status(404);
    res.send({ msg: 'ERROR: Currently Plantcyclopedia can only be searchedBy sciName or commonName. Please pass correct query params', success: false });
  }
}

router.route('/search')
  .all(isAuthenticated)
  .get(searchPlantsInUSDA);


export default router;