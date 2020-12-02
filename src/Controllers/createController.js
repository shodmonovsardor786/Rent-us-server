const { sign } = require('jsonwebtoken')
const { query } = require("../pool")	
const JWTKEY = 'secretkey'
const sha1 = require('sha1')

const create = async (req, res) => {
    const {button, username, email, password, number, verify} = req.body
    try {
        
        if(button && username && password && email && number && verify) {
            // const [ newUser ] = await query(`insert into users (user_username, user_phone, user_password, user_email ) values ($1, $2, $3, $4) returning *`,
            // username, `+998${number}`, sha1(password), email)
            // res.json({data: newUser, status: 201, message: 'Creating...', error: null, access_token: sign(newUser, JWTKEY)})
            res.json({data: true})
        }

        else if (username && password && email && number && verify) {
            console.log(verify)
            res.json({data: true, message: 'True code'})
        }

        else if (username && password && email && number) {

            res.json({data: true, message: "Verify code send your email"})

            // const transporter = nodemailer.createTransport({
            //     service: 'gmail',
			// 		auth: {
            //             user: 'shodmonovsardor766@gmail.com',
			// 			pass: 'sardor786'
			// 		}
			// 	})
			// 	const mailOption = {
			// 		from: 'shodmonovsardor766@gmail.com',
			// 		to: email,
			// 		subject: `Hello ${username}`,
			// 		html: `
			// 		<div style="background: #eee; margin: 10px; padding: 10px; border-radius: 10px">
			// 			<h1 style="margin: 0; padding: 0">Your verify code ${randomNumber} 😉</h1> 
			// 		</div>
			// 		`
			// 	}
			//  	transporter.sendMail(mailOption, (error, info) => {
			// 		if(error) {
			// 			console.log(error.message)
			// 		}
			// 		else {
			// 			res.json({data: true, message: 'Verify code send your email'})
			// 			console.log('Email send ' + info.response);
			// 		}
			// 	})
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
            const [ user ] = await query(`select * from users where user_phone = $1`, `+998${number}`)
            if(user) {
                res.json({data: false})                
            }
            else {
                res.json({data: true})
            }
        }

        else if(verify) {
            if(verify  === '123456') {
                res.json({data: true})
            }
            else {
                res.json({data: false})
            }
        }
    }
    catch (error) {
        res.json({data: null, states: 404, message: error.message})
    }
}

module.exports = { create }