import { Car } from '../models/User';
import { UserRepository } from '../repositories/UserRepository';

export class CarService {
    private userRepository: UserRepository;

    constructor(userRepository: UserRepository) {
        this.userRepository = userRepository;
    }
/**
    async addCarToUser(userId: string, car: Car): Promise<void> {
        try {

            const user = await this.userRepository.getUserById(userId);

            if (!user) {
                throw new Error(`User with ID ${userId} not found`);
            }


            user.cars.push(car);


            await this.userRepository.updateUser(user);
        } catch (error) {
            console.error('Error adding car to user:', error);
            throw new Error('Failed to add car to user');
        }
    }*/
}
