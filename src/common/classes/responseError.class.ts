import { IResponseProps, Response } from './responseDto.class';
import { RESPONSE_API_PROPERTY as API_PROP } from '../constants';
import { ApiProperty } from '@nestjs/swagger';

export class ResponseError<T> extends Response {
  @ApiProperty(API_PROP.MESSAGE_ERROR)
  message = 'Operación fallida';
  @ApiProperty(API_PROP.STATUSCODE_ERROR)
  statusCode = 500;
  @ApiProperty(API_PROP.SUCCESS_ERROR)
  success = false;
  error: T;
  constructor(value: T, props?: IResponseProps) {
    super();
    this.error = value;
    if (props) {
      for (const key in props) {
        this[key] = props[key];
      }
    }
  }
}
