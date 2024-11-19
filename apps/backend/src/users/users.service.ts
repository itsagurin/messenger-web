import { Injectable } from '@nestjs/common';
import {PrismaService} from "../prisma.service";
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) {}

    async register(email: string, password: string) {
        // Check if a user with this email exists
        const existingUser = await this.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new Error('A user with this email address already exists');
        }

        // Hashing the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = await this.prisma.user.create({
            data: { email, password: hashedPassword },
        });

        return { message: 'Registration successful', userId: newUser.id };
    }

    async login(email: string, password: string) {
        // Looking for a user by email
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new Error('No user with this email address was found');
        }

        // Checking the password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Incorrect password');
        }

        return { message: 'Entry successful', userId: user.id };
    }

    async findAll() {
        return this.prisma.user.findMany();
    }
}
