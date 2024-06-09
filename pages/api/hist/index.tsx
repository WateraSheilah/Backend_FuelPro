import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/utils/mongodb';
import { ObjectId } from 'mongodb';

type User = {
    _id: ObjectId,
    history: ObjectId[],
};

type History = {
    temperature: number,
    sulfur: number,
    color: string,
    createdAt: Date,  
    station: string,  
    location: string, 
}

export default async function History(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method Not Allowed' });
        return;
    }

    const { username } = req.body;

    if (!username) {
        res.status(400).json({ error: 'Username doesnt exist' });
        return;
    }

    try {
        const db = await connectToDatabase();
        const usersCollection = db.collection<User>('users');
        const readingsCollection = db.collection<History>('readings');

        const user = await usersCollection.findOne({ username }, { projection: { _id: 1, petrolStations: 1 } });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Check if the user has no recordings
        if (!user.petrolStations || user.petrolStations.length === 0) {
            res.status(200).json({ message: 'No data available for this user' });
            return;
        }


        const projection = {
            temperature: 1,
            sulfur: 1,
            color: 1,
            station: 1,
            location: 1,
            createdAt: 1,
            _id: 0
        };
        const petrolStations = await readingsCollection.find(
            { _id: { $in: user.petrolStations }},
            { projection }
        ).toArray();


        if (petrolStations.length > 0) {
            res.status(200).json({ sensorReadings: petrolStations });
        } else {
            res.status(200).json({ message: 'No sensor data available for the recorded entries' });
        }
    } catch (error) {
        console.error('Error fetching sensor readings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
