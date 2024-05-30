import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase, closeClient } from "@/utils/mongodb";
import { validatePassword } from "@/utils/password";
import jwt from 'jsonwebtoken';

interface LoginData {
    username: string;
    password: string;
}

export default async function Login(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { username, password } = req.body as LoginData;

        // Validate the username and password
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        try {
            const db = await connectToDatabase();
            const collection = db.collection('users');

            // Find the user by username
            const user = await collection.findOne({ username });
            if (!user) {
                return res.status(404).json({ error: 'Username not found' });
            }

            // Validate the password using the utility function
            const passwordMatch = await validatePassword(password, user.password);
            if (!passwordMatch) {
                return res.status(401).json({ error: 'Invalid password' });
            }

            // Password is correct, login successful
            return res.status(200).json({ message: "logged_in",_id:user._id,username:user.username,
            });
        } catch (error) {
            console.error('Error during login:', error);
            return res.status(500).json({ error: 'Internal server error' });
        } finally {
            await closeClient();
        }
    } else {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
}
