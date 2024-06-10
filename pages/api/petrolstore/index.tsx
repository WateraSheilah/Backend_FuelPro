import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/utils/mongodb";
import { ObjectId } from "mongodb";
import { addPetrolStation } from "@/utils/addPetrolStation";

interface PetrolStation {
    username: string;
    station: string;
    location: string;
    temperature: string;
    color: Object;
    sulfur: string;
}
 
export default async function StoreReadings(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        try {
            const { username, station, location, temperature, color, sulfur }: PetrolStation = req.body;

            if (!username ) {
                return res.status(400).json({ error: 'Username is required' });
            }else if(!station){
                return res.status(400).json({ error: 'Station is required' });
            } else if(!location){
                return res.status(400).json({ error: 'Location is required' });
            }else if( !temperature ){
                return res.status(400).json({ error: 'Tempereture is required' });
            }else if (!sulfur){
                return res.status(400).json({ error: 'Sulfur is required' });
            }else if(!color){
                return res.status(400).json({ error: 'Color is required' });
            }

            const db = await connectToDatabase();
            const collection = db.collection('readings');
            const usersCollection = db.collection('users');

            const user = await usersCollection.findOne({ username });
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            const newReading = {
                userId: new ObjectId(user._id),
                station,
                location,
                temperature,
                color,
                sulfur,
                createdAt: new Date()
            };

            const result = await collection.insertOne(newReading);

            await addPetrolStation(user._id, result.insertedId);
            res.status(200).json({
                message: 'Petrol station reading added successfully',
                // readingId: result.insertedId
            });
        } catch (error) {
            console.error('Error adding petrol station reading:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}
