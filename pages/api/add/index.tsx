// pages/api/readings/create.ts

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
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { stationId, temperature, sulfur, color } = req.body;

    // Validate the incoming data
    if (!stationId || temperature == null || sulfur == null || color == null) {
        return res.status(400).json({ error: 'All fields must be provided' });
    }

    try {
        const db = await connectToDatabase();
        const readingsCollection = db.collection<Reading>('readings');

        const newReading = {
            stationId: new ObjectId(stationId), // Ensure stationId is an ObjectId
            temperature,
            sulfur,
            color,
            createdAt: new Date() // Capture the current date and time
        };

        // Insert the new reading into the database
        const result = await readingsCollection.insertOne(newReading);

        if (result.acknowledged) {
            res.status(201).json({ message: 'Reading successfully added', readingId: result.insertedId });
        } else {
            res.status(400).json({ error: 'Failed to add reading' });
        }
    } catch (error) {
        console.error('Error adding reading:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
