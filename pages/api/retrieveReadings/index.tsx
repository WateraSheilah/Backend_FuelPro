import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/utils/mongodb';
import { ObjectId } from 'mongodb';

// Define types for better type-checking and readability
interface User {
    _id: ObjectId;
    username: string;
    sensorReadings: ObjectId[];  // Array of ObjectIds pointing to readings
}

interface SensorReading {
    _id: ObjectId;
    temperature: number;
    sulfur: number;
    color: string;
    createdAt: Date;
}

export default async function getUserSensorReadings(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { username } = req.query;  // Assume username is passed as a query parameter

    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    try {
        const db = await connectToDatabase();
        const usersCollection = db.collection<User>('users');
        const readingsCollection = db.collection<SensorReading>('readings');

        // Find the user by username
        const user = await usersCollection.findOne({ username: username as string });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Retrieve all sensor readings associated with the user
        const sensorReadings = await readingsCollection.find({
            _id: { $in: user.sensorReadings }
        }).toArray();

        if (sensorReadings.length === 0) {
            return res.status(200).json({ message: 'No sensor readings available for this user' });
        }

        res.status(200).json({ sensorReadings });
    } catch (error) {
        console.error('Error fetching sensor readings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
