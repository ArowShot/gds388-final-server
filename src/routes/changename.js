import jwt from 'jsonwebtoken'
import User from '../models/User'

export let post = async (req, res) => {
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
            console.log(req.body)            
            if(!req.body.newusername) {
                res.json({
                    "error": "Username cannot be empty"
                });
                return
            }

            if(req.body.newusername == doc.username) {
                res.json({
                    "error": "Username is not new"
                });
                return
            }


            let newnamedoc = await User.findOne({username: req.body.newusername}).exec()

            if(doc == null) {
                res.json({
                    "error": "Username taken"
                });
                return
            }

            doc.username = req.body.newusername
            doc.save()

            res.json({
                newusername: doc.username
            })
        });
    } else {
        res.json({
            "error": "Not authenticated"
        });
    }
}