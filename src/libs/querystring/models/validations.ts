export default class ValidationResult {
  valid: boolean;

  exception: Error;

  constructor(valid: boolean, exception: Error | undefined) {
    this.valid = valid;
    this.exception = exception;
  }
}
