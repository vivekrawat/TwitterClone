const express = require('express')
const { ensureLoggedIn } = require('../utils/middlewares')

const { search, trends, userSuggests } = require('../controllers/search.controller')

const router = express.Router()
/* GET seach results */
router.get('/search', search)

/* GET trends. */
router.get('/trends', trends)

/* GET user Suggestions */
router.get('/users', ensureLoggedIn, userSuggests)
