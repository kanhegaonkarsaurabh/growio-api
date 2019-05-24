import mongoose from 'mongoose';

export const personalPlantSchema = new mongoose.Schema({
  plant_id: {
    type: String, // or whatever we end up using (String from USDA)
    required: true,
  },
  nickname: {
    type: String,
    default: null, 
  },
});

export const PersonalPlant = mongoose.model('PersonalPlant', personalPlantSchema);
