import { Injectable, NestMiddleware } from '@nestjs/common';
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

    async sendMessage(senderId: number, text: string) {
        return this.prisma.message.create({
            data: {
                senderId,
                text,
            },
        });
    }

    async getUserMessages(userId: number) {
        return this.prisma.message.findMany({
            where: { senderId: userId },
            orderBy: { createdAt: 'asc' },
        });
    }
}

@Injectable()
export class CorsMiddleware implements NestMiddleware {
    use(req: any, res: any, next: () => void) {
        res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Credentials', 'true');
        if (req.method === 'OPTIONS') {
            res.status(204).send();
            return;
        } else {
            next();
        }
    }
}
