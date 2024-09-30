import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { FastifyServerOptions, FastifyInstance, fastify } from 'fastify';
import awsLambdaFastify from '@fastify/aws-lambda';
import fastifyHelmet from '@fastify/helmet'
import { AppModule } from './app.module';
import {
    Context,
    APIGatewayProxyEvent,
    APIGatewayProxyResult
} from 'aws-lambda';
import { LogLevel, Logger } from '@nestjs/common';


interface NestApp {
    app: NestFastifyApplication;
    instance: FastifyInstance;
}

let cachedNestApp: NestApp;
let cachedProxy;

async function bootstrapServer(): Promise<NestApp> {

    let logLevel: LogLevel[] = ['warn', 'error'];
    if (((process.env.LOGGER || '0') === '1') || ((process.env.NODE_ENV || 'development') === 'development')) {
        logLevel = ['log', 'error', 'warn', 'debug', 'verbose'];
    }
    Logger.log(logLevel);
    Logger.log(`process.env.NODE_ENV #${process.env.NODE_ENV}#`);


    const serverOptions: FastifyServerOptions = {
        logger: (process.env.LOGGER || '0') == '1',
        bodyLimit: 10 * 1024 * 1024 // 10MB ApiGateway Limit
    };
    const instance: FastifyInstance = fastify(serverOptions);
    const app = await NestFactory.create<NestFastifyApplication>(
        AppModule,
        new FastifyAdapter(instance),
        {
            logger: logLevel
        },
    );

    const CORS_OPTIONS = {
        origin: '*',
        allowedHeaders: '*',
        exposedHeaders: '*',
        credentials: false,
        methods: ['GET', 'PUT', 'OPTIONS', 'POST', 'DELETE'],
    };

    app.register(require('@fastify/cors'), CORS_OPTIONS);

    await app.register(fastifyHelmet, {
        strictTransportSecurity: {
            maxAge: 31536000,
            includeSubDomains: true,
        }
    });


    app.setGlobalPrefix(process.env.API_PREFIX);

    await app.init();

    return {
        app,
        instance
    };
}

export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {

    // if (process.env.LOGGER === '1') {
    //     console.log("function.handler");
    //     console.log(event);
    //     console.log(context);
    //     console.log(process.env);
    //     console.log(event.requestContext);
    // }

    if (!cachedProxy) {

        if (!cachedNestApp) {
            cachedNestApp = await bootstrapServer();
        }
        cachedProxy = awsLambdaFastify(cachedNestApp.instance, { decorateRequest: true });
    }

    return cachedProxy(event, context);


};