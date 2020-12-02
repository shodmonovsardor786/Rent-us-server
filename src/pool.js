const { Pool } = require('pg')

const pool = new Pool({
	host: 'localhost',
	user: 'postgres',
	password: 'sardor786',
	port: 5432,
	database: 'rent_house'
})

module.exports.query = async (SQL, ...params) => {

	const client = await pool.connect()

	try {
		const { rows } = await client.query(SQL, params.length ? params : null)
		return rows
	}
	finally {
		client.release()
	}
}