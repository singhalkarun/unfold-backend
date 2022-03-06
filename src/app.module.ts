import { Module } from '@nestjs/common';
import { ChatGateway } from './chat/chat.gateway';
import { SocketStateModule } from './shared/socket-state/socket-state.module';

@Module({
  imports: [SocketStateModule],
  controllers: [],
  providers: [ChatGateway],
})
export class AppModule {}
