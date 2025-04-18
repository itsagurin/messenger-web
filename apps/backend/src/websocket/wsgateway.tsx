import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UsersService } from '../users/users.service';
import { MessageService } from '../message/message.service';
import { WebSocketEvents} from './constants/websocket-events.enum';

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  text: string;
  createdAt: string;
  status: string;
}

@WebSocketGateway({ cors: { origin: '*' } })
export class UsersGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers: Map<string, string> = new Map();
  private userSockets: Map<number, string> = new Map();

  constructor(
    private readonly usersService: UsersService,
    private readonly messageService: MessageService,
  ) {}

  async handleConnection(@ConnectedSocket() client: Socket) {
    const userEmail = client.handshake.query.User;

    if (userEmail && typeof userEmail === 'string') {
      this.connectedUsers.set(client.id, userEmail);

      const userResult = await this.usersService.findByEmail(userEmail);
      if (userResult) {
        this.userSockets.set(userResult.id, client.id);
      }

      console.log('User connected:', userEmail);

      this.server.emit('userConnected', {
        email: userEmail,
        timestamp: new Date().toISOString()
      });
    }

    const users = await this.usersService.findAll();
    this.server.emit('users', users);
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    const userEmail = this.connectedUsers.get(client.id);
    if (userEmail) {
      console.log('User disconnected:', userEmail);
      this.connectedUsers.delete(client.id);

      const user = await this.usersService.findByEmail(userEmail);
      if (user) {
        this.userSockets.delete(user.id);
      }

      this.server.emit(WebSocketEvents.USER_DISCONNECTED, { email: userEmail });
    }
  }

  @SubscribeMessage(WebSocketEvents.SEND_MESSAGE)
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() message: Message,
  ) {
    try {
      const receiverSocketId = this.userSockets.get(message.receiverId);

      if (receiverSocketId) {
        this.server.to(receiverSocketId).emit(WebSocketEvents.NEW_MESSAGE, message);
      }

      client.emit(WebSocketEvents.NEW_MESSAGE, message);
      return message;
    } catch (error) {
      console.error('Error handling message:', error);
      throw error;
    }
  }

  async updateUsers() {
    const users = await this.usersService.findAll();
    this.server.emit(WebSocketEvents.USERS, users);
  }

  async handleUserAuth(email: string) {
    this.server.emit(WebSocketEvents.USER_CONNECTED, {
      email,
      timestamp: new Date().toISOString()
    });

    await this.updateUsers();
  }
}