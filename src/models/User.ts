export interface AppUser {
    //id: string;
    firstName: string;
    lastName: string;
    username: string;
    password: string;
    email: string;
    phoneNumber: string;
    //cars: Car[];
}
//can you hear me -> (Speak) "We cant hear you";
export interface Car {
    id: string;
    name: string;
    engineType: string;
    plateNumber: string;
}
