export abstract class CustomerError extends Error {}

export class UserNotFoundError extends CustomerError {
  constructor(message: string) {
    super(message);
    this.name = 'UserNotFoundError';
  }
}

export class PasswordMismatchError extends CustomerError {
  constructor(message: string) {
    super(message);
    this.name = 'PasswordMismatchError';
  }
}
