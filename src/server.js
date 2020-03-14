import sirv from 'sirv';
import bcrypt from 'bcryptjs'
import express from 'express';
import bodyParser from 'body-parser';
import compression from 'compression';
import { Server } from 'http';
import socketio from 'socket.io';
import mongoose from 'mongoose';
import { mongoURI } from './routes/_db'
import * as sapper from '@sapper/server';
import User from './models/User'

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';

mongoose.connect(mongoURI)

var app = express() // You can also use Express

app.use(
	bodyParser()
)

app.use(
	compression({ threshold: 0 }),
	sirv('static', { dev }),
	sapper.middleware()
)

function genRandomUnoCard() {
	return "0123456789".charAt(Math.floor(Math.random() * 10)) + "RYBG".charAt(Math.floor(Math.random() * 4))
}

function isSimilar(card1, card2) {
	return (card1[0] == card2[0] || card1[1] == card2[1])
}

function randomRoomCode() {
	return "23456789ABCDEFGHJKMNPQRSTUVWXYZ".charAt(Math.floor(Math.random() * 31)) +
		"23456789ABCDEFGHJKMNPQRSTUVWXYZ".charAt(Math.floor(Math.random() * 31)) +
		"23456789ABCDEFGHJKMNPQRSTUVWXYZ".charAt(Math.floor(Math.random() * 31)) +
		"23456789ABCDEFGHJKMNPQRSTUVWXYZ".charAt(Math.floor(Math.random() * 31))
}

const games = {}

const server = Server(app)
const io = socketio(server)
io.on('connection', (socket) => {
	socket.on('auth', async (data) => {
		if(data.username == '') {
			socket.emit('servererror', {
				message: "User not found"
			})
		} else {
			let user = await User.findOne({username: data.username}).exec()
			if(user == null) {
				socket.emit('servererror', {
					message: "User not found"
				})
				return
			}
			if(bcrypt.compareSync(data.password, user.passwordHash)) {
				socket.user = {
					username: data.username,
					socket,
					doc: user
				}

				socket.emit('authenticated', {
					token: socket.user.username
				})
			} else {
				socket.emit('servererror', {
					message: "Incorrect username/password"
				})
			}
		}
	});

	socket.on('creategame', (data) => {
		if(!socket.user) {
			socket.emit('servererror', {
				message: "You must be signed in to create a game"
			})
			return
		}

		const game = {
			code: randomRoomCode(),
			started: false,
			players: [
				socket.user
			]
		}
		games[game.code] = game
		socket.game = game

		socket.emit('matchjoin', {
			code: game.code
		})
	})

	socket.on('joingame', (data) => {
		if(!socket.user) {
			socket.emit('servererror', {
				message: "You must be signed in to join a game"
			})
			return
		}
		const lecode = data.code.toUpperCase()
		if(lecode in games) {
			const game = games[lecode]
			socket.game = game
			game.players.push(socket.user)
			socket.emit('matchjoin', {
				code: game.code
			})
			for (const player of game.players) {
				if(socket == player.socket) {
					continue
				}
				socket.emit('playerjoin', {
					name: player.username
				})
				player.socket.emit('playerjoin', {
					name: socket.user.username
				})
			}
		}
	})

	socket.on('drawcard', async (data) => {
		if(!socket.game) {
			socket.emit('servererror', {
				message: "You must be in a game to draw a card"
			})
			return
		}
		if(socket.game.players[socket.game.turnPlayer] != socket.user) {
			socket.emit('servererror', {
				message: "It is not your turn"
			})
			return
		}

		await (await User.findOneAndUpdate({ _id: socket.user.doc._id }, { $inc: { cardsDrawn: 1 } })).execPopulate()

		socket.user.hand.push(genRandomUnoCard())

		socket.emit('updatehand', {
			player: socket.user.username,
			hand: socket.user.hand
		})

		for (const otherplayer of socket.game.players) {
			if(otherplayer == socket.user) {
				continue
			}
			console.log('updatehand sending to ' + otherplayer.username)
			otherplayer.socket.emit('updatehand', {
				player: socket.user.username,
				handSize: socket.user.hand.length
			})
		}

		socket.game.turnPlayer = (socket.game.turnPlayer + 1) % socket.game.players.length
		for (const otherplayer of socket.game.players) {
			otherplayer.socket.emit('turn', {
				player: socket.game.players[socket.game.turnPlayer].username
			})
		}
	})

	socket.on('playcard', async (data) => {
		if(!socket.game) {
			socket.emit('servererror', {
				message: "You must be in a game to play a card"
			})
			return
		}
		if(socket.game.players[socket.game.turnPlayer] != socket.user) {
			socket.emit('servererror', {
				message: "It is not your turn"
			})
			return
		}
		
		if(!isSimilar(socket.user.hand[data.card], socket.game.tablecard)) {
			socket.emit('servererror', {
				message: `You cannot play that card (${socket.user.hand[data.card]} onto ${socket.game.tablecard})`
			})
			return
		}

		socket.game.tablecard = socket.user.hand.splice(data.card, 1)[0]

		await (await User.findOneAndUpdate({ _id: socket.user.doc._id }, { $inc: { cardsPlayed: 1 } })).execPopulate()

		socket.emit('updatehand', {
			player: socket.user.username,
			hand: socket.user.hand
		})

		for (const otherplayer of socket.game.players) {
			otherplayer.socket.emit('updatehand', {
				table: true,
				hand: socket.game.tablecard
			})

			if(otherplayer == socket.user) {
				continue
			}

			otherplayer.socket.emit('updatehand', {
				player: socket.user.username,
				handSize: socket.user.hand.length
			})
		}
	})

	socket.on('startgame', (data) => {
		if(!socket.game) {
			socket.emit('servererror', {
				message: "You must be in a game to start a game"
			})
			return
		}
		if(socket.game.started) {
			socket.emit('servererror', {
				message: "The game has already been started"
			})
			return
		}

		socket.game.started = true
		socket.game.tablecard = genRandomUnoCard()
		socket.game.turnPlayer = 0
		for (const player of socket.game.players) {
			player.socket.emit('updatehand', {
				table: true,
				hand: socket.game.tablecard
			})
			player.socket.emit('turn', {
				player: socket.game.players[socket.game.turnPlayer].username
			})
			player.socket.emit('matchstart')
			player.hand = [genRandomUnoCard(), genRandomUnoCard(), genRandomUnoCard(), genRandomUnoCard(), genRandomUnoCard()]

			player.socket.emit('updatehand', {
				player: player.username,
				hand: player.hand
			})

			for (const otherplayer of socket.game.players) {
				if(otherplayer == player) {
					continue
				}
				otherplayer.socket.emit('updatehand', {
					player: player.username,
					handSize: player.hand.length
				})
			}
		}
	})
});


server.listen(PORT, err => {
	if (err) console.log('error', err);
});
