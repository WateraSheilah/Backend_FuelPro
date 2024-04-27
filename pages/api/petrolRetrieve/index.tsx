import {NextApiRequest, NextApiResponse} from "next";
import {connectToDatabase} from "@/utils/mongodb";

interface PetrolStation {
    username:string;
    petrolstationlocation: string;
    petrolstationname: string;
}
export  default async function PetrolRetrieve(req: NextApiRequest, res: NextApiResponse){
    if(req.method === "POST"){
        try {
            // Find the user by username
            const { username } = req.body;

            if (!username) {
                return res.status(400).json({ error: 'Please provide a valid username' });
            }
            const db = await connectToDatabase();
            const collection = db.collection('petrolstation');



            // Retrieve Petrol Station details readings associated with the username and exclude _id and username fields
            const petrolstation = await collection.find({ username }).project({ _id: 0, username: 0 }).toArray();

            res.status(200).json(petrolstation);
        } catch (error) {
            console.error('Error fetching sensor readings:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });

    }
}