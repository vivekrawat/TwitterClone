const mongoose = require('mongoose')
const Auth = require('./auth.model')
const Friendship = require('./friendship.model')

const userSchema = mongoose.Schema({
    "name": String,
    "screen_name": {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    "location": { type: String, defualt: null },
    "description": { type: String, default: null },
    "url": { type: String, defualt: null },
    "entities": {
        "url": {
            "urls": [
                {
                    "url": String,
                    "expanded_url": String,
                    "display_url": String,
                    "indices": [Number]
                }
            ]
        },
        "description": {
            "urls": []
        }
    },
    "protected": { type: Boolean, defualt: false },
    "followers_count": { type: Number, default: 0 },
    "friends_count": { type: Number, default: 0 },
    "listed_count": { type: Number, default: 0 },
    "created_at": { type: Date, default: Date.now() },
    "favourites_count": { type: Number, default: 0 },
    "verified": { type: Boolean, default: false },
    "statuses_count": { type: Number, defualt: 0 },
    "default_profile_image": { type: Boolean, default: true },
    "default_profile": { type: Boolean, default: true },
    "profile_image_url_https": { type: String, default: null },
    "profile_banner_url": { type: String, default: null },

    "profile_banner_color": { type: String, default: null },

    "notifications_enabled_device_count": { type: String, default: 0 }
}, { id: false })

/**
 * @param {Object} with two userDat, authDat constaing password and/or sensitive data
 */
userSchema.statics.createNew = async function (userDat, authDat) {
    try {
        let user = await this.create(userDat)
        await Auth.createNew(user._id, authDat)
        return user
    } catch (error) {
        console.log('error creating new user', error)
        throw error
    }
}
/**
 * checks is password is valid for user
 * @param {*} password 
 * @returns 
 */
userSchema.methods.validPassword = async function (password) {
    return Auth.validPassword(this._id, password)
}
/**
 * 
 * @param {*} user_id 
 * @returns {Number} posts by a particular user
 */
userSchema.statics.countPosts = async function (user_id) {
    return mongoose.model('Post').countDocuments({ user: user_id })
}
/**
 * users search 
 * @param {String} query 
 * @returns 
 */
userSchema.statics.searchUser = function (query) {
    if (query.startsWith('@'))
        query = query.slice(1)
    query = new RegExp(query, "i")
    return this.find({
        $or: [
            { screen_name: query },
            { name: query }
        ]
    }).limit(20)
}
/**
 * returns suggestions
 * @param {*} param0 
 * @returns 
 */
userSchema.statics.getSuggestions = async function ({
    user_id = null
}) {
    if (!user_id)
        throw Error('no user_id given')
    let { friend_ids } = await Friendship.findOne({ user_id })
    // personalised later on
    return this.find({
        _id: { $ne: user_id },
        _id: { $nin: friend_ids }
    })
        .sort('-followers_count -statuses_count -friends_count -created_at')
        .limit(25)
}



module.exports = mongoose.model('User', userSchema)