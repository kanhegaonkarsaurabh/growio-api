import { Router } from 'express';
import mongoose from 'mongoose';
import { isAuthenticated } from '../config/authJwt';
import { queryPlantDetails } from '../config/usda';
import crypto from 'crypto';
import mongodb from 'mongodb';
import { resolve } from 'url';
import colors from 'colors';
import { uniqueObjectIdHash } from '../config/util';
import { removeFromCloudinary, uploadToCloudinary } from '../config/cloudinary';

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
  const uidHash = uniqueObjectIdHash(userId.toString());

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

router
  .route('/plants')
  .all(isAuthenticated)
  .get(getPersonalPlants);


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

  const imageUrl = req.body.imageUrl ? req.body.imageUrl : null;

  findPlantHelper(sciName)
    .then((foundPlant) => { return { resEnd: res.end.bind(res), resSend: res.send.bind(res), resStatus: res.status.bind(res), resWriteHead: res.writeHead.bind(res), foundPlant: foundPlant } })
    .then(async function (utilObj) {
      const { resStatus, resEnd, resSend, foundPlant, resWriteHead } = utilObj;
      const addedPlant = await new Plant(foundPlant).save();

      console.log(`LOG: Following plant added to db in Plants collection`.yellow, addedPlant);

      console.log(`LOG: Following personalPlant added to db in PersonalPlants collection`.yellow, personalPlant);

      // User id of the current user
      let userId = req.authData.userId;
      const uidHash = uniqueObjectIdHash(userId.toString());

      // console.log(req.authData);
      const user = await User.findById(uidHash);
      console.log('\n\n\n\n user: ' + user._id);

      // Create the unique nickname key by adding nickname + user_id
      let uniqueNicknameKey = uniqueObjectIdHash(nickname + (user._id.toString()));
      let personalPlant;
      try {

        const plantUrl = null;
        // Upload plant image to cloudinary and retrieve the url
        if (imageUrl) {
          plantUrl = uploadToCloudinary(imageUrl);
        }

        // Create the user's personal plant
        personalPlant = await new PersonalPlant({
          plant_id: addedPlant._id,
          nickname: nickname,
          nickname_key: new ObjectId(uniqueNicknameKey),
          plant_image: plantUrl
        }).save();
        
      } catch (e) {
        console.log(`ERROR: Could not add ${nickname} plant to PersonalPlant collection`, e);
        resStatus(404);
        resSend({ success: false, msg: `ERROR: Could not add PersonalPlant because the current nickname: ${nickname} already exists` });
        //resEnd();
        return;
      }

      // get the garden id of the user
      let gId = user.gardenId;

      const garden = await Garden.findById(gId);
      console.log('\n\n GARDEN ID: ' + gId);

      await garden.plants.push(personalPlant);
      console.log(`LOG: Following PersonalPlant added to user: ${user._id}'s Garden: ${gId}`.yellow, personalPlant);

      garden.save(error => {
        if (error) {
          resStatus(404);
          resSend({ msg: `ERROR: Could not add ${sciName}-${nickname} plant in Garden`, error: error });
          //resEnd();
          return;
          // .// writeHead(404)
        } else {
          console.log(`SUCCESS: Successfully added ${sciName}-${nickname} plant to Garden`.green);
          resStatus(200);
          resSend({ msg: `SUCCESS: Successfully added ${sciName}-${nickname} plant to Garden` });
          //resEnd();
          return;
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

  // Generate the unique nickname_key that we can use to query personalPlant
  const uniqueNicknameKey = uniqueObjectIdHash(nicknameToRemove + currentUser._id.toString());

  // fetch the plant to be removed from PersonalPlant collection
  const plantToBeRemoved = await PersonalPlant.findOneAndDelete({ nickname_key: new ObjectId(uniqueNicknameKey) });

  // remove the plant's image from cloudinary
  const result = removeFromCloudinary(plantToBeRemoved.plant_image);

  // TODO: run check for if the removal from cloudinary fails

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
  .route('/plant')
  .all(isAuthenticated)
  .post(addPersonalPlant)
  .delete(removePersonalPlant);


const updateNickname = async (req, res) => {
  // get the id of the personalPlant to remove
  let oldNickname, newNickname;
  if (req.body) {
    oldNickname = req.body.oldNickname;
    newNickname = req.body.newNickname;

    // Initial check to see that oldNickname and newNickname is not the same
    if (oldNickname === newNickname) {
      res.status(200);
      res.send({msg: 'ERROR: oldNickname and newNickname cannot be the same', success: false});
      return;
    }
  }

  // User id of the current user
  let userId = req.authData.userId;
  const uidHash = uniqueObjectIdHash(userId.toString());

  const currentUser = await User.findById(uidHash);
  let gId = currentUser.gardenId;
  const garden = await Garden.findById(gId);

  console.log('Passed in params:', oldNickname, newNickname);

  // Generate the unique nickname_key that we can use to query the old (not updated) personalplant
  const oldUniqueNicknameKey = uniqueObjectIdHash(oldNickname + currentUser._id.toString());

  // fetch the plant to be removed from PersonalPlant collection
  const plantToBeUpdated = await PersonalPlant.findOne({ nickname_key: new ObjectId(oldUniqueNicknameKey) });

  if (!plantToBeUpdated) {
    console.log(`ERROR: Nickname of the Plant to be updated cannot be found in the PersonalPlant collection`.red);
    res.status(404).send({ msg: `Nickname of the Plant to be updates cannot be found in the PersonalPlant collection`, success: false });
    return;   // weird function doesn't end by res
  }

  // Remove the personalPlant with old nickname from the user's garden first
  const updatedGarden = await garden.plants.pull(plantToBeUpdated._id);

  // Generate a new nickname key on the basis of the new nickname to user wants
  const newUniqueNicknameKey = uniqueObjectIdHash(newNickname + currentUser._id.toString());

  // Update the plant with the new nickname in the PersonalPlant collection
  const updatedPersonalPlant = await PersonalPlant.findOneAndUpdate(
    {_id: plantToBeUpdated._id},  // find it using _id and not nickname because we're updating nickname. Thus, avoid clashes
    {$set:{nickname_key: new ObjectId(newUniqueNicknameKey), nickname: newNickname}}, 
    {upsert: true, new: true});

  // Push this new personalPlant to the user's garden and send the user the updated garden
  const newGarden = await garden.plants.push(updatedPersonalPlant);

  console.log(`LOG: Following PersonalPlant with updated nickname added to user: ${currentUser._id}'s Garden: ${gId}`.yellow, updatedPersonalPlant);

  garden.save(error => {
    if (error) {
      res.status(404);
      res.send({ msg: `ERROR: Could not add ${oldNickname} plant in Garden`, error: error, success: false });
      //resEnd();
      return;
      // .// writeHead(404)
    } else {
      console.log(`SUCCESS: Successfully updated nickname:${oldNickname} with ${newNickname} for plant ${plantToBeUpdated._id} in user's garden`.green);
      res.status(200);
      res.send({ msg: `Successfully updated nickname:${oldNickname} with ${newNickname} for plant ${plantToBeUpdated._id} in user's garden`, garden: newGarden, success: true });
      //resEnd();
      return;
      // .writeHead(200)
    }
  });
}

// Adding another route to make it more clear
router
  .route('/plant/nickname')
  .all(isAuthenticated)
  .put(updateNickname)

export default router;