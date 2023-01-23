const express = require('express')
const { ensureLoggedIn } = require('../utils/middlewares')
const { homeTimeline, userTimeline } = require('../controllers/timeline.controller')


const router = express.Router()

/* GET home page. */
router.get('/home_timeline', ensureLoggedIn, homeTimeline)

/* GET user timeline */
router.get('/user_timeline/:username', userTimeline)

module.exports = router