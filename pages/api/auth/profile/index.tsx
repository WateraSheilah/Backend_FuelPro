import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/utils/mongodb';

export default async function Profile(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            // Retrieve the username of the authenticated user from the request body or session/token
            const { username } = req.body;

            // Check if username is provided
            if (!username) {
                return res.status(400).json({ error: 'Username is required' });
            }

            // Connect to the database
            const db = await connectToDatabase();
            const collection = db.collection('users');

            // Retrieve the user profile using the username
            const userProfile = await collection.findOne({ username });

            if (!userProfile) {
                return res.status(404).json({ error: 'User profile not found' });
            }

            // Extract relevant fields from the user profile
            const { name, address, phoneNumber } = userProfile;

            // Construct the user profile data to be returned
            const profileData = {
                name,
                username, // Include username in the profile data
                address,
                phoneNumber,
            };

            return res.status(200).json(profileData);
        } catch (error) {
            console.error('Error fetching profile data:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
}
