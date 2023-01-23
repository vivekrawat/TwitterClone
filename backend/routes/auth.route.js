const express = require('express')
const passport = require('passport')
const { ensureLoggedIn } = require('../utils/middlewares')
const { login, logout, signup, getLogin} = require('../controllers/auth.controller')
const router  = express.Router()

router.post('/login', passport.authenticate('local'), login)
router.get('/login', ensureLoggedIn, getLogin)
router.post('/logout', logout)
router.post('/signup', signup)
module.exports = router