// pages/api/readings/create.ts

import { connectToDatabase } from "@/utils/mongodb";
import { NextApiRequest, NextApiResponse } from "next";
import { ObjectId } from "mongodb";
import { addFuelRecording } from "@/utils/addFuelRecording";
import { latestMessage } from "@/utils/connectToMQTTBroker";

interface Reading {
    stationId: ObjectId;
    temperature: string;
    sulfur: string;
    color: string;
    createdAt: Date;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { username, stationId } = req.body;

    // Validate the incoming data
    if (!username || !stationId) {
        return res.status(400).json({ error: 'Username and station ID must be provided' });
    }

    // Validate the latest message data
    if (!latestMessage.data) {
        return res.status(400).json({ error: 'No latest message data available' });
    }

    const { temperature, sulfur, color } = latestMessage.data;

    try {
        const db = await connectToDatabase();
        const readingsCollection = db.collection<Reading>('readings');
        const usersCollection = db.collection('users');

        // Check if the user exists
        const user = await usersCollection.findOne({ username: username });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Convert the stationId from string to ObjectId for comparison
        const stationObjectId = new ObjectId(stationId);

        // Check if the stationId exists in the user's petrol stations array
        const stationExists = user.petrolStations && user.petrolStations.some((id: ObjectId) => id.equals(stationObjectId));
        if (!stationExists) {
            return res.status(400).json({ error: 'Station ID not associated with this user' });
        }

        const newReading = {
            stationId: stationObjectId, // Ensure stationId is stored as ObjectId
            temperature,
            sulfur,
            color,
            createdAt: new Date() // Capture the current date and time
        };

        // Insert the new reading into the database
        const result = await readingsCollection.insertOne(newReading);

        // Update the user's fuelRecordings array with the new recording ObjectId
        await addFuelRecording(user._id, result.insertedId);
        if (result.acknowledged) {
            res.status(200).json({ message: 'Reading successfully added', readingId: result.insertedId });
        } else {
            res.status(400).json({ error: 'Failed to add reading' });
        }
    } catch (error) {
        console.error('Error adding reading:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
