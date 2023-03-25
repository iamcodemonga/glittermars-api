import { Redis } from "ioredis";
import { config } from 'dotenv'
config();

const url = String(process.env.REDIS_URL);
const redis = new Redis(url)

export default redis;