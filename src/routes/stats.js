import jwt from 'jsonwebtoken'
import User from '../models/User'

export let get = async (req, res) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, "super secret keyboard key cat", async (err, user) => {
            if (err) {
                res.json({
                    "error": "Not authenticated"
                });
                return
            }
            
            let doc = await User.findById(user.id).exec()

            if(doc == null) {
                res.json({
                    "error": "User not found"
                });
                return
            }

            res.json({
                username: doc.username,
                cardsPlayed: doc.cardsPlayed,
                cardsDrawn: doc.cardsDrawn
            })
        });
    } else {
        res.json({
            "error": "Not authenticated"
        });
    }
}