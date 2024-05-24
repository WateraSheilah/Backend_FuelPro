import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/utils/mongodb';
import {MqttClient} from "mqtt";
import { addFuelRecording } from '@/utils/addFuelRecording';
import { connectToMQTTBroker } from '@/utils/connectToMQTTBroker';  // Assuming this is the correct path

interface FuelRecording {
    username: string;
    sulfur: number;
    color: string;
    temperature: number;
}

export default async function receiveFuelRecordings(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const db = await connectToDatabase();
            const usersCollection = db.collection('users');
            const recordingsCollection = db.collection('readings');

            const { username, sulfur, color, temperature } = req.body as FuelRecording;

            const user = await usersCollection.findOne({ username });
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            if (!username || sulfur === undefined || color === undefined || temperature === undefined) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            // Connect to MQTT Broker and subscribe to the topic
            const mqttClient = connectToMQTTBroker();  // This should return the client

            mqttClient.on('message', async (topic, message) => {
                // Assume message is a JSON string that needs parsing
                const msgData = JSON.parse(message.toString());

                // Insert data received from MQTT into MongoDB
                const result = await recordingsCollection.insertOne({
                    sulfur: msgData.sulfur,
                    color: msgData.color,
                    temperature: msgData.temperature,
                    createdAt: new Date()
                });

                // Update the user's fuelRecordings array with the new recording ObjectId
                await addFuelRecording(user._id, result.insertedId);

                console.log('Fuel recording saved via MQTT');
            });

            res.status(200).json({ message: 'Connected to MQTT and listening for messages' });
        } catch (error) {
            console.error('Error handling request:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}
