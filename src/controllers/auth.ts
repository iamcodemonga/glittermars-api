import express, { Request, Response } from "express";
import { QueryResult } from 'pg';
import crypto from 'crypto';
import { pool } from '../connect';
import bcrypt from 'bcrypt';
import { config } from 'dotenv'
config();

export const register = async(req:Request, res:Response) => {

    interface statusInterface {
        error: boolean,
        message: string,
        user?: QueryResult
    }

    let status: statusInterface;

    let { fullname, email, password } = req.body;
    let nameRegex: RegExp = /^([a-zA-Z ]+)$/;
    let emailRegex: RegExp = /^([a-zA-Z0-9\.\-_]+)@([a-zA-Z0-9\-]+)\.([a-z]{2,10})(\.[a-z]{2,10})?$/;
    fullname = fullname.toLowerCase();
    email = email.toLowerCase().replace(/ /g, "_");

    if (!fullname || !email || !password) {
        status = { error: true, message: "Please fill in all fields!"}
        return res.json(status)
    }

    if (!nameRegex.test(fullname)){
        status = { error: true, message: "Name format is improper!"}
        return res.json(status)
    }

    if (!emailRegex.test(email)){
        status = { error: true, message: "Invalid email format!!"}
        return res.json(status)
    }

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
        const user: QueryResult = await pool.query('INSERT INTO users (_id, fullname, email, password) VALUES ($1, $2, $3, $4) RETURNING *', [ hashedId, fullname, email, hashedPassword])
        // send response
        status = { error: false, message: `Hi ${user.rows[0].fullname},You're welcome!!`, user: user.rows[0]}
        return res.json(status)
    } catch (error) {
        console.log(error)
    } finally {
        client.release()
    }
    
}

export const login = async(req:Request, res:Response) => {

    interface statusInterface {
        error: boolean,
        message: string,
        user?: QueryResult
    }

    let status: statusInterface;

    let { email, password } = req.body;
    let emailRegex: RegExp = /^([a-zA-Z0-9\.\-_]+)@([a-zA-Z0-9\-]+)\.([a-z]{2,10})(\.[a-z]{2,10})?$/;
    email = email.toLowerCase().replace(/ /g, "_");

    if (!email || !password) {
        status = { error: true, message: "Please fill in all fields!"}
        return res.json(status)
    }

    if (!emailRegex.test(email)){
        status = { error: true, message: "Invalid email format!!"}
        return res.json(status)
    }

    const client = await pool.connect()
    try {
        let existingEmail: QueryResult = await pool.query(`SELECT * FROM users WHERE email=$1`, [email]);
        if (existingEmail.rowCount < 1) {
            console.log(existingEmail)
            status = { error: true, message: "Email or Password is incorrect!!!" }
            return res.json(status)
        }

        // compare the password
        if (!await bcrypt.compare(password, existingEmail.rows[0].password)) {
            status = { error: true, message: "Email or Password is incorrect!!!" }
            return res.json(status)
        }
        // send response
        status = { error: false, message: `Hi ${existingEmail.rows[0].fullname},You're welcome!!`, user: existingEmail.rows[0]}
        res.json(status)
    } catch (error) {
        console.log(error)
    } finally {
        client.release()
    }
    
}