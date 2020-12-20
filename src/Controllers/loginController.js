const sha1 = require('sha1')
const { sign } = require('jsonwebtoken')
const JWTKEY = 'secretkey'
const { query } = require("../pool")	

const login = async (req, res) => {
    try {
        const {username, password} = req.body
    
        if(username && password) {
            const [ user ] = await query(`select * from users where lower(user_username) = $1 and user_password = $2`, username.toLowerCase(), sha1(password))
            if(user) {
                res.json({data: user, status: 200, message: 'Waiting...', error: null, access_token: sign(user, JWTKEY)})
            }
            else throw new Error ('Wrong username or password')
        }
    } catch (error) {
        res.json({data: null, states: 404, message: error.message})
    }
}

module.exports = { login }