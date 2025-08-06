import { Pool } from 'pg'

export let pool: Pool | undefined = undefined

export function initDb() {
    console.log("Creating pool...")
	pool = new Pool({
		host: process.env.PG_HOST,
		port: parseInt(process.env.PG_PORT || '5432'),
		user: process.env.PG_USER,
		password: process.env.PG_PASSWORD,
		database: process.env.PG_DATABASE,
	})
}

