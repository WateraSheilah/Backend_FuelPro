// pages/api/readings/[stationId].ts

import { connectToDatabase } from "@/utils/mongodb";
import { NextApiRequest, NextApiResponse } from "next";
import { ObjectId } from "mongodb";

interface Reading {
    _id: ObjectId;
    temperature: string;
    sulfur: string;
    color: string;
    createdAt: Date;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { readingId } = req.body; // Changed to req.query for GET method

    if (!readingId || !ObjectId.isValid(readingId as string)) {
        return res.status(400).json({ error: 'Invalid or missing reading ID' });
    }

    try {
        const db = await connectToDatabase();
        const readingsCollection = db.collection<Reading>('readings');

        // Convert readingId from string to ObjectId and check for existence
        const reading = await readingsCollection.findOne({ _id: new ObjectId(readingId as string) }, {
            projection: { _id: 0, stationId:0, createdAt: 0 }  // Exclude _id and createdAt from the response
        });

        if (!reading) {
            return res.status(404).json({ message: 'No reading found for this ID' });
        }

        res.status(200).json(reading);
    } catch (error) {
        console.error('Error fetching reading:', error);
        res.status(500).json({ error: 'Internal server error', details: error });
    }
}
