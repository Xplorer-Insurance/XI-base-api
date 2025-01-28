import { ApiProperty } from '@nestjs/swagger';
import { IResponseProps, Response } from './responseDto.class';
import { RESPONSE_API_PROPERTY as API_PROP } from '../constants';

export class ResponseOk<T> extends Response {
  @ApiProperty(API_PROP.MESSAGE)
  message = 'Operación exitosa';
  @ApiProperty(API_PROP.STATUSCODE)
  statusCode = 200;
  @ApiProperty(API_PROP.SUCCESS)
  success = true;
  data: T;
  constructor(value: T, props?: IResponseProps) {
    super();
    this.data = value;
    if (props) {
      for (const key in props) {
        this[key] = props[key];
      }
    }
  }
}
