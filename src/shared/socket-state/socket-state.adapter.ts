import {
  INestApplicationContext,
  WebSocketAdapter,
  WsMessageHandler,
} from '@nestjs/common';
import { EMPTY, filter, fromEvent, mergeMap, Observable } from 'rxjs';
import socketio from 'socket.io';
import { SocketStateService } from './socket-state.service';
import { IoAdapter } from '@nestjs/platform-socket.io';

export interface SocketWithName extends socketio.Socket {
  name: string;
}

export class SocketStateAdapter extends IoAdapter implements WebSocketAdapter {
  constructor(
    private readonly app: INestApplicationContext,
    private readonly socketStateService: SocketStateService,
  ) {
    super(app);
  }

  public create(
    port: number,
    options: socketio.ServerOptions,
  ): socketio.Server {
    const server = super.createIOServer(port, options);

    return server;
  }

  bindClientConnect(server: socketio.Server, callback: Function) {
    server.on('connection', (socket: any) => {
      this.socketStateService.add(socket);

      socket.on('disconnect', () => {
        this.socketStateService.remove(socket.id);

        socket.removeAllListeners('disconnect');
      });

      socket.on('close', () => {
        this.socketStateService.remove(socket.id);
      });

      socket.on('connect_error', () => {
        this.socketStateService.remove(socket.id);
      });

      callback(socket);
    });
  }
}
