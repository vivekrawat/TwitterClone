const mongoose = require('mongoose')
require('mongoose-long')(mongoose)
const internal_setting = require('./internal_setting.model')
const User = require('./user.model')

const postSchema = mongoose.Schema({
    "created_at": { type: Date, default: Date.now },   //"Mon Jan 9 12:11:23 +0000 2023",
    "text": {
        type: String,
        index: 'text',
        required: true
    },
    "source": String,
    "truncated": { type: Boolean, default: false },
    "in_reply_to_status_id": { type: mongoose.Schema.Types.Long, default: null },
    "in_reply_to_status_id_str": { type: String, default: null },
    "in_reply_to_user_id": { type: mongoose.Schema.Types.Long, default: null },
    "in_reply_to_user_id_str": { type: String, default: null },
    "in_reply_to_screen_name": { type: String, default: null },
    "user": {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    "entities": {
        "hashtags": [{
            type: Object,
            index: true,
        }],
        "symbols": [{}],
        "user_mentions": [{}],
        "urls": [{}],
        "media": [{}]
    },
    "extended_entities": {
        "media": [{}]
    },
    "geo": {}, //N/I
    "coordinates": {}, //N/I
    "place": {}, //N/I
    "contributors": {}, //N/I

    "is_quote_status": { type: Boolean, default: false },
    "quoted_status_id": { type: mongoose.Schema.Types.Long },
    "quoted_status_id_str": { type: String },
    "quoted_status": {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    },
    "retweeted_status": {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    },

    "retweet_count": { type: Number, default: 0 },
    "favorite_count": { type: Number, default: 0 },
    "reply_count": { type: Number, default: 0 },

    //for personalised post objects (serialized)
    "favorited": { type: Boolean, default: false },
    "retweeted": { type: Boolean, default: false },
    "lang": { type: String, default: null }
})

const sPage = 15
/**
* adds a post for specific user
* @param {String} username - screen_name of user
* @param {Object} post - post body (partial) to add, must-have feilds: text, ...
* @returns {Promise} -  One returned by mongoose
*/
postSchema.statics.addOne = async function ({
    username: screen_name = null,
    user_id = null
}, post) {

    if (!user_id) {
        let { _id } = await User.findOne({ screen_name }, '_id');
        user_id = _id;
    }
    return mongoose.model('Post').create({
        ...post,
        user: user_id,
    })
}
/**
 * returns posts for specific hashtag
 * @param {String} query 
 * @param {Number} page 
 * @returns 
 */
postSchema.statics.searchHashtag = async function (query, page = 1) {
    page = parseInt(page);
    if (query.startsWith('#'))
        query = query.slice(1)
    return this.find({ 'entities.hashtags.text': query })
        .collation({
            locale: 'en',
            strength: 2
        })
        .sort('-created_at')
        .skip(sPage * (page - 1))
        .limit(sPage)
}
/**
 * returs post where user was mentioned
 * @param {String} query 
 * @param {Number} page 
 * @returns 
 */
postSchema.statics.searchUserMention = async function (query, page = 1) {
    page = parseInt(page);
    if (query.startsWith('@'))
        query = query.slice(1);
    return this.find({
        $or: [
            { 'entities.user_mentions.screen_name': query },
            { 'entities.user_mentions.name': query }
        ]
    }).collation({
        locale: 'en',
        strength: 2
    }).sort('-created_at')
        .skip(sPage * (page - 1))
        .limit(sPage)
}
/**
 * returns post which matches the searched text
 * @param {*} query 
 * @param {*} page 
 * @returns 
 */
postSchema.statics.searchText = async function (query, page = 1) {
    page = parseInt(page);
    return this.find(
        { $text: { $search: query } },
        { score: { $meta: "textScore" } }
    ).sort({ score: { $meta: 'textScore' } })
        .skip(sPage * (page - 1))
        .limit(sPage)
}
/**
 * returns posts by a particuar user
 * @param {Object} param0 
 * @param {Number} page 
 * @returns 
 */
postSchema.statics.getUserTimeline = async function ({
    username: screen_name = null,
    user_id = null
}, page = 1) {
    if (!user_id) {
        let { _id } = await mongoose.model("User").findOne({ screen_name: screen_name }, "_id")
        if (!_id)
            throw Error('Cannot find User')
        user_id = _id
    }
    return this.find({
        user: user_id
    }).sort("-created_at")
        .skip(sPage * (page - 1))
        .limit(sPage)
}



module.exports = mongoose.model('Post', postSchema);