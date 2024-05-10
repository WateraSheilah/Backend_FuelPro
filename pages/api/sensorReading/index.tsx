import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/utils/mongodb';
import {addFuelRecording} from "@/utils/addFuelRecording";

interface SensorReading {
    username: string;
    temperature: number;
    color: string;
    sulfur: number;
    petrolstationname: string;
    petrolstationlocation: string;
}

export default async function SensorReading(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const db = await connectToDatabase();
            const usersCollection = db.collection('users');
            const collection = db.collection('readings');

            const sensorData: SensorReading = req.body;
            const { username,
                temperature,
                color,
                sulfur,
                petrolstationname,
                petrolstationlocation } = sensorData;

            // Check if the user exists
            const user = await usersCollection.findOne({ username: username });
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Insert the sensor readings associated with the username
            const result = await collection.insertOne({ username, temperature, color, sulfur });

            // Update the user's fuelRecordings array
            await addFuelRecording(user._id, result.insertedId);


            res.status(201).json({ message: 'Sensor readings inserted successfully'});
        } catch (error) {
            console.error('Error during sensor readings insertion:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}
