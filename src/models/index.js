import mongoose from 'mongoose';

import User from './user';
import Garden from './garden';
import Plant from './plant';

import {PersonalPlant} from './personalPlant';
import PlantOfTheWeek from './plantOfTheWeek';

const connectDb = () => {
  return mongoose.connect(process.env.DATABASE_URL);
};

const models = { User, Garden, Plant, PersonalPlant, PlantOfTheWeek };

export { connectDb };

export default models;
