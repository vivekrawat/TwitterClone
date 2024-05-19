const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const authSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true,
    },
    passwordHash: String, //hashed password
})
/**
 * checks if user_id and password are valid
 * @param {*} user_id 
 * @param {String} password 
 * @returns 
 */
authSchema.statics.validPassword = async function (user_id, password) {
    let auth = await this.findOne({ user_id }, 'passwordHash');
    if (!auth) {
        console.log('erorr in auth.validpassword')
        throw Error('Invalid user_id.')
    }
    return bcrypt.compare(password, auth.passwordHash)
}
/**
 * creating a new user
 * @param {*} user_id 
 * @param {Object} authDat 
 */
authSchema.statics.createNew = async function (user_id, authDat) {
    let password = authDat.password;
    if (!password && password.length === 0) {
        throw Error('password required for auth.createNew')
    }
    let passwordHash = await bcrypt.hash(password, 10) //auto gens salt
    await this.create({
        user_id,
        passwordHash
    })
}
module.exports = mongoose.model('Auth', authSchema)