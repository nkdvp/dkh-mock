export default class CustomException extends Error {
  public constructor(errorMessage: string) {
    super(errorMessage);
  }
}
