import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  _id: {          // We override the default mongo '_id' with google's uid for the user 
    type: String
  },
  email: {
    type: String,
    required: [true, 'email required'],
    unique: [true, 'email already registered']
  },
  name: {
    type: String, 
    default: null
  }
});


userSchema.statics.findByLogin = async function(login) {
  // First check the db to find the user by email if he passes email as param
  let user = await this.findOne({
    email: login
  });

  // If not, then check the db using his name as the param
  if (!user) {
    user = await this.findOne({ name: login });
  }

  return user;
};


const User = mongoose.model('User', userSchema);

export default User;
