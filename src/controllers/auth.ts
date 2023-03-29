import express, { Request, Response } from "express";
import { QueryResult } from 'pg';
import crypto from 'crypto';
import { pool } from '../connect';
import bcrypt from 'bcrypt';
import { config } from 'dotenv'
import jwt from 'jsonwebtoken'
import { User, authStatus } from "../interfaces/user";
import redis from "../cache";
config();

export const register = async(req:Request, res:Response) => {

    let status: authStatus;

    let { fullname, email, password }: { fullname: string, email: string, password: string } = req.body;

    // check for email existence in the database
    const client = await pool.connect()
    try {
        let existingEmail: QueryResult = await pool.query(`SELECT email FROM users WHERE email=$1`, [email]);
        if (existingEmail.rowCount > 0) {
            status = { error: true, message: "Email already exists!!"}
            return res.json(status)
        }

        // hash the password
        const salt: string = await bcrypt.genSalt(10);
        const hashedPassword: string = await bcrypt.hash(password, salt);
        const hashedId: string = crypto.randomUUID();

        // query the database
        const client = await pool.connect();
        try {
            //add user to database
            const user: QueryResult = await pool.query('INSERT INTO users (_id, fullname, email, password) VALUES ($1, $2, $3, $4) RETURNING *', [ hashedId, fullname, email, hashedPassword])
            // send response
            status = { error: false, message: `Hi ${user.rows[0].fullname},You're welcome!!`, user: user.rows[0]}
            return res.json(status)

        } catch (error) {
            console.log(error)
        } finally {
            client.release()
        }
        
    } catch (error) {
        console.log(error)
    } finally {
        client.release()
    }
    
}

export const login = async(req:Request, res:Response) => {

    let status: authStatus;

    let { email, password }: User = req.body;

    // check if email exists
    const client = await pool.connect()
    try {
        let existingEmail: QueryResult = await pool.query(`SELECT * FROM users WHERE email=$1`, [email]);
        if (existingEmail.rowCount < 1) {
            status = { error: true, message: "Email or Password is incorrect!!!" }
            return res.json(status)
        }

        // compare the password
        if (!await bcrypt.compare(password, existingEmail.rows[0].password)) {
            status = { error: true, message: "Email or Password is incorrect!!!" }
            return res.json(status)
        }

        // send response
        status = { 
            error: false,
            message: `Hi ${existingEmail.rows[0].fullname},You're welcome!!`,
            user: [{ _id: existingEmail.rows[0]._id, fullname: existingEmail.rows[0].fullname, email: existingEmail.rows[0].email }]
        }
        return res.json(status)

    } catch (error) {
        console.log(error)
    } finally {
        client.release()
    }
    
}

export const logout = async(req:Request, res:Response) => {
    res.clearCookie('glittermars')
    return res.json({ status: 200, message: 'bye bye'})
}