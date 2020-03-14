import { model, Schema } from 'mongoose';

var schema = new Schema({
    username: String,
    passwordHash: String,
    cardsPlayed: Number,
    cardsDrawn: Number
});

export default model('User', schema);