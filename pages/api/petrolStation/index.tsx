import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from "@/utils/mongodb";
import { addPetrolStation } from "@/utils/addPetrolStation";
import { ObjectId } from "mongodb";
import { connectToMQTTBroker, latestMessage } from "@/utils/connectToMQTTBroker";
import {addFuelRecording} from "@/utils/addFuelRecording";

connectToMQTTBroker();  // Establish the MQTT connection once

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        const db = await connectToDatabase();
        const usersCollection = db.collection('users');
        const readingsCollection = db.collection('readings');
        const petrolStationsCollection = db.collection('petrolstation');

        const { username, station, location, command } = req.body;

        // Check if the user exists
        const user = await usersCollection.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Validate required fields
        if (!station || !location) {
            return res.status(400).json({ error: 'Petrol station name and location are required' });
        }

        // If command is "check", trigger the MQTT broker connection and proceed with insertion
        if (command === "check") {
            if (!latestMessage.data) {
                return res.status(404).json({ error: 'No message received from MQTT broker yet' });
            }

            // Insert the petrol station details
            const petrolStationResult = await petrolStationsCollection.insertOne({
                station,
                location,
                userId: new ObjectId(user._id),
                createdAt: new Date(),
            });

            // Insert the reading data
            const readingData = {
                stationId: petrolStationResult.insertedId,
                temperature: latestMessage.data.temperature,
                sulfur: latestMessage.data.sulfur,
                color: latestMessage.data.color,
                createdAt: new Date() // Capture the current date and time
            };

            const readingResult = await readingsCollection.insertOne(readingData);

            // Update the  arrays
            await addPetrolStation(user._id, petrolStationResult.insertedId);
            await addFuelRecording(user._id, readingResult.insertedId);

            return res.status(200).json({
                message: 'MQTT broker connection triggered and Petrol Station Details inserted successfully',
                stationId: petrolStationResult.insertedId,
                readingId: readingResult.insertedId,
                // mqttData: latestMessage.data
            });
        } else {
            return res.status(400).json({ error: "The command isn't available" });
        }
    } catch (error) {
        console.error('Error during petrol station readings insertion:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
