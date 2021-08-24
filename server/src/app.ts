/* eslint-disable import/first */
process.env.NODE_CONFIG_DIR = `${__dirname}/configs`;

import 'reflect-metadata';
import { Server } from 'http';

import express, { Request } from 'express';

import { dbConnection } from '@databases';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import { connect, set } from 'mongoose';
import morgan from 'morgan';
import { useExpressServer } from 'routing-controllers';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { logger, stream } from '@/utils/logger';
import { authorizationChecker } from '@middlewares/auth.middleware';
import errorMiddleware, { ErrorMiddleware } from '@middlewares/error.middleware';

class App {
  public app: express.Application;
  public port: string | number;
  public env: string;
  public httpServer: Server | undefined;

  constructor(controllers: (new () => unknown)[]) {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.env = process.env.NODE_ENV || 'development';

    this.connectToDatabase();
    this.initializeMiddlewares();
    this.initializeRouterController(controllers);
    this.initializeSwagger();
    this.initializeErrorHandling();
  }

  public listen(): void {
    this.httpServer = this.app.listen(this.port, () => {
      logger.info(`=================================`);
      logger.info(`======= ENV: ${this.env} =======`);
      logger.info(`🚀 App listening on the port ${this.port}`);
      logger.info(`=================================`);
    });
  }

  public getServer(): express.Application {
    return this.app;
  }

  public close(): void {
    this.httpServer?.close();
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
  }

  private initializeRouterController(controllers: { new(): unknown }[]) :void{
    useExpressServer(this.app, {
      routePrefix: '/api',
      middlewares: [ErrorMiddleware],
      controllers,
      defaultErrorHandler: false,
      validation: { skipMissingProperties: true },
      authorizationChecker,
      async currentUserChecker({ request }: { request: Request }) {
        return request.user;
      },
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
