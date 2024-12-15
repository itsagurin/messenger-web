import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { UsersService } from '../users/users.service';

@WebSocketGateway({ cors: { origin: '*' } }) // CORS
export class UsersGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly usersService: UsersService) {}

  async handleConnection() {
    console.log('Client connected');

    // При подключении отправляем текущих пользователей
    const users = await this.usersService.findAll();
    this.server.emit('users', users);
  }

  handleDisconnect() {
    console.log('Client disconnected');
  }

  // Метод для обновления пользователей в реальном времени
  async updateUsers() {
    const users = await this.usersService.findAll();
    this.server.emit('users', users);
  }
}