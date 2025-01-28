import { ApiOperationOptions } from '@nestjs/swagger';

export const TEST_OPRATION_RESPONSE: { [key: string]: ApiOperationOptions } = {
  TEST: {
    summary: 'Test',
    description: 'API de verificación de servicio en funcionamiento',
  },
};
