/* eslint-disable implicit-arrow-linebreak */
import CustomException from '../exceptions';
import DataType from '../models/literalDataTypes';
import { Token } from '../models/tokens';

const toCustomException = (
  funcPath: string,
  leftId: number,
  rightId: number,
  errorMessage: string,
) => new CustomException(`${funcPath}${leftId}, ${rightId}\n${errorMessage}`);

const unexpectedCharacterException = (funcPath: string, leftId: number, rightId: number) =>
  (ch: string, position: number) =>
    toCustomException(
      funcPath,
      leftId,
      rightId,
      `character ${ch} at position ${position} has no meaning`,
    );

const noMatchingBracketException = (funcPath: string, leftId: number, rightId: number) =>
  (expectedDataType: string, leftBracketAt: number) =>
    toCustomException(
      funcPath,
      leftId,
      rightId,
      `open bracket of ${expectedDataType} found in position ${leftBracketAt} but no close bracket`,
    );

const notCorrectPiecesException = (funcPath: string, leftId: number, rightId: number) =>
  (precedence: number) =>
    toCustomException(
      funcPath,
      leftId,
      rightId,
      `left part & right part are not correct pieces with maxPrecedence = ${precedence}`,
    );

// NOTE: new exceptions, wasn't introduced in java version
const invalidTokenException = (lexeme: string) =>
  new CustomException(`string "${lexeme}" can't be parsed to token`);

const invalidCompareFilterException = (token: Token) =>
  new CustomException(`token ${token} can't be parsed to compare filter`);

const invalidArrayFilterException = (token: Token) =>
  new CustomException(`token ${token} can't be parsed to array filter`);

const outOfRangeException = (funcPath: string, leftId: number, rightId: number) =>
  toCustomException(
    funcPath,
    leftId,
    rightId,
    'leftId is gte rightId',
  );

const dataTypeNotSupportedException = (type: DataType) =>
  new CustomException(`DataType ${type} is not supported`);

const fieldNotExistedException = (field: string) =>
  new CustomException(`field ${field} is not in FieldDescriptionContainer`);

const tooManyOccurrenceException = (field: string) =>
  new CustomException(`field ${field} passed maxOccurrence limit`);

const noOccurrenceWhileRequiredException = (field: string) =>
  new CustomException(`field ${field} has 0 occurrence while required`);

export {
  unexpectedCharacterException,
  noMatchingBracketException,
  notCorrectPiecesException,
  invalidTokenException,
  invalidCompareFilterException,
  invalidArrayFilterException,
  outOfRangeException,
  fieldNotExistedException,
  tooManyOccurrenceException,
  noOccurrenceWhileRequiredException,
  dataTypeNotSupportedException,
};
