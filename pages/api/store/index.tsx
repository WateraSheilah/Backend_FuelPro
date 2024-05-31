// pages/api/readings/[stationId].ts

import { connectToDatabase } from "@/utils/mongodb";
import { NextApiRequest, NextApiResponse } from "next";
import { ObjectId } from "mongodb";

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

    const { stationId } = req.body;  // Extract the stationId from the URL

    if (!ObjectId.isValid(stationId as string)) {
        return res.status(400).json({ error: 'Invalid station ID' });
    }

    try {
        const db = await connectToDatabase();
        const readingsCollection = db.collection<Reading>('readings');

        // Convert stationId from string to ObjectId and fetch readings
        const readings = await readingsCollection.find({ stationId: new ObjectId(stationId as string) }).toArray();

        if (!readings.length) {
            return res.status(404).json({ message: 'No readings found for this station' });
        }

        res.status(200).json(readings);
    } catch (error) {
        console.error('Error fetching readings for station:', error);
        res.status(500).json({ error: 'Internal server error', details: error });
    }
}
