const mongoose = require('mongoose')
const Auth = require('./auth.model')
const Friendship = require('./friendship.model')
const home_timeline = require('./home_timeline.model')

const userSchema = mongoose.Schema({
    "name": String,
    "screen_name": {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    "location": { type: String, default: null },
    "description": { type: String, default: null },
    "url": { type: String, default: null },
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
    "protected": { type: Boolean, default: false },
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
/**
 * updates Friendship ans User.friends_count
 * then invokes home_timeline.bulkAddPosts()
 * @returns {Object} - like { ok: 1, ...otherinfo } if succesfull in adding friends
 */
userSchema.methods.follow = async function (...list_id_tobe_friends) {
    let res = { ok: 0 }
    try {
        let res1 = await Friendship.updateOne({ user_id: this._id }, {
            $push: {
                friend_ids: {
                    $each: list_id_tobe_friends,
                    $position: 0
                }
            }
        }, { upsert: true })
        if (res1.ok) {
            await this.update({
                $inc: { friends_count: 1 }
            })

            for (let id of list_id_tobe_friends) {
                await home_timeline
                    .bulkAddPosts([this._id], { id_friend_added: id })
                //                  user_ids 
            }
        }
        res = { ...res1 }
    } catch (err) {
        console.log('error in user.follow()', err)
    } finally {
        return res
    }
}

/**
 * unfollow() similar to follow()
 */
userSchema.methods.unfollow = async function (...list_id_tobe_not_friends) {
    let res = { ok: 0 }
    try {
        let res1 = await Friendship.updateOne({ user_id: this._id }, {
            $pull: {
                friend_ids: {
                    $in: list_id_tobe_not_friends
                }
            }
        }, { upsert: true })
        if (res1.ok) {
            await this.update({
                $inc: { friends_count: -1 }
            })

            // remove posts from home_timeline
            for (let id of list_id_tobe_not_friends) {
                await home_timeline
                    .bulkRemovePosts([this._id], { id_friend_removed: id })
                //                  user_ids 
            }
        }
        res = { ...res1 }
    } catch (err) {
        console.log('error in user.unfollow()', err)
    } finally {
        return res
    }
}

userSchema.post('save', async doc => {
    // make empty timeline
    await home_timeline.create({
        user_id: doc._id,
    })
    await Friendship.create({
        user_id: doc._id,
    })
    // if (!doc.profile_image_url_https) {
    //     await mongoose.model('User').updateOne({ _id: doc._id }, {
    //         profile_image_url_https: '',
    //         default_profile_image: false
    //     })
    // }
})

module.exports = mongoose.model('User', userSchema)