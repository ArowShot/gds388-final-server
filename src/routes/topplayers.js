import jwt from 'jsonwebtoken'
import User from '../models/User'

export let get = async (req, res) => {
    let doc = await User.find().exec()

    if(doc == null) {
        res.json({
            "users": []
        });
        return
    }

    console.log(doc)

    res.json({
        "users": doc.map((user) => {
            return {
                username: user.username,
                cardsPlayed: user.cardsPlayed
            }
        })
    });
}