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
  notifications: {
    type: Boolean,
    default: false,
  },
});

export const PersonalPlant = mongoose.model('PersonalPlant', personalPlantSchema);
