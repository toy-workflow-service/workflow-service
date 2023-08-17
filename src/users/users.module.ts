import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/_common/entities/user.entitiy';
import { UploadMiddleware } from 'src/_common/middlewares/upload-middleware';
import { TokenValidMiddleware } from 'src/_common/middlewares/token-valid.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  exports: [UsersModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UploadMiddleware)
      .forRoutes(
        { path: '/users/signup', method: RequestMethod.POST },
        { path: '/users', method: RequestMethod.PATCH },
      );
    consumer.apply(TokenValidMiddleware).forRoutes(UsersController);
  }
}
