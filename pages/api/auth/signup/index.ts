import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from "@/utils/mongodb";
import {hashpassword, validatePassword} from "@/utils/password";

interface SignupData {
    username: string;
    password: string;
    phoneNumber: number;
}

export default async function Signup(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const db = await connectToDatabase();
            const usersCollection = db.collection('users');

            const formData: SignupData = req.body;
            const { username, password, phoneNumber } = formData;

            if (!username) {
                return res.status(400).json({ error: 'Please add username' });
            }
            if (!password) {
                return res.status(400).json({ error: 'Please add password' });
            }
            if (password.trim().length < 7) {
                return res.status(400).json({ error: 'Please provide a longer password' });
            }
            if (!phoneNumber) {
                return res.status(400).json({ error: 'Please add phone number' });
            }

            // Check if the username already exists
            const existingUser = await usersCollection.findOne({ username });
            if (existingUser) {
                return res.status(400).json({ error: 'Username already exists' });
            }

            // Hash the password
            const hashedPassword = await hashpassword(password);

            // Insert the user data into the users collection
            const result = await usersCollection.insertOne({
                username,
                password: hashedPassword,
                phoneNumber,
                // userToken,
                petrolStations: []

            });

            res.status(200).json({ message: 'User registered successfully'});
        } catch (error) {
            console.error('Error during signup:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}
