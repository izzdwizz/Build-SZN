import mongoose from 'mongoose';

const friendDetailsSchema = new mongoose.Schema({
    friendId: {
        type: String,
        required: true
    },
    friendName: {
        type: String,
        required: true
    },
    friendUsername: {
        type: String,
        required: true
    },
    friendEmail: {
        type: String,
        required: true
    },
    friendunique_wallet: {
        type: String,
        default: ''
    }
}, { _id: false }); // Disable the automatic creation of _id for subdocuments

const FriendSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true
        },
        username: {
            type: String,
            required: true
        },
        friends: [friendDetailsSchema]
    },
    {
        timestamps: true,
    }
);

const Friend = mongoose.model('Friend', FriendSchema);
export default Friend;