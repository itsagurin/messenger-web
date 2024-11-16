import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
    findAll(): string[] {
        return ['1', '2', '3'];
    }
}
