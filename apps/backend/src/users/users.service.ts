import { Injectable, NestMiddleware } from '@nestjs/common';
import {PrismaService} from "../prisma.service";
import * as bcrypt from 'bcrypt';
import { PlanType, SubStatus } from '@prisma/client';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) {}

    async register(email: string, password: string) {
        const existingUser = await this.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new Error('A user with this email address already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await this.prisma.$transaction(async (prisma) => {
            const newUser = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    refreshToken: null,
                },
            });

            const subscription = await prisma.subscription.create({
                data: {
                    userId: newUser.id,
                    planType: PlanType.BASIC,
                    status: SubStatus.ACTIVE,
                    currentPeriodStart: new Date(),
                    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                },
            });

            return {
                user: newUser,
                subscription,
            };
        });

        return {
            message: 'Registration successful',
            userId: result.user.id,
            email: result.user.email,
            subscription: {
                planType: result.subscription.planType,
                status: result.subscription.status,
                currentPeriodEnd: result.subscription.currentPeriodEnd,
            },
        };
    }

    async login(email: string, password: string) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new Error('No user with this email address was found');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Incorrect password');
        }

        return {
            message: 'Entry successful',
            userId: user.id,
            email: user.email
        };
    }

    async updateRefreshToken(userId: number, refreshToken: string | null) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { refreshToken },
        });
    }

    async findUserByRefreshToken(refreshToken: string) {
        return this.prisma.user.findFirst({
            where: { refreshToken },
        });
    }

    async findAll() {
        return this.prisma.user.findMany();
    }

    async deleteAllUsers() {
        return this.prisma.user.deleteMany();
    }

    async findByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    async deleteCurrentUser(userId: number) {
        return this.prisma.user.delete({
            where: { id: userId }
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
