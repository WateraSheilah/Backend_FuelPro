import { connectToDatabase } from "@/utils/mongodb";
import { ObjectId } from 'mongodb';

type User = {
    _id: ObjectId,
    fuelRecordings: ObjectId[],
    // Other fields...
};

export async function addFuelRecording(userId: ObjectId, recordingId: ObjectId) {
    const db = await connectToDatabase();
    const usersCollection = db.collection<User>('users');
    await usersCollection.updateOne(
        { _id: userId },
        { $push: { fuelRecordings: recordingId } }
    );
}
