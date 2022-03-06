import { NestFactory } from '@nestjs/core';
import { initAdapters } from './adapters.init';
import { AppModule } from './app.module';
import { SocketStateAdapter } from './shared/socket-state/socket-state.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  initAdapters(app);

  await app.listen(3002);
}
bootstrap();
