const express = require('express')
const { ensureLoggedIn } = require('../utils/middlewares')
const {
    createPost,
    getPost,
    likePost,
    unlikePost,
    repostPost,
    unrepostPost,
    getLikes,
    getReposts,
    replyToPost,
    getReplies,
} = require('../controllers/post.controller')

const router = express.Router()

router.post('/post/:postId/reply', ensureLoggedIn, replyToPost)

/* GET Post liked_by and reposted_by */
router.get('/post/:postId/likes', getLikes)
router.get('/post/:postId/reposts', getReposts)

/* GET Post replies */
router.get('/post/:postId/replies', getReplies)

/* POST create new post. */
router.post('/post', ensureLoggedIn, createPost)
/* GET get a single post. */
router.get('/post/:postId', getPost)
router.post('/like/:postId', ensureLoggedIn, likePost)
router.post('/unlike/:postId', ensureLoggedIn, unlikePost)

/* POST repost a post. */
router.post('/repost', ensureLoggedIn, repostPost)

/* POST unrepost a post. */
router.post('/unrepost', ensureLoggedIn, unrepostPost)

module.exports = router