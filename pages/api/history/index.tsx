import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/utils/mongodb';
import { ObjectId } from 'mongodb';

type User = {
    _id: ObjectId,
    fuelRecordings: ObjectId[],
    // Other fields...
};

type SensorReading = {
    temperature: number,
    sulfur: number,
    color: string,
    createdAt: Date,  // Date and time the reading was created
    petrolStationName: string,  // Name of the petrol station
    petrolStationLocation: string,  // Location of the petrol station
};

export default async function History(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method Not Allowed' });
        return;
    }

    const { username } = req.body;

    if (!username) {
        res.status(400).json({ error: 'Username is required' });
        return;
    }

    try {
        const db = await connectToDatabase();
        const usersCollection = db.collection<User>('users');
        const readingsCollection = db.collection<SensorReading>('readings');

        const user = await usersCollection.findOne({ username }, { projection: { _id: 1, fuelRecordings: 1 } });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Check if the user has no fuel recordings
        if (!user.fuelRecordings || user.fuelRecordings.length === 0) {
            res.status(200).json({ message: 'No data available for this user' });
            return;
        }

        const projection = {
            temperature: 1,
            sulfur: 1,
            color: 1,
            createdAt: 1,
            petrolStationName: 1,
            petrolStationLocation: 1,
            _id: 0  // Exclude _id from the response
        };
        const fuelRecordings = await readingsCollection.find(
            { _id: { $in: user.fuelRecordings }},
            { projection }
        ).toArray();

        if (fuelRecordings.length > 0) {
            res.status(200).json({ sensorReadings: fuelRecordings });
        } else {
            res.status(200).json({ message: 'No sensor data available for the recorded entries' });
        }
    } catch (error) {
        console.error('Error fetching sensor readings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
