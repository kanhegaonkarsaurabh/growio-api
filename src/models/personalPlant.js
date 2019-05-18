import mongoose from 'mongoose';

export const personalPlantSchema = new mongoose.Schema({
  plant_id: {
    type: Number, // or whatever we end up using (String from USDA)
    required: true,
  },
  nickname: {
    type: String,
    default: null, // will by default be the common name of the plant
  },
  plant_url: {
    type: String,
    default: null,
  },
});

export const PersonalPlant = mongoose.model('PersonalPlant', personalPlantSchema);
