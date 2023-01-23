const express = require('express')
const { ensureLoggedIn } = require('../utils/middlewares')
const {
    getUser,
    followUser,
    unFollowUser,
    updateUser,
    getFollowers,
    getFriends,
} = require('../controllers/user.controller')
const router = express.Router()

/* GET get a single user detail. */
router.get('/user/:username', getUser)

router.post('/follow/:username', ensureLoggedIn, followUser)
router.post('/unfollow/:username', ensureLoggedIn, unFollowUser)

/* GET user friends and followers */
router.get('/followers/:username', getFollowers)
router.get('/friends/:username', getFriends)
/* POST update authenticated user */
router.post('/updateuser', ensureLoggedIn, updateUser)