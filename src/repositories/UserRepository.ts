import {AppUser} from '../models/User';
import {Db, MongoClient, ObjectId} from 'mongodb';

const mongoURI = 'mongodb://localhost:27017//FuelPro';

export class UserRepository {
    private client: MongoClient;
    private db!: Db;

    constructor() {
        this.client = new MongoClient(mongoURI);
    }

    async connect() {
        await this.client.connect();
        this.db = this.client.db();
    }

    async createUser(user: AppUser): Promise<void> {
        //const userId = new ObjectId();
        //user.id = userId.toHexString();


        await this.db.collection('users').insertOne(user);
    }

    async close(): Promise<void> {
        await this.client.close();
    }

    // async getUserById(userId: string): Promise<AppUser | null> {
    //     try {
    //         const objectId = new ObjectId(userId);
    //
    //
    //         const user = await this.db.collection('users').
    //         findOne({ _id: objectId });
    //
    //         if (user) {
    //             return {
    //                 //id: user._id.toHexString(),
    //                 firstName: user.firstName,
    //                 lastName: user.lastName,
    //                 username: user.username,
    //                 email: user.email,
    //                 phoneNumber: user.phoneNumber,
    //                 password: user.password,
    //                 //cars: user.cars
    //             };
    //         }return null;
    //     } catch (error) {
    //         console.error('Error retrieving user:', error);
    //         throw new Error('Failed to retrieve user');
    //     }
    // }

    // async updateUser(user: AppUser): Promise<void> {
    //     try {
    //         const userId = new ObjectId(user.id);
    //
    //         await this.db.collection('users').updateOne(
    //             { _id: userId },
    //             {
    //                 $set: {
    //                     firstName: user.firstName,
    //                     lastName: user.lastName,
    //                     username: user.username,
    //                 }
    //             }
    //         );
    //     } catch (error) {
    //         console.error('Error updating user:', error);
    //         throw new Error('Failed to update user');
    //     }
    // }
}
