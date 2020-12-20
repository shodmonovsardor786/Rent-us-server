const { verify } = require('jsonwebtoken')
const { query } = require("../pool")	
const JWTKEY = 'secretkey'

const getAccount = async (req, res) => {
    try {
        const { token } = req.headers
        const user = verify(token, JWTKEY)
        if(user) {
            const classifieds = await query(`
            select * from classifieds
            inner join regions on regions.region_id = classifieds.region_id
            inner join districts on districts.district_id = classifieds.district_id
            where user_id = $1 order by created_at desc
            `, user.user_id)
            const images = await query(`select * from images`)
            res.json({data: classifieds, images})
        }
    } catch (error) {
        res.json({data: null, error: error.message})
    }
}

const postAccount = async (req, res) => {
    try {
        const { deleteId } = req.body
        const comments = await query(`delete from comments where classified_id = $1`, deleteId)
        const images = await query(`delete from images where classified_id = $1`, deleteId)
        const [ cls ] = await query(`delete from classifieds where classified_id = $1`, deleteId)
        
        res.json({cls, comments, images})

    } catch (error) {
        console.log(error.message)
    }
        
}

module.exports = { getAccount, postAccount }