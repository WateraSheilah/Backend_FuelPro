import { connectToDatabase } from "@/utils/mongodb";
import { ObjectId } from 'mongodb';

type User = {
    _id: ObjectId,
    petrolStations: ObjectId[],  // Assuming there's a petrolStations array in the User document
};

// Function to add a new ObjectId to the petrolStations array of a user
export async function addPetrolStation(userId: ObjectId, stationId: ObjectId) {
    const db = await connectToDatabase();
    const usersCollection = db.collection<User>('users');

    // Perform the update to add the new stationId to the petrolStations array
    await usersCollection.updateOne(
        { _id: userId },
        { $push: { petrolStations: stationId } }
    );
}
