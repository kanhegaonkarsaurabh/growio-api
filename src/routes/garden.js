import { Router } from 'express';
import mongoose from 'mongoose';
import { isAuthenticated } from '../config/authJwt';
import { queryPlantDetails } from '../config/usda';
import crypto from 'crypto';
import mongodb from 'mongodb';

const router = Router();

const User = mongoose.model('User');
const Plant = mongoose.model('Plant');
const Garden = mongoose.model('Garden');
const PersonalPlant = mongoose.model('PersonalPlant');
const ObjectId = mongodb.ObjectID;

const getPersonalPlants = async (req, res) => {
  // userId of the user who's authenticated right now .....

  // User id of the current user
  let userId = req.authData.userId;
  const uidHash = crypto
    .createHmac('sha256', userId.toString())
    .digest('hex')
    .slice(0, 24);

  // console.log(req.authData);
  const user = await User.findById(uidHash);

  // const userId = req.authData.userId;
  // const user = await User.findById(userId);

  /* NOTE: Uncomment after Add to MyGarden has been implemented */
  // get the garden id on this user
  const gardenId = user.gardenId;
  const garden = await req.context.models.Garden.findById(gardenId);

  return res.send(garden.plants);
};

const addPersonalPlant = async (req, res) => {
  // Extract scientific name of plant from request

  console.log('i hate s, ', req.body);

  const sciName = req.body.sciName;
  const nickname = req.body.nickname;

  // check if the plant exists in the plant collection
  let foundPlant = await Plant.findOne({ scientificName: sciName });

  // if not found, add to plant collection
  if (!foundPlant) {
    // get the object that has the information we need
    // based on the query to USDA database
    console.log('here bitch');
    await queryPlantDetails(sciName, async JSONobj => {
      // Create a plant object
      const newPlant = await new Plant(JSONobj).save();

      // TODO: put this plant into the database
      await Plant.push(newPlant);

      // so that we can refer to it later on
      foundPlant = newPlant;
    });
    console.log('here bitch2');
  }

  //  TODO
  // OK HOES WHAT'S HAPPENING IS THAT FOUND PLANT IS NULL AFTER THE FIRST TIME
  // YOU RUN THE IF STATEMENT ABOVE. I THINK IT'S BECAUSE THE DATABASE ISN'T
  // RELOADING? IS THAT A THING

  // Plant = mongoose.model('Plant');

  // find it again because i don't think line 63 is working -dar
  //foundPlant = await Plant.findOne({ scientificName: sciName });
  //console.log('Found plant: ', foundPlant.id);
  //console.log('Found plant: ', foundPlant);
  //console.log('\n\nwtf - ' + foundPlant);
  //let plantId = foundPlant._id;

  // Create the user's personal plant
  const personalPlant = await new PersonalPlant({
    plant_id: foundPlant._id,
    nickname: nickname,
  }).save();

  // User id of the current user
  let userId = req.authData.userId;
  const uidHash = crypto
    .createHmac('sha256', userId.toString())
    .digest('hex')
    .slice(0, 24);

  // console.log(req.authData);
  const user = await User.findById(uidHash);
  console.log('\n\n\n\n user: ' + user._id);

  // get the garden id of the user
  let gId = user.gardenId;

  //GARDEN ID: " + gId);

  const garden = await Garden.findById(gId);
  console.log('\n\n GARDEN ID: ' + gId);

  await garden.plants.push(personalPlant);

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
