import { Pool } from 'pg';
import { config } from "dotenv";
config()

export const pool: Pool = new Pool({
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database:  process.env.PGDATABASE,
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT)
});