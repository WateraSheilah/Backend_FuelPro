import { MongoClient } from 'mongodb';

const mongoURI = 'mongodb://localhost:27017//FuelPro';

export async function connectMongo() {
    const client = new MongoClient(mongoURI);
    await client.connect();
    return client.db();
}
