import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Configuration as configKeys } from "../config/config.keys";

export const databaseProviders = [
  TypeOrmModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    name: 'postgres',
    async useFactory(config: ConfigService) {
      return {
        type: 'postgres',
        host: config.get<string>(configKeys.DB_HOST),
        port: config.get<number>(configKeys.DB_PORT),
        username: config.get<string>(configKeys.DB_USERNAME),
        password: config.get<string>(configKeys.DB_PASSWORD),
        database: config.get<string>(configKeys.DB_NAME),
        autoLoadEntities: true,
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
        ssl: true,
        synchronize: true,
      };
    },
  }),
]