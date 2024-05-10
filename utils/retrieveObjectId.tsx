import { connectToDatabase } from "@/utils/mongodb";
import { ObjectId } from 'mongodb';

type User = {
    _id: ObjectId,
    fuelRecordings: ObjectId[],
    // Other fields...
};

export async function getObjectID(userId: ObjectId): Promise<ObjectId[]> {
    const db = await connectToDatabase();
    const usersCollection = db.collection<User>('users');

    // Fetch the user and their fuel recordings
    const user = await usersCollection.findOne({ _id: userId }, { projection: { fuelRecordings: 1 } });

    // Check if user exists and has recordings
    if (user && user.fuelRecordings) {
        return user.fuelRecordings;
    } else {
        // Return an empty array if no recordings are found
        return [];
    }
}
