import mongoose from 'mongoose';
import { personalPlantSchema } from './personalPlant';

const gardenSchema = new mongoose.Schema({
  name: {
    type: String,
    default: null, // for now, will eventually be _____'s Garden
  },
  plants: [personalPlantSchema],
});

const Garden = mongoose.model('Garden', gardenSchema);

export default Garden;
