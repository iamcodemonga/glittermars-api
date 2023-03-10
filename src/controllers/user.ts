import express, { Request, Response } from "express";
import { QueryResult } from 'pg';
import crypto from 'crypto';
import { pool } from '../connect';
import { config } from 'dotenv'
config();

export const profile = async(req: Request, res: Response) => {

    const { userid } = req.params;

    const client = await pool.connect();
    try {
        const { rows }: QueryResult = await pool.query('SELECT * FROM users WHERE _id=$1', [userid]);
        res.json(rows[0])
    } catch (error) {
        console.log(error)
    } finally {
        client.release()
    }
    // return res.json(req.cookies.glittermars)
    // return res.json(req.res?.locals.user)
}