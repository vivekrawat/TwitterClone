const mongoose = require('mongoose')
const assert = require('assert')
const jwt  = require('jsonwebtoken')
const User = require('../models/post.model')
// const mongoose = require("mongoose");

async function ensureLoggedIn(req, res, next) {
    try {
        await core_ensureLoggedIn(req, {}, next)
    } catch (err) {
        console.log("access denied: ", err.message)
        res.status(401).json({ message: 'login required' })
        return
    }
}
// does not use responce in order to work with sockets too
// throws error or calls next 
async function core_ensureLoggedIn(req, _, next) {
    try {
        assert(mongoose.connection.readyState, 1)
        const token = req.headers.authorization.split(' ')[1]
        const decoded = await jwt.verify(token, process.env.JWT_TOKEN)
        req.user = await mongoose.model("User").findById(decoded.id)
    } catch(err) {
        // console.log(err)
        throw Error('User Not Found')
    }
    // if (!user) { //not logged in
    //     throw Error("Not logged in")
    // }
    // // extra check
    // if (!await mongoose.model('User').exists({ _id: user._id })) {
    //     throw Error('User Not found')
    // }
    next()
}

exports.ensureLoggedIn = ensureLoggedIn
exports.core_ensureLoggedIn = core_ensureLoggedIn
