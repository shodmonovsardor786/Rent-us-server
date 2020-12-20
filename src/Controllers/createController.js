const { sign } = require('jsonwebtoken')
const { query } = require("../pool")	
const JWTKEY = 'secretkey'
const sha1 = require('sha1')
const nodemailer = require('nodemailer')
const randomize = require('randomatic')

const create = async (req, res) => {
    try {
        const {username, email, password, number, verify} = req.body

        if (verify && username && email && password && number) {
            const [ code ] = await query(`select * from verify where code = $1`, verify)
            if(code) {
                const lowerPassword = password.toLowerCase()
                const [ newUser ] = await query(`
                insert into users (user_username, user_email, user_phone, user_password, user_path) 
                values ($1, $2, $3, $4, $5) returning *
                `, username, email, `+998 ${number}`, sha1(lowerPassword), null)
                
                await query(`delete from verify where code = $1`, code.code)
                res.json({data: true, status: 201, message: 'Creating...', error: null, access_token: sign(newUser, JWTKEY)})
            }
            else {
                throw new Error ('wrong verify code')
            }
        }
        
        else if (username && password && email && number) {
            try {
                const random = randomize('0', 6)
                const [ newCode ] = await query(`insert into verify (code) values ($1) returning code`, random)

                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                        auth: {
                            user: 'shodmonovsardor766@gmail.com',
                            pass: 'sardor786'
                        }
                    })
                    const mailOption = {
                        from: 'shodmonovsardor766@gmail.com',
                        to: email,
                        subject: `Hello ${username}`,
                        html: `
                        <div style="background: #eee; margin: 10px; padding: 10px; border-radius: 10px">
                        <h1 style="margin: 0; padding: 0">Your verify code ${newCode.code} 😉</h1> 
                        </div>
                        `
                    }
                    transporter.sendMail(mailOption, (error, info) => {
                        if(error) {
                            console.log(error.message)
                        }
                        else {
                            res.json({data: newUser, message: 'Verify code send your email'})
                            console.log('Email send ' + info.response);
                        }
                    })
            } 
            catch (error) {
                console.log(error)
            }
        }

        else if(username) {
            const [ user ] = await query(`select * from users where lower(user_username) = $1`, username.toLowerCase())
            if(user) {
                res.json({data: false})                
            }
            else {
                res.json({data: true})
            }
        }
        
        else if(email) {
            const [ user ] = await query(`select * from users where lower(user_email) = $1`, email.toLowerCase())
            if(user) {
                res.json({data: false})                
            }
            else {
                res.json({data: true})
            }
        }

        else if(number) {
            const [ user ] = await query(`select * from users where user_phone = $1`, `+998 ${number}`)
            if(user) {
                res.json({data: false})                
            }
            else {
                res.json({data: true})
            }
        }

    } catch (error) {
        res.json({data: null, states: 404, message: error.message})
    }
}

module.exports = { create }