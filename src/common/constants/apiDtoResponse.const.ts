import { ApiPropertyOptions } from '@nestjs/swagger';

export const RESPONSE_API_PROPERTY: { [key: string]: ApiPropertyOptions } = {
  CODE: {
    description: 'Código interno de la operación',
    example: '2001',
  },
  MESSAGE: {
    description: 'Mensaje de la operación',
    example: 'Verificación exitosa',
    type: String,
  },
  STATUSCODE: {
    description: 'Status de petición HTTP',
    example: '200',
    type: Number,
  },
  SUCCESS: {
    description: 'Indica si la operación fue exitosa',
    example: true,
    type: Boolean,
  },
  SUCCESS_ERROR: {
    description: 'Indica si la operacion fue exitosa o no.',
    required: true,
    type: Boolean,
  },
  CODE_ERROR: {
    description: 'Código interno de la operación.',
    required: true,
    example: 2100,
    type: Number,
  },
  STATUSCODE_ERROR: {
    description: 'Status de petición HTTP.',
    required: true,
    example: 500,
    type: Number,
  },
  MESSAGE_ERROR: {
    description: 'Mensaje de la operación.',
    required: true,
    example: 'Error interno del sistema',
    type: String,
  },
};
