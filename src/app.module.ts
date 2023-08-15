import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TrackModule } from './track/track.module';
import { MongooseModule } from '@nestjs/mongoose';
import { FileModule } from './file/file.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { resolve } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ServeStaticModule.forRoot({
      rootPath: resolve(__dirname, 'static'),
    }),
    MongooseModule.forRoot(process.env.MONGO_URL),
    TrackModule,
    FileModule,
  ],
})
export class AppModule {}
