import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { SocketStateService } from 'src/shared/socket-state/socket-state.service';
import * as socketio from 'socket.io';
import { randomInt } from 'crypto';

export interface Message {
  text: string;
}

@WebSocketGateway(3001, { cors: true })
export class ChatGateway {
  constructor(private readonly socketStateService: SocketStateService) {}

  @SubscribeMessage('message')
  handleMessage(client: any, payload: Message) {
    const currentUser = this.socketStateService.get(client.id);

    if (currentUser.connectedTo !== null) {
      currentUser.connectedTo.socket.emit('message', payload);
    }
  }

  @SubscribeMessage('userDisconnect')
  handleDisconnect(client: socketio.Socket, payload: any) {
    const currentUser = this.socketStateService.get(client.id);

    let connectedUserSocket;

    if (currentUser.connectedTo !== null) {
      currentUser.connectedTo.connectedTo = null;

      connectedUserSocket = currentUser.connectedTo.socket;
      currentUser.connectedTo = null;
    }

    if (connectedUserSocket) {
      connectedUserSocket.emit('userDisconnect');
    }
  }

  @SubscribeMessage('userConnect')
  handleConnect(client: socketio.Socket, payload: any) {
    this.connectUser(client);
  }

  connectUser = (client: socketio.Socket) => {
    const currentUser = this.socketStateService.get(client.id);

    const users = this.socketStateService.getAllExceptMe(client);

    const length = users.length;

    if (length === 0) {
      return;
    }

    const connectToUser = this.socketStateService.get(
      users[randomInt(length)].socket.id,
    );

    if (connectToUser.socket.connected === false) {
      this.socketStateService.remove(connectToUser.socket);

      this.connectUser(client);
    } else {
      this.socketStateService.connectUsers(currentUser, connectToUser);

      client.emit('userConnect', { name: connectToUser.name });

      connectToUser.socket.emit('userConnect', { name: currentUser.name });
    }
  };
}
