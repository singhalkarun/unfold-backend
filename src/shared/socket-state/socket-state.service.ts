import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

export interface User {
  socket: Socket;
  name: any;
  connectedTo: User | null;
}

@Injectable()
export class SocketStateService {
  private socketState = new Map<string, User>();

  public remove(socket: Socket): boolean {
    const existingUser = this.socketState.get(socket.id);

    if (!existingUser) {
      return true;
    }

    if (existingUser.connectedTo !== null) {
      existingUser.connectedTo.connectedTo = null;

      this.socketState.delete(socket.id);

      existingUser.connectedTo.socket.emit('userDisconnect');
    } else {
      this.socketState.delete(socket.id);
    }

    return true;
  }

  public add(socket: Socket): boolean {
    const user: User = {
      socket,
      name: socket.handshake.query?.name
        ? socket.handshake.query?.name
        : 'Stranger',
      connectedTo: null,
    };

    this.socketState.set(socket.id, user);

    return true;
  }

  public get(id: string): User {
    return this.socketState.get(id);
  }

  public getAll(): User[] {
    const all = [];

    this.socketState.forEach((user) => {
      all.push(user);
    });

    return all;
  }

  public getAllExceptMe(socket: Socket): User[] {
    const all = [];

    this.socketState.forEach((user) => {
      if (user.socket.id !== socket.id && user.connectedTo === null) {
        all.push(user);
      }
    });

    return all;
  }

  public connectUsers(userA: User, userB: User) {
    this.socketState.get(userA.socket.id).connectedTo = this.socketState.get(
      userB.socket.id,
    );

    this.socketState.get(userB.socket.id).connectedTo = this.socketState.get(
      userA.socket.id,
    );
  }
}
