import bcrypt from 'bcrypt';

// Function to hash passwords
export async function hashpassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
}
// Function to compare the provided password with the hashed password
export async function validatePassword(providedPassword: string, storedPassword: string): Promise<boolean> {
    return bcrypt.compare(providedPassword, storedPassword);
}