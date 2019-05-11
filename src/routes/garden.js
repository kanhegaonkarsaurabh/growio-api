import { Router } from 'express';
import { isAuthenticated } from '../config/authJwt';
const router = Router();

const getPersonalPlants = async (req, res) => {
  // userId of the user who's authenticated right now .....
  const userId = req.authData.userId;
  const user = await req.context.models.User.findById(userId);

  /* NOTE: Uncomment after Add to MyGarden has been implemented */
  // // get the garden id on this user
  // const gardenId = user.gardenId;
  // const garden = await req.context.models.Garden.findById(gardenId);

  // return res.send(garden.plants);
};

router
  .route('/plants')
  .all(isAuthenticated)
  .get(getPersonalPlants);

export default router;
