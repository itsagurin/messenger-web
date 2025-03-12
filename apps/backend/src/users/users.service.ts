import { Injectable, NestMiddleware, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from "../prisma.service";
import * as bcrypt from 'bcrypt';
import { PlanType, SubStatus, User } from '@prisma/client';

export interface RegisterResponse {
    userId: number;
    email: string;
    subscription: {
        planType: PlanType;
        status: SubStatus;
        currentPeriodEnd: Date;
    };
}

export interface LoginResponse {
    userId: number;
    email: string;
}

export type RefreshTokenResponse = LoginResponse;

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(private readonly prisma: PrismaService) {}

    async register(email: string, password: string): Promise<RegisterResponse> {
        try {
            const existingUser = await this.prisma.user.findUnique({ where: { email } });
            if (existingUser) {
                throw new HttpException('A user with this email address already exists', HttpStatus.CONFLICT);
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
                userId: result.user.id,
                email: result.user.email,
                subscription: {
                    planType: result.subscription.planType,
                    status: result.subscription.status,
                    currentPeriodEnd: result.subscription.currentPeriodEnd,
                }
            };
        } catch (error) {
            this.logger.error(`Registration Error: ${error.message}`, error.stack);

            if (error instanceof HttpException) {
                throw error;
            }

            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async login(email: string, password: string): Promise<LoginResponse> {
        try {
            const user = await this.prisma.user.findUnique({ where: { email } });
            if (!user) {
                throw new HttpException('No user with this email address was found', HttpStatus.NOT_FOUND);
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                throw new HttpException('Incorrect password', HttpStatus.UNAUTHORIZED);
            }

            return {
                userId: user.id,
                email: user.email
            };
        } catch (error) {
            this.logger.error(`Login Error: ${error.message}`, error.stack);

            if (error instanceof HttpException) {
                throw error;
            }

            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
        try {
            const user = await this.findUserByRefreshToken(refreshToken);

            if (!user) {
                throw new HttpException('Invalid refresh token', HttpStatus.UNAUTHORIZED);
            }

            return {
                userId: user.id,
                email: user.email
            };
        } catch (error) {
            this.logger.error(`Refresh Token Error: ${error.message}`, error.stack);

            if (error instanceof HttpException) {
                throw error;
            }

            throw new HttpException('Invalid refresh token', HttpStatus.UNAUTHORIZED);
        }
    }

    async updateRefreshToken(userId: number, refreshToken: string | null): Promise<void> {
        try {
            await this.prisma.user.update({
                where: { id: userId },
                data: { refreshToken },
            });
            return;
        } catch (error) {
            this.logger.error(`Update Refresh Token Error: ${error.message}`, error.stack);
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findUserByRefreshToken(refreshToken: string): Promise<User | null> {
        try {
            return this.prisma.user.findFirst({
                where: { refreshToken },
            });
        } catch (error) {
            this.logger.error(`Find User By Refresh Token Error: ${error.message}`, error.stack);
            return null;
        }
    }

    async findAll(): Promise<User[]> {
        try {
            const users = await this.prisma.user.findMany();
            return users;
        } catch (error) {
            this.logger.error(`Find All Users Error: ${error.message}`, error.stack);
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async deleteAllUsers(): Promise<void> {
        try {
            await this.prisma.user.deleteMany();
            return;
        } catch (error) {
            this.logger.error(`Delete All Users Error: ${error.message}`, error.stack);
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findByEmail(email: string): Promise<User | null> {
        try {
            const user = await this.prisma.user.findUnique({
                where: { email },
            });
            return user;
        } catch (error) {
            this.logger.error(`Find By Email Error: ${error.message}`, error.stack);
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async deleteCurrentUser(userId: number): Promise<void> {
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

            return;
        } catch (error) {
            this.logger.error(`Delete Current User Error: ${error.message}`, error.stack);
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

@Injectable()
export class CorsMiddleware implements NestMiddleware {
    use(req: any, res: any, next: () => void): void {
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