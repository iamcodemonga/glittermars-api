import express, { Express } from "express";
import cors from "cors";
import { config } from "dotenv"
import productRoutes from './routes/product'

// app declarations
config();
const app: Express = express();
const port: number = Number(process.env.PORT) || 8000;

// application setup equipments
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json())

// application routes
app.use( '/products', productRoutes );

// running application
app.listen(port, () => console.log(`App listening at port ${port}`));