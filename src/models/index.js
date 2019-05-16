import mongoose from 'mongoose';

import User from './user';
import Garden from './garden';
import Plant from './plant';
import PersonalPlant from './personalPlant';

const connectDb = () => {
  return mongoose.connect(process.env.DATABASE_URL);
};

const models = { User, Garden, Plant, PersonalPlant };

export { connectDb };

export default models;
