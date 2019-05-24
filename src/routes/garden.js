import { Router } from 'express';
import mongoose from 'mongoose';
import { isAuthenticated } from '../config/authJwt';
import { queryPlantDetails } from '../config/usda';
import crypto from 'crypto';
import mongodb from 'mongodb';
import { resolve } from 'url';
import colors from 'colors';

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
  console.log('this is the user: ', uidHash);
  // const userId = req.authData.userId;
  // const user = await User.findById(userId);

  /* NOTE: Uncomment after Add to MyGarden has been implemented */
  // get the garden id on this user
  const gardenId = user.gardenId;
  const garden = await req.context.models.Garden.findById(gardenId);

  return res.json(garden.plants);
};

const findPlantHelper = async (sciName) => {
  const plant = await Plant.findOne({ scientificName: sciName });
  if (!plant) {
    const newPlant = await queryPlantDetails(sciName);
    if (newPlant) {
      console.log('LOG: Following plant queried from USDA API: '.yellow, newPlant);
      return newPlant
    }
    return null;    // weird
  }
  console.log(`Plant: ${sciName} found in the local db in Plants collection`.yellow);
  return new Promise(resolve => resolve(plant));    // Returns a promise to match type of the 'return newPlant' statement
}

const addPersonalPlant = async (req, res) => {
  // Extract scientific name of plant from request
  const sciName = req.body.sciName;
  const nickname = req.body.nickname;

  findPlantHelper(sciName)
    .then((foundPlant) => { return { resJson: res.bind(res), foundPlant: foundPlant } })
    .then(async function (utilObj) {
      const { resJson, foundPlant } = utilObj;
      const addedPlant = await new Plant(foundPlant).save();

      console.log(`LOG: Following plant added to db in Plants collection`.yellow, addedPlant);

      let personalPlant;
      try {
        // Create the user's personal plant
        personalPlant = await new PersonalPlant({
          plant_id: addedPlant._id,
          nickname: nickname,
        }).save();
      } catch (e) {
        console.log(`ERROR: Could not add ${nickname} plant to PersonalPlant collection`, e);
        resJson.status(404).send({success: false, msg: `ERROR: Could not add PersonalPlant because the current nickname: ${nickname} already exists`});
      }

      console.log(`LOG: Following personalPlant added to db in PersonalPlants collection`.yellow, personalPlant);

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

      const garden = await Garden.findById(gId);
      console.log('\n\n GARDEN ID: ' + gId);

      await garden.plants.push(personalPlant);
      console.log(`LOG: Following PersonalPlant added to user: ${user._id}'s Garden: ${gId}`.yellow, personalPlant);

      garden.save(error => {
        if (error) {
          resJson({ msg: `ERROR: Could not add ${sciName}-${nickname} plant in Garden`, error: error });
          // .// writeHead(404)
        } else {
          console.log(`SUCCESS: Successfully added ${sciName}-${nickname} plant to Garden`.green);
          resJson({ msg: `SUCCESS: Successfully added ${sciName}-${nickname} plant to Garden` });
          // .writeHead(200)
        }
      });
    });


};

const removePersonalPlant = async (req, res) => {
  // get the id of the personalPlant to remove
  let nicknameToRemove;
  if (req.body) {
    nicknameToRemove = req.body.nickname;
  }

  // User id of the current user
  let userId = req.authData.userId;
  const uidHash = crypto
    .createHmac('sha256', userId.toString())
    .digest('hex')
    .slice(0, 24);

  const currentUser = await User.findById(uidHash);
  let gId = currentUser.gardenId;
  const garden = await Garden.findById(gId);

  console.log('Passed in params:', nicknameToRemove);

  // fetch the plant to be removed from PersonalPlant collection
  const plantToBeRemoved = await PersonalPlant.findOneAndDelete({ nickname: nicknameToRemove });

  if (!plantToBeRemoved) {
    console.log(`ERROR: Plant to be removed cannot be found in the PersonalPlant collection`.red, plantToBeRemoved);
    res.status(404).send({ msg: `ERROR: Plant to be removed cannot be found in the PersonalPlant collection`, success: false });
    return;   // weird function doesn't end by res
  }

  console.log(`LOG: Plant to be removed has been removed from the PersonalPlant collection`.yellow, plantToBeRemoved);

  // Remove the personalPlant
  const updatedGarden = await garden.plants.pull(plantToBeRemoved._id);
  garden.save(error => {
    if (error) {
      res.status(404).send({ msg: `ERROR: Could not find ${nicknameToRemove} plant in Garden`, error: error, success: false });
    } else {
      console.log(`SUCCESS: Plant to be removed has been removed from the PersonalPlant collection`.green, plantToBeRemoved);
      res.status(200).send({ msg: `SUCCESS: Successfully removed ${nicknameToRemove} plant from Garden`, success: true });
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
