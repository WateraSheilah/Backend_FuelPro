import { connectToDatabase } from "@/utils/mongodb";
import { NextApiRequest, NextApiResponse } from "next";
import { ObjectId } from "mongodb";

interface User {
    _id: string;
    username: string;
    fuelRecordings: string[];
}

interface Reading {
    temperature: string;
    sulfur: string;
    color: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { readingId } = req.body;
    // console.log("Received username:", username);

    if (!readingId) {
        return res.status(400).json({ error: 'Username query parameter is required' });

    }

    try {
        const db = await connectToDatabase();

        const usersCollection = db.collection<User>('users');
        const readingsCollection = db.collection<Reading>('readings');

        // Find the user by username
        const user = await usersCollection.findOne({ readingId });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!user.fuelRecordings || user.fuelRecordings.length === 0) {
            return res.status(404).json({ message: 'No fuel recordings found for this user' });
        }

        // get the sensorreading that belongs to the first ObjectId in the fuelRecordings array
        const firstRecordingId = new ObjectId(user.fuelRecordings[user.fuelRecordings.length - 1]);
        const reading = await readingsCollection.findOne({_id: firstRecordingId}, {
            projection: { _id: 0, createdAt: 0 }
        });

        if (!reading) {
            return res.status(404).json({ message: 'Recording not found' });
        }
        res.status(200).json({ reading });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}
