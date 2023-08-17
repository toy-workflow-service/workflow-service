import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

function ormConfig(): TypeOrmModuleOptions {
  const commonConf = {
    SYNCRONIZE: true,
    ENTITIES: [__dirname + '/../entities/*{.ts,.js}'],
  };

  const ormconfig: TypeOrmModuleOptions = {
    type: 'mysql',
    database: process.env.MYSQL_DATABASE,
    host: process.env.MYSQL_AWS_HOST,
    port: Number(process.env.MYSQL_PORT),
    username: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    // logging: true,
    synchronize: commonConf.SYNCRONIZE,
    entities: commonConf.ENTITIES,
    namingStrategy: new SnakeNamingStrategy(),
    timezone: 'Asia/Seoul',
  };

  return ormconfig;
}

export { ormConfig };
