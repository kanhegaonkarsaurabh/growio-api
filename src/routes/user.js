import { Router } from 'express';

const router = Router();

const getUsers = async (req, res) => {
  const users = await req.context.models.User.find();
  return res.send(users);
}

const getUser = async (req, res) => {
  const user = await req.context.models.User.findById(
    req.params.userId,
  );
  return res.send(user);
}

router.route('/')
      .get(getUsers);

router.route('/:userId')
      .get(getUser);

export default router;
