import { Pool } from 'pg';

export const pool = new Pool({
    user: process.env.PGUSER,
    password: process.env.PGPASS,
    database: process.env.PGDB,
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT)
});