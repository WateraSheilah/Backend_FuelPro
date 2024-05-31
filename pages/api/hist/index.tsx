// pages/api/user/[username]/all-readings.ts

import { connectToDatabase } from "@/utils/mongodb";
import { NextApiRequest, NextApiResponse } from "next";
import { ObjectId } from "mongodb";

interface User {
    _id: ObjectId;
    username: string;
}

interface PetrolStation {
    _id: ObjectId;
    userId: ObjectId;
}

interface Reading {
    stationId: ObjectId;
    temperature: number;
    sulfur: number;
    color: string;
    createdAt: Date;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { username } = req.body;

    try {
        const db = await connectToDatabase();
        const usersCollection = db.collection<User>('users');
        const stationsCollection = db.collection<PetrolStation>('petrolstations');
        const readingsCollection = db.collection<Reading>('readings');

        // First, find the user by username to get their userId
        const user = await usersCollection.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Next, find all petrol stations for this user
        const stations = await stationsCollection.find({ userId: user._id }).toArray();
        const stationIds = stations.map(station => station._id);

        // Finally, fetch all readings from these stations
        const readings = await readingsCollection.find({ stationId: { $in: stationIds } }).toArray();

        res.status(200).json({ readings });
    } catch (error) {
        console.error('Error fetching user readings:', error);
        res.status(500).json({ error: 'Internal server error', details: error });
    }
}

