import { Router } from 'express';
import mongoose from 'mongoose';
import { isAuthenticated } from '../config/authJwt';
import { uploadToCloudinary } from './plant';
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
  const nickname = req.body.nickname;

  // Extract image url from request
  const imageUrl = req.body.imageUrl;
  // upload the image to cloudinary and store the url of where it is stored
  const plantUrl = uploadToCloudinary(imageUrl);

  // check if the plant exists in the plant collection
  let foundPlant = await Plant.findOne({ scientificName: sciName });

  // if not found, add to plant collection
  if (!foundPlant) {
    // TODO: Query USDA api for the details
  }
  console.log('Found plant: ', foundPlant.id);
  console.log('Found plant: ', foundPlant);
  let plantId = foundPlant._id;

  // Create the user's personal plant
  const personalPlant = await new PersonalPlant({
    plant_id: plantId,
    nickname: nickname,
    plant_url: plantUrl,
  }).save();

  // User id of the current user
  let userId = req.authData.userId;
  const user = User.findById(userId);

  // get the garden id of the user
  let gId = user.gardenId;

  const garden = await Garden.findById(gId);
  garden.plants.push(personalPlant);
  garden.save(error => {
    if (error) {
      res
        .sendStatus(404)
        .send({ msg: `ERROR: Could not add ${sciName}-${nickname} plant in Garden` });
    } else {
      res
        .sendStatus(200)
        .send({ msg: `SUCCESS: Successfully added ${sciName}-${nickname} plant to Garden` });
    }
  });
};

const removePersonalPlant = async (req, res) => {
  // get the id of the personalPlant to remove
  let nicknameToRemove;
  if (req.body && req.body.data) {
    nicknameToRemove = req.body.data.nickname;
  }

  const currentUser = User.findById(req.authData.userId);
  let gId = user.gardenId;
  const garden = await Garden.findById(gId);

  // Remove the personalPlant
  garden.plants.pull({ nickname: nicknameToRemove });
  garden.save(error => {
    if (error) {
      res
        .sendStatus(404)
        .send({ msg: `ERROR: Could not find ${nicknameToRemove} plant in Garden` });
    } else {
      res
        .sendStatus(200)
        .send({ msg: `SUCCESS: Successfully removed ${nicknameToRemove} plant from Garden` });
    }
  });
};

router
  .route('/plants')
  .all(isAuthenticated)
  .get(getPersonalPlants);

router
  .route('/plant')
  .all(isAuthenticated)
  .post(addPersonalPlant)
  .delete(removePersonalPlant);

export default router;
