import {NextApiRequest, NextApiResponse} from "next";
import {connectToDatabase} from "@/utils/mongodb";
import {addPetrolStation} from "@/utils/addPetrolStation";

interface PetrolStation {
    location: string;
    station: string;

}

export default async function PetrolStation(req: NextApiRequest, res: NextApiResponse){
    if(req.method === "POST"){
        try {
            const db = await connectToDatabase();
            const usersCollection = db.collection('users');
            const collection = db.collection('petrolstation');

            const { username } = req.body;


            const stationData: PetrolStation = req.body;
            const {
                station,
                location,

            } = stationData;

            // Check if the user exists
            const user = await usersCollection.findOne({ username: username });
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Validate required fields
            if (!station || !location) {
                return res.status(400).json({ error: 'Petrol station name and location are required' });
            }

            // Insert the petrol station readings associated with the username
            const result = await collection.insertOne({
                station,
                location,
                createdAt: new Date(),
                // updatedAt: Date.now,
            });
            // Update the user's fuelRecordings array with the new recording ObjectId
            await addPetrolStation(user._id, result.insertedId);

            res.status(200).json({ message: 'Petrol Station Details inserted successfully'});


        }catch (error){
            console.error('Error during pertol station readings insertion:', error);
            res.status(500).json({ error: 'Internal server error' });

        }
    }else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}