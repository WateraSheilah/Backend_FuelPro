// utils/mongodb.ts

import { MongoClient, Db } from 'mongodb';
import {connect} from "node:net";

//const uri = 'mongodb://localhost:27017';
// const connectionString= "mongodb+srv://hyde:An0ther12@hyde.9vshdl0.mongodb.net/";
const connectionString="mongodb://localhost:27017/";
const dbName = 'fuelpro';
const mClient: MongoClient = new MongoClient(connectionString);

export async function connectToDatabase() {
        const dtbs:MongoClient = await  mClient.connect();
        return dtbs.db(dbName);
}

export  async function closeClient(){
   await mClient.close();
}