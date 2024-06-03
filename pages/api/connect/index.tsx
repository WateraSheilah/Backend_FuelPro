import { NextApiRequest, NextApiResponse } from 'next';
import { connectToMQTTBroker, latestMessage } from "@/utils/connectToMQTTBroker";

connectToMQTTBroker();  // Establish the MQTT connection once

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        if (latestMessage.data) {
            res.status(200).json(latestMessage.data);
        } else {
            res.status(404).json({ error: 'No message received yet' });
        }
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}
