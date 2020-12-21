const express = require('express')
const app = express()
const { query } = require("../pool")	
const { verify } = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const JWTKEY = 'secretkey'

app.use(express.json())

const getHome = async (_, res) => {
	try {
		const regions = await query(`select * from regions`)
		const images = await query(`select * from images`)
		res.json({regions, images})
		
	} catch (error) {
		console.log(error.message)
		
	}
}

const postHome = async (req, res) => {
	
	try {
		const { region, district, type, room, priceFrom, priceTo, index, newComment, id, orderId, orderToken} = req.body
		const { token } = req.headers
			
		if(newComment && token && id) {
			try {
				const user = verify(token, JWTKEY)
				if(user) {
					const comment = await query(`insert into comments(user_id, classified_id, comment_body) values ($1, $2, $3) returning *`, user.user_id, id, newComment)
					res.json({data: comment, error: null})
				}
			}
			catch (error) {
				res.json({data: null, error: error.message})
			}
		}   

		else if(index) {
			const [ classified ] = await query(`
				select * from classifieds 
				inner join regions on regions.region_id = classifieds.region_id
				inner join districts on districts.district_id = classifieds.district_id
				where classified_id = $1
			`, index)
			const images = await query(`select * from images where classified_id = $1`, index)
			const comments = await query(`
				select * from comments natural join users where classified_id = $1 order by created_at desc
			`, index)
			res.json({classified, comments, images: images ? images : null})
		}

		else if(region && district && type && room && priceFrom, priceTo) {
			const classifieds = await query(`
			select * from classifieds 
			natural join users  where classified_busy = false and 
			region_id = $1 and 
			district_id = $2 and 
			classified_type = $3 and 
			classified_room = $4 and classified_price >= $5 and 
			classified_price <= $6 
			order by created_at desc
			`, region, district, type, room, priceFrom, priceTo)
			res.json({classifieds})
		}
			
		else if(region && district && type && room && priceFrom) {
			const classifieds = await query(`
			select * from classifieds 
			natural join users  where classified_busy = false and 
			region_id = $1 and 
			district_id = $2 and 
			classified_type = $3 and 
			classified_room = $4 and 
			classified_price >= $5 
			order by created_at desc
			`, region, district, type, room, priceFrom)
			res.json({classifieds})
		}

		else if(region && district && type && room) {
			const classifieds = await query(`
			select * from classifieds 
			natural join users  where classified_busy = false and 
			region_id = $1 
			and district_id = $2 and 
			classified_type = $3 and classified_room = $4 order by created_at desc
			`, region, district, type, room)
			res.json({classifieds})
		}

		else if(region && district && type) {
			const classifieds = await query(`
			select * from classifieds 
			natural join users  where classified_busy = false and 
			region_id = $1 
			and district_id = $2 and 
			classified_type = $3 
			order by created_at desc
			`, region, district, type)
			res.json({classifieds})

		}

		else if(region && district) {
			const classifieds = await query(`
			select * from classifieds 
			natural join users  where classified_busy = false and 
			region_id = $1 
			and district_id = $2 
			order by created_at desc
			`, region, district)
			res.json({classifieds})
		}

		else if(region) {
			const districts = await query(`select * from districts where region_id = $1`, region)
			const classifieds = await query(`
			select * from classifieds 
			natural join users		
			where classified_busy = false and 
			region_id = $1
			order by created_at desc
			`, region)
			res.json({districts, classifieds})
		}

		else if(orderId && orderToken) {
			try {
				const client = verify(orderToken, JWTKEY)
				if(client) {
					const [ user ] = await query(`select * from classifieds natural join users where classified_id = ${orderId}`)
					const transporter = nodemailer.createTransport({
						service: 'gmail',
						auth: {
							user: 'shodmonovsardor766@gmail.com',
							pass: 'sardor786'
						}
					})
					const mailOption = {
						from: 'shodmonovsardor766@gmail.com',
						to: user.user_email,
						subject: `🥳🥳🥳 A new client 🥳🥳🥳`,
						html: `
						<div style="background: #eee; margin: 10px; padding: 10px; border-radius: 10px">
							<h1 style="color: red; margin: 0; padding: 0">Hello ${user.user_username} 😉 you have a new client.</h1> 
							<ul style="margin: 0; padding: 0; list-style-type: none;">
								<li style="padding: 5px; margin: 10px 0;">User: ${client.user_username}</li>
								<li style="padding: 5px; margin: 10px 0;">Phone: ${client.user_phone}</li>
								<li style="padding: 5px; margin: 10px 0;">Email: ${client.user_email}</li>
							</ul>
						</div>
						<div style="background: #eee; margin: 10px; padding: 10px; border-radius: 10px">
							<h1 style="color: red; margin: 0; padding: 0">Your ad - ${user.classified_title}</h1>
							<ul style="margin: 0; padding: 0; list-style-type: none;">
								<li style="padding: 5px; margin: 10px 0;">Rooms: ${user.classified_room},</li>
								<li style="padding: 5px; margin: 10px 0;">Type: ${user.classified_type === 1 ? 'House': 'Apartment'},</li>
								<li style="padding: 5px; margin: 10px 0;">Square: ${user.classified_square} m2,</li>
								<li style="padding: 5px; margin: 10px 0;">Address: ${user.classified_addres},</li>
							</ul>
						</div>
						`
					}
					transporter.sendMail(mailOption, (error, info) => {
						if(error) {
							console.log(error.message)
						}
						else {
							res.json({data: true, message: 'They will call you'})
							console.log('Email send ' + info.response);
						}
					})
				}
				else {
					throw new Error ('User is not defined')
				}
			} catch (error) {
				res.json({data: null, error: error.message})
			}
		}

	} catch (error) {
		console.log(error.message)
	}
}

module.exports = { getHome, postHome }