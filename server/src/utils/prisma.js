import { PrismaClient } from '../../generated/prisma/client.js';
import {PrismaPg} from '@prisma/adapter-pg';
import {Pool} from 'pg';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();


const connectionString = process.env.DATABASE_URL;

// This will now catch the error locally if the .env is missing or misnamed
if (!connectionString) {
  throw new Error('DATABASE_URL is not defined in the environment variables.');
}
const pool = new Pool({connectionString});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({adapter});
export default prisma;