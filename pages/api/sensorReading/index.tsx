import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/utils/mongodb';

interface SensorReading {
    username: string;
    temperature: number;
    color: string;
    sulfur: number;
}

export default async function SensorReading(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const db = await connectToDatabase();
            const collection = db.collection('readings');

            const sensorData: SensorReading = req.body;
            const { username, temperature, color, sulfur } = sensorData;

            if (!username) {
                return res.status(400).json({ error: 'Please add username' });
            }

            // Insert the sensor readings associated with the username
            const result = await collection.insertOne({ username, temperature, color, sulfur });

            res.status(201).json({ message: 'Sensor readings inserted successfully', insertedId: result.insertedId });
        } catch (error) {
            console.error('Error during sensor readings insertion:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}
