import { HttpException, HttpStatus } from "@nestjs/common";

export class UserError extends HttpException {
    constructor(message: string, code: string) {
      super(message, HttpStatus.BAD_REQUEST);
      Object.defineProperty(this, 'name', { value: 'UserErrors' });
    }
  }