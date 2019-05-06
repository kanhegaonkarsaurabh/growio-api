import mongoose from 'mongoose';

import User from './user';
import Garden from './garden';

const connectDb = () => {
  return mongoose.connect(process.env.DATABASE_URL);
};

const models = { User, Garden };

export { connectDb };

export default models;
