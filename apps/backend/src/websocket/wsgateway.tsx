import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UsersService } from '../users/users.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class UsersGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers: Map<string, string> = new Map(); // socketId -> email

  constructor(private readonly usersService: UsersService) {}

  async handleConnection(@ConnectedSocket() client: Socket) {

    const userEmail = client.handshake.query.User;

    if (userEmail && typeof userEmail === 'string') {

      this.connectedUsers.set(client.id, userEmail);

      console.log('User connected:', userEmail);

      this.server.emit('userConnected', {
        email: userEmail,
        timestamp: new Date().toISOString()
      });
    }

    const users = await this.usersService.findAll();
    this.server.emit('users', users);
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    const userEmail = this.connectedUsers.get(client.id);
    if (userEmail) {
      console.log('User disconnected:', userEmail);
      this.connectedUsers.delete(client.id);

      this.server.emit('userDisconnected', { email: userEmail });
    }
  }

  async updateUsers() {
    const users = await this.usersService.findAll();
    this.server.emit('users', users);
  }

  async handleUserAuth(email: string) {
    this.server.emit('userConnected', {
      email,
      timestamp: new Date().toISOString()
    });

    await this.updateUsers();
  }
}