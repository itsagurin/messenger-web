import { Injectable } from '@nestjs/common';
import {PrismaService} from "../prisma.service";
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) {}

    async register(email: string, password: string) {
        // Проверка: существует ли пользователь с таким email
        const existingUser = await this.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new Error('Пользователь с таким email уже существует');
        }

        // Хэшируем пароль
        const hashedPassword = await bcrypt.hash(password, 10);

        // Создаём нового пользователя
        const newUser = await this.prisma.user.create({
            data: { email, password: hashedPassword },
        });

        return { message: 'Регистрация успешна', userId: newUser.id };
    }

    async login(email: string, password: string) {
        // Ищем пользователя по email
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new Error('Пользователь с таким email не найден');
        }

        // Проверяем пароль
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Неверный пароль');
        }

        return { message: 'Вход успешен', userId: user.id };
    }
}
