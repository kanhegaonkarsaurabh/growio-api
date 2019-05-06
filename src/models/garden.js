import mongoose from 'mongoose';
import PersonalPlant from './personalPlant';

const gardenSchema = new mongoose.Schema({
    name: {
        type: String,
        default: null       // for now, will eventually be _____'s Garden
    },
    plants: {
        type: [PersonalPlant],      // will be a plant object each
        default: []
    }
});

const Garden = mongoose.model('Garden', gardenSchema);

export default Garden;