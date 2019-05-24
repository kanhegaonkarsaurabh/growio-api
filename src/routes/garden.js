import { Router } from 'express';
import mongoose from 'mongoose';
import { isAuthenticated } from '../config/authJwt';
import { queryPlantDetails } from '../config/usda';
import crypto from 'crypto';
import mongodb from 'mongodb';
import { resolve } from 'url';

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

const findPlantHelper = async (sciName) => {
  const plant = await Plant.findOne({ scientificName: sciName });
  if (!plant) {
    const newPlant = await queryPlantDetails(sciName);
    if (newPlant) {
      return newPlant
    }
    return null;    // weird
  }
  return new Promise(resolve => resolve(plant));    // Returns a promise to match type of the 'return newPlant' statement
}

const addPersonalPlant = async (req, res) => {
  // Extract scientific name of plant from request
  const sciName = req.body.sciName;
  const nickname = req.body.nickname;

  findPlantHelper(sciName)
    .then((foundPlant) => { return {resJson: res.json.bind(res), foundPlant: foundPlant} })
    .then(async function (utilObj) {
      // console.log('this is done', utilObj.resJson);
      const {resJson, foundPlant} = utilObj;
      console.log('This is the found plant: ', foundPlant);
      const addedPlant = await new Plant(foundPlant).save();

      console.log('Plant added: ', addedPlant);

      // Create the user's personal plant
      const personalPlant = await new PersonalPlant({
        plant_id: addedPlant._id,
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
          resJson({ msg: `ERROR: Could not add ${sciName}-${nickname} plant in Garden` });
            // .// writeHead(404)
        } else {
          resJson({ msg: `SUCCESS: Successfully added ${sciName}-${nickname} plant to Garden` });
            // .writeHead(200)
        }
      });
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
