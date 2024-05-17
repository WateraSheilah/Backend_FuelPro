import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/utils/mongodb";

interface PetrolStation {
    username: string;
    temperature: string;
    color: string;
    sulfur: string;
}

export default async function PetrolRetrieve(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        try {
            const { username } = req.body;

            const db = await connectToDatabase();
            const collection = db.collection('readings');
            const usersCollection = db.collection('users');

            const user = await usersCollection.findOne({ username });
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            const petrolStationDetails = await collection.find({ username }).project({
                temperature: 1, color: 1, sulfur: 1, _id: 0
            }).toArray();

            if (petrolStationDetails.length === 0) {
                return res.status(404).json({ message: 'No data available for this user' });
            }

            res.status(200).json(petrolStationDetails);
        } catch (error) {
            console.error('Error fetching petrol station readings:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}
