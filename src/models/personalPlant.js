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
  nickname_key: {   // Unique key for a personal plant. This is nickname + user_id
    type: mongoose.Schema.ObjectId, 
    unique: true,
    sparse: true,   // Make this unique but ignore similar 'null' values 
  },
  plant_image: {
    type: String,
    default: null,
  },
});

export const PersonalPlant = mongoose.model('PersonalPlant', personalPlantSchema);