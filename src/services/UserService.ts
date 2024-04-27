import { AppUser as User} from '../models/User' ;
import { UserRepository } from '../repositories/UserRepository';
import { Car } from '../models/User';
import { CarService } from './CarService';
import bcrypt from "bcrypt";

export class UserService {
    private userRepository: UserRepository;
    private carService: CarService;

    constructor(userRepository: UserRepository, carService: CarService) {
        this.userRepository = userRepository;
        this.carService = carService;
    }
/**
    async createUser(user: User, cars: Car[]): Promise<void> {

        user.cars = cars;
        const hashedPassword = await bcrypt.hash(user.password, 10);
        user.password = hashedPassword;




        await this.userRepository.createUser(user);


        await Promise.all(cars.map(car => this.carService.addCarToUser(user.id, car)));
    }
        */
    async createUser(user: User): Promise<void> {

        //const hashedPassword = await bcrypt.hash(user.password, 10);
        //user.password = hashedPassword;




        await this.userRepository.createUser(user);


        //await Promise.all(cars.map(car => this.carService.addCarToUser(user.id, car)));
    }
}
