import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'email required'],
    unique: [true, 'email already registered']
  },
  googleId: {       // NOTE: For now, it's called googleId. We'll rename this later.
    type: String,
    default: null
  },
  name: {
    type: String, 
    default: null
  }
});

/* Commenting it out as this is not needed right now but might need in the future */ 

// userSchema.statics.findByLogin = async function(login) {
//   let user = await this.findOne({
//     username: login,
//   });

//   if (!user) {
//     user = await this.findOne({ email: login });
//   }

//   return user;
// };


const User = mongoose.model('User', userSchema);

export default User;
