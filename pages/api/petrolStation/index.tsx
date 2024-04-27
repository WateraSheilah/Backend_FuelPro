import {NextApiRequest, NextApiResponse} from "next";
import {connectToDatabase} from "@/utils/mongodb";

interface PetrolStation {
    username: string;
    petrolstationlocation: string;
    petrolstationname: string;
}

export default async function PetrolStation(req: NextApiRequest, res: NextApiResponse){
    if(req.method === "POST"){
        try {
            const db = await connectToDatabase();
            const collection = db.collection('petrolstation');

            const stationData: PetrolStation = req.body;
            const { username, petrolstationname, petrolstationlocation} = stationData;

            // Insert the petrol station readings associated with the username
            const result = await collection.insertOne({
                username,
                petrolstationname,
                petrolstationlocation,
                // createdAt: Date.now,
                // updatedAt: Date.now,
            });

            res.status(201).json({ message: 'Petrol Station Details inserted successfully', insertedId: result.insertedId });


        }catch (error){
            console.error('Error during pertol station readings insertion:', error);
            res.status(500).json({ error: 'Internal server error' });

        }
    }else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}