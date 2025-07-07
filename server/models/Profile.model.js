import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    bio: {
        type: String,
    },

    skills:[
        String
    ],
    github: {
        type: String,
    },
    linkedin: {
        type: String,
    },
    website:{
        type: String,
    },
    location:{
        type: String,
    },
    education:{
        type: String,
    },
    avatar:{
        type: String,
        default: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'
    }
});

const Profile = mongoose.models.Profile || mongoose.model('Profile', profileSchema);
export default Profile;