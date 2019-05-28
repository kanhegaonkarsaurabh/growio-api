import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'email required'],
    unique: [true, 'email already registered'],
  },
  name: {
    type: String,
    default: null,
  },
  gardenId: {
    type: mongoose.Schema.ObjectId,
    default: null,
  },
  settings: {
    notifications: {
      type: Boolean, 
      default: false
    },
  },
  location: {
    type: {   // this type is of geoJSON
      type: String,   // this type is of mongoose
      enum: ['Point'], // 'location.type' must be 'Point'
    },
    coordinates: {
      type: [Number],
      default: [-117.23755359649657, 32.88110087702036],  // default location of Geisel
    }
  }
});

userSchema.statics.findByLogin = async function(login) {
  // First check the db to find the user by email if he passes email as param
  let user = await this.findOne({
    email: login,
  });

  // If not, then check the db using his name as the param
  if (!user) {
    user = await this.findOne({ name: login });
  }

  return user;
};

const User = mongoose.model('User', userSchema);

export default User;
