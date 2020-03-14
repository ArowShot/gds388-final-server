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
    if(req.body.password != req.body.password2) {
        res.json({
            'error': 'Passwords do not match'
        })
        return
    }
    let user = await User.findOne({username: req.body.username}).exec()
    if(user) {
        res.json({
            'error': 'Username taken'
        })
        return
    }

    user = new User({
        username: req.body.username,
        passwordHash: bcrypt.hashSync(req.body.password),
        cardsPlayed: 0,
        cardsDrawn: 0
    })

    await user.save()

    res.json({
        'authToken': jwt.sign({
            id: user._id,
            username: user.username
        }, "super secret keyboard key cat")
    })
}