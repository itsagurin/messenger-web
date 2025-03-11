import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { PrismaService } from "../prisma.service";
import * as bcrypt from 'bcrypt';
import { PlanType, SubStatus } from '@prisma/client';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(private readonly prisma: PrismaService) {}

    async register(email: string, password: string) {
        try {
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
                success: true,
                data: {
                    message: 'Registration successful',
                    userId: result.user.id,
                    email: result.user.email,
                    subscription: {
                        planType: result.subscription.planType,
                        status: result.subscription.status,
                        currentPeriodEnd: result.subscription.currentPeriodEnd,
                    }
                }
            };
        } catch (error) {
            this.logger.error(`Registration Error: ${error.message}`, error.stack);
            return {
                success: false,
                message: error.message
            };
        }
    }

    async login(email: string, password: string) {
        try {
            const user = await this.prisma.user.findUnique({ where: { email } });
            if (!user) {
                throw new Error('No user with this email address was found');
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                throw new Error('Incorrect password');
            }

            return {
                success: true,
                data: {
                    message: 'Entry successful',
                    userId: user.id,
                    email: user.email
                }
            };
        } catch (error) {
            this.logger.error(`Login Error: ${error.message}`, error.stack);
            return {
                success: false,
                message: error.message
            };
        }
    }

    async refreshToken(refreshToken: string) {
        try {
            const user = await this.findUserByRefreshToken(refreshToken);

            if (!user) {
                throw new Error('Invalid refresh token');
            }

            return {
                success: true,
                userId: user.id,
                email: user.email
            };
        } catch (error) {
            this.logger.error(`Refresh Token Error: ${error.message}`, error.stack);
            return {
                success: false,
                message: 'Invalid refresh token'
            };
        }
    }

    async updateRefreshToken(userId: number, refreshToken: string | null) {
        try {
            await this.prisma.user.update({
                where: { id: userId },
                data: { refreshToken },
            });
            return { success: true };
        } catch (error) {
            this.logger.error(`Update Refresh Token Error: ${error.message}`, error.stack);
            return {
                success: false,
                message: error.message
            };
        }
    }

    async findUserByRefreshToken(refreshToken: string) {
        try {
            return this.prisma.user.findFirst({
                where: { refreshToken },
            });
        } catch (error) {
            this.logger.error(`Find User By Refresh Token Error: ${error.message}`, error.stack);
            return null;
        }
    }

    async findAll() {
        try {
            const users = await this.prisma.user.findMany();
            return {
                success: true,
                data: users
            };
        } catch (error) {
            this.logger.error(`Find All Users Error: ${error.message}`, error.stack);
            return {
                success: false,
                message: error.message
            };
        }
    }

    async deleteAllUsers() {
        try {
            await this.prisma.user.deleteMany();
            return {
                success: true,
                message: 'All users have been deleted successfully'
            };
        } catch (error) {
            this.logger.error(`Delete All Users Error: ${error.message}`, error.stack);
            return {
                success: false,
                message: error.message
            };
        }
    }

    async findByEmail(email: string) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { email },
            });
            return {
                success: true,
                data: user
            };
        } catch (error) {
            this.logger.error(`Find By Email Error: ${error.message}`, error.stack);
            return {
                success: false,
                message: error.message
            };
        }
    }

    async deleteCurrentUser(userId: number) {
        try {
            await this.prisma.$transaction(async (prisma) => {
                await prisma.subscription.deleteMany({
                    where: { userId: userId }
                });

                await prisma.message.deleteMany({
                    where: { senderId: userId }
                });

                return prisma.user.delete({
                    where: { id: userId }
                });
            });

            return {
                success: true,
                message: 'Your account has been successfully deleted'
            };
        } catch (error) {
            this.logger.error(`Delete Current User Error: ${error.message}`, error.stack);
            return {
                success: false,
                message: error.message
            };
        }
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