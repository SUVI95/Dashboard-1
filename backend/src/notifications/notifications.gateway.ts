import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, Socket>();

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.userSockets.set(userId, client);
      console.log(`User ${userId} connected to WebSocket`);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.userSockets.delete(userId);
      console.log(`User ${userId} disconnected from WebSocket`);
    }
  }

  sendToUser(userId: string, event: string, data: any) {
    const socket = this.userSockets.get(userId);
    if (socket) {
      socket.emit(event, data);
    }
  }

  notifyTaskProgress(userId: string, taskId: string, progress: number, status: string) {
    this.sendToUser(userId, 'task:progress', {
      taskId,
      progress,
      status,
      timestamp: new Date(),
    });
  }

  notifyTaskCompleted(userId: string, taskId: string, result: any) {
    this.sendToUser(userId, 'task:completed', {
      taskId,
      result,
      timestamp: new Date(),
    });
  }

  notifyCvParsed(userId: string, cvId: string) {
    this.sendToUser(userId, 'cv:parsed', {
      cvId,
      timestamp: new Date(),
    });
  }
}

