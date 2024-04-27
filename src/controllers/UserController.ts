import { NextApiRequest, NextApiResponse } from 'next';
import {Car, AppUser as User} from '../models/User';
import { UserService } from '../services/UserService';
import { UserRepository } from '../repositories/UserRepository';
import { CarService } from '../services/CarService';

const userRepository = new UserRepository();
const carService = new CarService(userRepository);
const userService = new UserService(userRepository, carService);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            await userRepository.connect();

            const userData: User = req.body.user;
            //const carsData: Car[] = req.body.cars;

            //await userService.createUser(userData, carsData);

            res.status(201).json({ message: 'User created successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        } finally {
            await userRepository.close();
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
