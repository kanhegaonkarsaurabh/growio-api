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
  moisture_use: {
    type: String,
    default: null,
  },
  temperature: {
    type: String,
    default: null,
  },
});

const Plant = mongoose.model('Plant', plantSchema);

export default Plant;
