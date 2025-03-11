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

  private connectedUsers: Map<string, string> = new Map(); // socketId -> email
  private userSockets: Map<number, string> = new Map(); // userId -> socketId

  constructor(
    private readonly usersService: UsersService,
    private readonly messageService: MessageService,
  ) {}

  async handleConnection(@ConnectedSocket() client: Socket) {
    const userEmail = client.handshake.query.User;

    if (userEmail && typeof userEmail === 'string') {
      this.connectedUsers.set(client.id, userEmail);

      const userResult = await this.usersService.findByEmail(userEmail);
      if (userResult.success && userResult.data) {
        this.userSockets.set(userResult.data.id, client.id);
      }

      console.log('User connected:', userEmail);

      this.server.emit('userConnected', {
        email: userEmail,
        timestamp: new Date().toISOString()
      });
    }

    const usersResult = await this.usersService.findAll();
    if (usersResult.success) {
      this.server.emit('users', usersResult.data);
    } else {
      console.error('Failed to fetch users:', usersResult.message);
    }
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    const userEmail = this.connectedUsers.get(client.id);
    if (userEmail) {
      console.log('User disconnected:', userEmail);
      this.connectedUsers.delete(client.id);

      const userResult = await this.usersService.findByEmail(userEmail);
      if (userResult.success && userResult.data) {
        this.userSockets.delete(userResult.data.id);
      }

      this.server.emit('userDisconnected', { email: userEmail });
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() message: Message,
  ) {
    try {
      const receiverSocketId = this.userSockets.get(message.receiverId);

      if (receiverSocketId) {
        this.server.to(receiverSocketId).emit('newMessage', message);
      }

      client.emit('newMessage', message);
      return message;
    } catch (error) {
      console.error('Error handling message:', error);
      throw error;
    }
  }

  async updateUsers() {
    const usersResult = await this.usersService.findAll();
    if (usersResult.success) {
      this.server.emit('users', usersResult.data);
    } else {
      console.error('Failed to fetch users:', usersResult.message);
    }
  }

  async handleUserAuth(email: string) {
    this.server.emit('userConnected', {
      email,
      timestamp: new Date().toISOString()
    });

    await this.updateUsers();
  }
}