import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User'

export let post = async (req, res) => {
    if(!req.body.username) {
        res.json({
            'error': 'Empty username'
        })
        return
    }
    if(!req.body.password) {
        res.json({
            'error': 'Empty password'
        })
        return
    }
    let user = await User.findOne({username: req.body.username}).exec()
    if(user == null) {
        res.json({
            'error': 'User not found'
        })
        return
    }
    if(bcrypt.compareSync(req.body.password, user.passwordHash)) {
        res.json({
            'authToken': jwt.sign({
                id: user._id,
                username: user.username
            }, "super secret keyboard key cat")
        })
    } else {
        res.json({
            'error': 'Incorrect password'
        })
    }
}