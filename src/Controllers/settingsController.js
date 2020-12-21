const { query } = require('../pool')
const { verify, sign } = require('jsonwebtoken')
const sha1 = require('sha1')
const JWTKEY = 'secretkey'
const randomize = require('randomatic')
const nodemailer = require('nodemailer')

const getSettings = async (req, res) => {
	try {
		const { token } = req.headers
		if(token) {
			try {
				const user = verify(token, JWTKEY)
				if(user) {
					res.json({data: user})
				}
			}
			catch (error) {
				res.json({data: null, error: error.message})
			}
		}  
	} catch (error) {
		console.log(error.message)
	}	
}

const postSettings = async (req, res) => {

	try {
		const { id, username, number, password, newPassword, button, userDel, user, verifyCode, img } = req.body

		if(button) {
			if(username && number && newPassword ) {
				const toLower = newPassword.toLowerCase()
				const  [ user ] = await query(`update users set user_username = $2 user_phone = $3 user_password = $4 where user_id = $1 returning *`, id, username, `+998 ${number}`, sha1(toLower))
				res.json({data: user, access_token: sign(user, JWTKEY)})
			} 
			else if (username && number) {
				const  [ user ] = await query(`update users set user_username = $2 user_phone = $3 where user_id = $1 returning *`, id, username, `+998 ${number}`)
				res.json({data: user, access_token: sign(user, JWTKEY)})
				
			}
			else if(username && newPassword) {
				const toLower = newPassword.toLowerCase()
				const  [ user ] = await query(`update users set user_username = $2 user_password = $3 where user_id = $1 returning *`, id, username, sha1(toLower))
				res.json({data: user, access_token: sign(user, JWTKEY)})
			}
			else if(number && newPassword) {
				const toLower = newPassword.toLowerCase()
				const  [ user ] = await query(`update users set user_number = $2 user_password = $3 where user_id = $1 returning *`, id, `+998 ${number}`, sha1(toLower))
				res.json({data: user, access_token: sign(user, JWTKEY)})

			}

			else if (img) {
				const  [ user ] = await query(`update users set user_path = $2 where user_id = $1 returning *`, id, img)
				res.json({data: user, access_token: sign(user, JWTKEY)})
			}

			else if(username) {
				const  [ user ] = await query(`update users set user_username = $2 where user_id = $1 returning *`, id, username)
				res.json({data: user, access_token: sign(user, JWTKEY)})
			}
			
			else if(number) {
				const  [ user ] = await query(`update users set user_phone = $2 where user_id = $1 returning *`, id, `+998 ${number}`)
				res.json({data: user, access_token: sign(user, JWTKEY)})
			}
			
			else if (newPassword && password) {
				const toLower = newPassword.toLowerCase()
				const  [ user ] = await query(`update users set user_password = $2 where user_id = $1 returning *`,id, sha1(toLower))
				res.json({data: user, access_token: sign(user, JWTKEY)})
			}
		}

		else if(newPassword && password) {
			res.json({data: true})
		}

		else if (password) {
			const lowerPassword = password.toLowerCase()
			const  [ user ] = await query(`select * from users where user_password = $1`, sha1(lowerPassword))
			if(user) {
				res.json({data: true})
			}
			else {
				res.json({data: false})
			}
		}

		else if (number) {
			const  [ user ] = await query(`select * from users where user_phone = $1`, `+998 ${number}`)
			if(user) {
				res.json({data: false})
			}
			else {
				res.json({data: true})
			}
		}

		else if (userDel) {
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
                        to: userDel.user_email,
                        subject: `Hello ${userDel.user_username}`,
                        html: `
                        <div style="background: #eee; margin: 10px; padding: 10px; border-radius: 10px">
                        <h1 style="margin: 0; padding: 0">Your code ${newCode.code} 🥺</h1> 
                        </div>
                        `
                    }
                    transporter.sendMail(mailOption, (error, info) => {
                        if(error) {
                            console.log(error.message)
                        }
                        else {
                            res.json({data: true})
                            console.log('Email send ' + info.response);
                        }
                    })
            } 
            catch (error) {
                console.log(error)
            }
		}
		
		else if (verifyCode && user) {
			await query(`delete from images where user_id = $1 returning *`, user.user_id)
			await query(`delete from comments where user_id = $1 returning *`, user.user_id)
			await query(`delete from classifieds where user_id = $1 returning *`, user.user_id)
			const [ deletedUser ] = await query(`delete from users where user_id = $1 returning *`, user.user_id)
			if(deletedUser) {
				await query(`delete from verify where code = $1`, verifyCode)
				res.json({data: true})
			}
		}

		else if (verifyCode) {
			const [ code ] = await query(`select * from verify where code = $1`, verifyCode)
			if(code) {
				res.json({data: true})
			}
			else {
				res.json({data: false})
			}
		}
	} catch (error) {
		console.log(error.message)
	}


}

module.exports = { getSettings, postSettings }