import jwt from 'jsonwebtoken';
import {config} from 'dotenv';
config();

export const createToken = (user_id, expiresIn) =>  jwt.sign({ id:user_id }, process.env.API_SECRET, { expiresIn });