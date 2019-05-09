import { Router } from 'express';
import { checkTokenMiddleware, verifyToken } from '../config/authJwt';
const router = Router();

router.get('/plants', checkTokenMiddleware, async function (req, res) {
  verifyToken(req, res);
  if (null === req.authData) {
    res.sendStatus(403);
  } 
  
  // userId of the user who's authenticated right now .....
  const userId = res.authData.userId;
  const user = await req.context.models.User.findById(userId);

  // get the garden id on this user
  const gardenId = user.gardenId;
  const garden = await req.context.models.Garden.findById(gardenId);

  return res.send(garden.plants);
});

export default router;