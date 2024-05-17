import { connectToDatabase } from "@/utils/mongodb";
import { ObjectId } from 'mongodb';

type User = {
    _id: ObjectId,
    petrolStations: ObjectId[],  // Adjusted to target petrol stations
    // Other fields...
};

// Function to fetch the array of ObjectId's from the petrolStations field
export async function getPetrolStationsObjectID(userId: ObjectId): Promise<ObjectId[]> {
    const db = await connectToDatabase();
    const usersCollection = db.collection<User>('users');

    // Fetch the user and their petrol stations
    const user = await usersCollection.findOne({ _id: userId }, { projection: { petrolStations: 1 } });

    // Check if user exists and has petrol stations
    if (user && user.petrolStations) {
        return user.petrolStations;
    } else {
        // Return an empty array if no petrol stations are found
        return [];
    }
}
