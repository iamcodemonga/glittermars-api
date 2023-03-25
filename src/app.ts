import express, { Express } from "express";
import cors from "cors";
import { config } from "dotenv"
import productRoutes from './routes/product'
import authRoutes from './routes/auth'
import userRoutes from './routes/user'
import paymentRoutes from './routes/payment'
import cookieParser from 'cookie-parser'
// const cookieParser = require('cookie-parser')

// app declarations
config();
const app: Express = express();
const port: number = Number(process.env.PORT) || 8000;

// application setup equipments
app.use(cors({
    origin: [ 'http://localhost:3000' ],
    methods: 'GET, POST, PUT, DELETE',
    credentials: true,
}))
app.use(cookieParser())
app.use(express.urlencoded({ extended: false }));
app.use(express.json())

// application routes
app.use( '/auth', authRoutes )
app.use( '/products', productRoutes );
app.use( '/user', userRoutes )
app.use( '/payments', paymentRoutes )

// running application
app.listen(port, () => console.log(`App listening at port ${port}`));