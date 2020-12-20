const { query } = require("../pool")	
const { verify } = require('jsonwebtoken')
const JWTKEY = 'secretkey'

const getNew = async (req, res) => {
    try {
        const { token } = req.headers
        const user = verify(token, JWTKEY)
        if(user) {
            res.json({data: user})
        }
    }
    catch (error) {
        res.json({data: null, error: error.message})
    }
}

const postNew = async (req, res) => {
    try {
        const { classified } = req.body
        const { token } = req.headers
        const user = verify(token, JWTKEY)
        if(user) {
            const [ NewClassified ] = await query(`
            insert into classifieds(
                user_id,
                region_id, 
                district_id,
                classified_title, 
                classified_price,
                classified_room,
                classified_square,
                classified_type,
                classified_addres,
                classified_body
                ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) returning classified_id
                `,
                user.user_id, 
                classified.region, 
                classified.district, 
                classified.title, 
                classified.price, 
                classified.room, 
                classified.square, 
                classified.type, 
                classified.addres, 
                classified.body
                )
            classified.images.map(img => (
                img ? query(`insert into images(user_id, classified_id, image_path) values($1, $2, $3)`,user.user_id, NewClassified.classified_id, img) : null
            ))
            res.json({data: NewClassified})
        }
    } catch (error) {
        console.log(error.message)
    }
}


module.exports = { getNew, postNew }