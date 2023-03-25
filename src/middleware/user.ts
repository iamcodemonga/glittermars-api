import express,{ Request, Response, NextFunction} from 'express'
import { QueryResult } from 'pg';
import jwt from 'jsonwebtoken'
import { pool } from '../connect';
import redis from '../cache';

export const isActive = async(req:Request, res:Response, next: NextFunction) => {
    if (req.cookies.glittermars) {
        const { id }  = jwt.verify(String(req.cookies.glittermars), String(process.env.JWTSECRET)) as { id: string};
        const client = await pool.connect()
        try {
            const cachedUser = await redis.get(id);
            if (cachedUser) {
                res.locals.user = JSON.parse(cachedUser);
                next()
            } else {
                const { rows }: QueryResult = await pool.query('SELECT _id, fullname, email FROM users WHERE _id=$1', [ id ]);
                await redis.set(id, JSON.stringify(rows[0]), "EX", 60*5)
                res.locals.user = rows[0];
                next()
            }
        } catch (error) {
            console.log(error)
        } finally {
            client.release()
        }
        
    } else {
        res.locals.user = null;
        next()
    }
}