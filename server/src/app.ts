/* eslint-disable import/first */
process.env.NODE_CONFIG_DIR = `${__dirname}/configs`;
import 'reflect-metadata';

import express from 'express';

import { dbConnection } from '@databases';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import { connect, set } from 'mongoose';
import morgan from 'morgan';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import Routes from '@/interfaces/routes';
import { logger, stream } from '@/utils/logger';
import { globalAuthMiddleware } from '@middlewares/auth.middleware';
import errorMiddleware from '@middlewares/error.middleware';

class App {
  public app: express.Application;
  public port: string | number;
  public env: string;

  constructor(routes: Routes[]) {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.env = process.env.NODE_ENV || 'development';

    this.connectToDatabase();
    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    this.initializeSwagger();
    this.initializeErrorHandling();
  }

  public listen(): void {
    this.app.listen(this.port, () => {
      logger.info(`=================================`);
      logger.info(`======= ENV: ${this.env} =======`);
      logger.info(`🚀 App listening on the port ${this.port}`);
      logger.info(`=================================`);
    });
  }

  public getServer(): express.Application {
    return this.app;
  }

  private connectToDatabase(): void {
    if (this.env !== 'production') {
      set('debug', true);
    }

    connect(dbConnection.url, dbConnection.options);
  }

  private initializeMiddlewares(): void {
    if (this.env === 'production') {
      this.app.use(morgan('combined', { stream }));
      this.app.use(cors({ origin: 'your.domain.com', credentials: true }));
    } else {
      this.app.use(morgan('dev', { stream }));
      this.app.use(cors({ origin: true, credentials: true }));
    }

    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
    this.app.use(globalAuthMiddleware);
  }

  private initializeRoutes(routes: Routes[]): void {
    routes.forEach((route) => {
      this.app.use('/api/', route.router);
    });
  }

  private initializeSwagger(): void {
    const options = {
      swaggerDefinition: {
        info: {
          title: 'REST API',
          version: '1.0.0',
          description: 'Example docs',
        },
      },
      apis: ['swagger.yaml'],
    };

    const specs = swaggerJSDoc(options);
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  }

  private initializeErrorHandling(): void {
    this.app.use(errorMiddleware);
  }
}

export default App;
