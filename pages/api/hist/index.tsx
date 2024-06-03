import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/utils/mongodb';
import { ObjectId } from 'mongodb';

type User = {
    _id: ObjectId;
    username: string;
    fuelRecordings: ObjectId[];
};

type SensorReading = {
    temperature: number;
    sulfur: number;
    color: string;
    createdAt: Date;
    stationId: ObjectId;
};

type PetrolStation = {
    _id: ObjectId;
    station: string;
    location: string;
};

export default async function History(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
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
        const readingsCollection = db.collection<SensorReading>('readings');
        const petrolStationsCollection = db.collection<PetrolStation>('petrolstation');

        const user = await usersCollection.findOne({ username }, { projection: { _id: 1, fuelRecordings: 1 } });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        if (!user.fuelRecordings || user.fuelRecordings.length === 0) {
            res.status(200).json({ message: 'No data available for this user' });
            return;
        }

        const projection = {
            temperature: 1,
            sulfur: 1,
            color: 1,
            createdAt: 1,
            stationId: 1,
            _id: 0
        };

        const fuelRecordings = await readingsCollection.find(
            { _id: { $in: user.fuelRecordings } },
            { projection }
        ).toArray();

        if (fuelRecordings.length > 0) {
            const stationIds = fuelRecordings.map(reading => reading.stationId);
            const petrolStations = await petrolStationsCollection.find(
                { _id: { $in: stationIds } },
                { projection: { station: 1, location: 1 } }
            ).toArray();

            const stationMap = petrolStations.reduce((map, station) => {
                map[station._id.toString()] = {
                    station: station.station,
                    location: station.location,
                };
                return map;
            }, {} as { [key: string]: { station: string; location: string } });

            const readingsWithStationDetails = fuelRecordings.map(reading => ({
                createdAt: reading.createdAt,
                station: stationMap[reading.stationId.toString()]?.station || 'Unknown',
                location: stationMap[reading.stationId.toString()]?.location || 'Unknown',
                temperature: reading.temperature,
                sulfur: reading.sulfur,
                color: reading.color
            }));

            res.status(200).json({ sensorReadings: readingsWithStationDetails });
        } else {
            res.status(200).json({ message: 'No sensor data available for the recorded entries' });
        }
    } catch (error) {
        console.error('Error fetching sensor readings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
