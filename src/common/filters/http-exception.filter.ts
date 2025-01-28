import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  CannotCreateEntityIdMapError,
  EntityNotFoundError,
  QueryFailedError,
} from 'typeorm';


@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    let queryError = null;
    let status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const stack = (exception as any).stack || '';

    switch (exception.constructor) {
      case QueryFailedError: // this is a TypeOrm error
        status = HttpStatus.UNPROCESSABLE_ENTITY;
        queryError = `Query ==> ${(exception as QueryFailedError)?.query}`;
        break;
      case EntityNotFoundError: // this is another TypeOrm error
        status = HttpStatus.UNPROCESSABLE_ENTITY;
        queryError = `EntityNotFoundError ==> ${JSON.stringify(exception)}`;
        break;
      case CannotCreateEntityIdMapError: // and another
        status = HttpStatus.UNPROCESSABLE_ENTITY;
        queryError = `CannotCreateEntityIdMapError ==> ${JSON.stringify(
          exception,
        )}`;
        break;
    }

    const message = (exception as any).message || 'Error inesperado';
    const { body: payload } = request;
    const err = new Error(message);
    err.stack = `==> Payload: ${JSON.stringify(
      payload,
    )} \n ==> Stack: ${stack} \n ${queryError || ''}`;

    response.status(status).json({
      statusCode: status,
      error: message,
      success: false,
    });

    Logger.error(message, {
      err,
      req: request,
      res: response,
    });
  }
}
