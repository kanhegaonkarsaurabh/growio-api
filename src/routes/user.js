import { Router } from 'express';
import mongoose from 'mongoose';


import { isAuthenticated } from '../config/authJwt';
import { uniqueObjectIdHash } from '../config/util';

const User = mongoose.model('User');
const router = Router();

const getUsers = async (req, res) => {
  const users = await req.context.models.User.find();
  return res.send(users);
};

const getUser = async (req, res) => {
  const user = await req.context.models.User.findById(req.params.userId);
  return res.send(user);
};


router
  .route('/')
  .all(isAuthenticated)
  .get(getUsers);

router
  .route('/:userId')
  .all(isAuthenticated)
  .get(getUser);


const updateUserNotifications = async (req, res) => {
  // Get the request body from the api 
  let notificationValue;
  if (req.body && req.body.notifications !== undefined) {
    notificationValue = req.body.notifications;
  } else {
    res.status(404);
    res.send({msg: 'ERROR: notifications param not present on the request body', success: false, data: {}});
  }

  // get the currently logged in user's id
  let userId = req.authData.userId;
  const uidHash = uniqueObjectIdHash(userId.toString());

  try {
    // update the notification settings
    const updatedUser = await User.findByIdAndUpdate(uidHash, { settings: { notifications: notificationValue } }, { new: true });

    res.status(200);
    res.send({ msg: `SUCCESS: Successfully updated user: ${userId} notifications settings to ${notificationValue}`, data: updatedUser, success: true });
  } catch (e) {
    res.status(404);
    res.send({ msg: "ERROR: Error in updating user's settings", success: false });
  }
}

router.route('/settings')
  .all(isAuthenticated)
  .put(updateUserNotifications);

const updateUserLocation = async (req, res) => {
  // get the new location of the user
  let userLoc;
  if (req.body) {
    userLoc = req.body.coordinates;
  }

  // get currently logged in user's id
  let userId = req.authData.userId;
  const uidHash = uniqueObjectIdHash(userId.toString());

  try {
    const updatedUser = await User.findByIdAndUpdate(uidHash, { location: { coordinates: userLoc } }, { new: true });

    res.status(200);
    res.send({ msg: `SUCCESS: Successfully updated user: ${userId} location to ${userLoc}`, data: updatedUser, success: true });
  } catch (e) {
    res.status(404);
    res.send({ msg: "ERROR: Error in updating user's location", success: false, error: e });
  }
}

router.route('/location')
  .all(isAuthenticated)
  .put(updateUserLocation)

export default router;
