export class Response {
  message: string;

  statusCode: number;

  success: boolean;
}

export type IResponseProps = Partial<Response>;
