class Response {
  public code: number;

  public message: string;

  public status: boolean;

  public data: unknown;

  constructor(code: number, data: any, status: boolean, message: string = '') {
    this.code = code;
    this.status = status;
    this.message = message || 'Success';
    this.data = data;
  }
}

export default Response;
