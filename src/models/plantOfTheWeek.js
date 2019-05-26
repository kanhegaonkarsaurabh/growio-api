import mongoose from 'mongoose';

export const plantOfTheWeekSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
  },
  commonName: {
    type: String,
  },
  sciName: {
    type: String,
    required: true,
  },
});

export const PlantOfTheWeek = mongoose.model('PlantOfTheWeek', plantOfTheWeekSchema);
