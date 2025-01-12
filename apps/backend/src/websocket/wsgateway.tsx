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

      // Получаем пользователя по email и сохраняем его socket id
      const user = await this.usersService.findByEmail(userEmail);
      if (user) {
        this.userSockets.set(user.id, client.id);
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

      await this.messageService.markMessagesAsRead(message.senderId, message.receiverId);

      return message;
    } catch (error) {
      console.error('Error handling message:', error);
      throw error;
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