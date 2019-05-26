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
  moisture_use: {
    type: String,
    default: null,
  },
  temperature: {
    type: String,
    default: null,
  },
  sunlight: {
    type: String,
    default: null,
  },
});

const Plant = mongoose.model('Plant', plantSchema);

export default Plant;
