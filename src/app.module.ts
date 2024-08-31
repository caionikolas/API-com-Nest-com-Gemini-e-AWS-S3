import { Module } from '@nestjs/common'
import { PrismaService } from './prisma/prisma.service'
import { UploadMeasure } from './controllers/upload-measure.controller'
import { ConfigModule } from '@nestjs/config'
import { envSchema } from './env'
import { ConfirmMeasure } from './controllers/confirm-measure.controller'
import { GetMeasureList } from './controllers/get-measure-list.controller'
import { Teste } from './controllers/testando.controller'
import { UploadService } from './s3/upload-client'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core'

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
  ],
  controllers: [UploadMeasure, ConfirmMeasure, GetMeasureList, Teste],
  providers: [
    PrismaService,
    UploadService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
