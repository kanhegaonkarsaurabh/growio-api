import mongoose from 'mongoose';

/* all the data we are storing per plant is not final yet, so this is
 what it is for now. */
const plantSchema = new mongoose.Schema({
  scientificName: {
    type: String,
    required: true,
    unique: true,
  },
  commonName: {
    type: String,
    required: true,
  },
  plantImage: {
    type: Buffer, // image is stored as Base64 encoded string which is basically Binary, Buffer is best way to store
    default: null,
  },
  /* everything after this point is up in 
     the air whether it needs to be here and what the default values and stuff will be */
  wateringFrequency: {
    type: Number,
    required: true,
  },
  precipitation_max: {
    type: Number,
    default: null,
  },
  precipitation_min: {
    type: Number,
    default: null,
  },
  moisture_use: {
    type: Number,
    default: null,
  },
  temperature_min: {
    type: Number,
    default: null,
  },
  temperature_max: {
    type: Number,
    default: null,
  },
});

const Plant = mongoose.model('Plant', plantSchema);

export default Plant;
