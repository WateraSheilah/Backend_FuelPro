import { NextApiRequest, NextApiResponse } from 'next';
import {connectToMQTTBroker, latestMessage} from "@/utils/connectToMQTTBroker";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    connectToMQTTBroker();
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
