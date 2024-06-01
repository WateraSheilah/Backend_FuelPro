import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/utils/mongodb';
import { ObjectId } from 'mongodb';

type User = {
    _id: ObjectId,
    fuelRecordings: ObjectId[],
    // Other fields...
};

type SensorReading = {
    temperature: number,
    sulfur: number,
    color: string,
    createdAt: Date,  // Date and time the reading was created
    stationId: ObjectId,  // ID of the petrol station
};

type PetrolStationDetails = {
    _id: ObjectId,
    petrolStationName: string,
    petrolStationLocation: string,
    // Other fields...
};

export default async function History(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method Not Allowed' });
        return;
    }

    const { username } = req.body;

    if (!username) {
        res.status(400).json({ error: 'Username isn\'t logged in' });
        return;
    }

    try {
        const db = await connectToDatabase();
        const usersCollection = db.collection<User>('users');

        const user = await usersCollection.findOne({ username }, { projection: { _id: 1, fuelRecordings: 1 } });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        if (!user.fuelRecordings || user.fuelRecordings.length === 0) {
            res.status(200).json({ message: 'No data available for this user' });
            return;
        }

        console.log('User found:', user);

        const readingsCollection = db.collection<SensorReading>('readings');

        // Convert fuelRecording IDs to ObjectId
        const fuelRecordingIds = user.fuelRecordings.map(id => new ObjectId(id.toString()));

        console.log('Fuel recording IDs:', fuelRecordingIds);

        // Retrieve sensor readings
        const sensorReadings = await readingsCollection.find(
            { _id: { $in: fuelRecordingIds } }
        ).toArray();

        console.log('Sensor readings retrieved:', sensorReadings);

        if (sensorReadings.length === 0) {
            res.status(200).json({ message: 'No sensor data available for the recorded entries' });
            return;
        }

        // Retrieve petrol station details
        const stationIds = sensorReadings.map(reading => reading.stationId);
        const petrolStationsCollection = db.collection<PetrolStationDetails>('petrolStations');
        const petrolStations = await petrolStationsCollection.find(
            { _id: { $in: stationIds } }
        ).toArray();

        console.log('Petrol stations retrieved:', petrolStations);

        const stationDetailsMap = petrolStations.reduce((acc, station) => {
            acc[station._id.toString()] = station;
            return acc;
        }, {} as Record<string, PetrolStationDetails>);

        const enrichedRecordings = sensorReadings.map(record => ({
            ...record,
            petrolStationName: stationDetailsMap[record.stationId.toString()]?.petrolStationName,
            petrolStationLocation: stationDetailsMap[record.stationId.toString()]?.petrolStationLocation
        }));

        res.status(200).json({ sensorReadings: enrichedRecordings });
    } catch (error) {
        console.error('Error fetching sensor readings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
