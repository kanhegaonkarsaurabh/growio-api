import { Router } from 'express';
import mongoose from 'mongoose';
import { isAuthenticated } from '../config/authJwt';
const router = Router();

const User = mongoose.model('User');
const Plant = mongoose.model('Plant');
const Garden = mongoose.model('Garden');
const PersonalPlant = mongoose.model('PersonalPlant');

const getPersonalPlants = async (req, res) => {
  // userId of the user who's authenticated right now .....
  const userId = req.authData.userId;
  const user = await User.findById(userId);

  /* NOTE: Uncomment after Add to MyGarden has been implemented */
  // // get the garden id on this user
  // const gardenId = user.gardenId;
  // const garden = await req.context.models.Garden.findById(gardenId);

  // return res.send(garden.plants);
};

const addPersonalPlant = async (req, res) => {
  // Extract scientific name of plant from request
  const sciName = req.body.sciName;

  // check if the plant exists in the plant collection
  let foundPlant = await Plant.find({ scientificName: sciName });

  // if not found, add to plant collection
  if (!foundPlant) {
    // TODO: Query USDA api for the details
  }

  let plantId = foundPlant._id;

  // Create the user's personal plant
  const personalPlant = await new PersonalPlant({
    plant_id: plantId,
    nickname: req.body.nickname,
  }).save();

  // User id of the current user
  let userId = req.authData.userId;
  const user = User.findById(userId);

  // get the garden id of the user
  let gId = user.gardenId;

  const garden = await Garden.findOneAndUpdate({ _id: gId }, { $push: { plants: personalPlant } });
  res.status(200).send({
    plants: garden.plants,
    msg: 'Plant added to garden',
  });
};

router
  .route('/plants')
  .all(isAuthenticated)
  .get(getPersonalPlants);

router.route('/plant').post(addPersonalPlant);

export default router;
