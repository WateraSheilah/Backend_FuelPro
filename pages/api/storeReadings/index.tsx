import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/utils/mongodb";
import { ObjectId } from 'mongodb';
import { addFuelRecording } from "@/utils/addFuelRecording";  // Ensure this path is correct

interface FuelRecording {
    username: string;  // To verify the user but not store it
    sulfur: number;
    color: string;
    temperature: number;
}

export default async function receiveFuelRecordings(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const db = await connectToDatabase();
            const usersCollection = db.collection('users');
            const recordingsCollection = db.collection('readings');

            // Extract data from request body, ensuring username is provided for verification
            const { username, sulfur, color, temperature } = req.body as FuelRecording;

            // Check if the user exists in the users collection
            const user = await usersCollection.findOne({ username });
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Validate the data to ensure all necessary fields are present
            if (!username || sulfur === undefined || color === undefined || temperature === undefined) {
                return res.status(400).json({ error: 'Missing required fields: username, sulfur, color, and temperature must be provided.' });
            }

            // Insert the data into the fuelRecordings collection, excluding the username
            const result = await recordingsCollection.insertOne({
                sulfur,
                color,
                temperature,
                createdAt: new Date() // Storing the timestamp of the record
            });

            // Update the user's fuelRecordings array with the new recording ObjectId
            await addFuelRecording(user._id, result.insertedId);

            res.status(201).json({ message: 'Fuel recording saved successfully'});
        } catch (error) {
            console.error('Error saving fuel recording:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}
