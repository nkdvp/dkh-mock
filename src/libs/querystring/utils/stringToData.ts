import DataType from '../models/literalDataTypes';
import { Token } from '../models/tokens';

const toDate = (token: Token) => {
  const d = new Date(token.lexeme.slice(1, token.lexeme.length - 1));
  return `"${d.toISOString().replace('T', ' ').replace('Z', '')}"`;
};

const toString = (token: Token) => `"${token.lexeme.slice(3, token.lexeme.length - 3)}"`;

const toBoolean = (token: Token) => token.lexeme === 'true';

const toInt = (token: Token) => parseInt(token.lexeme, 10);

const toDouble = (token: Token) => +token.lexeme;

const stringToData = (dataType: DataType) => {
  switch (dataType) {
    case DataType.BOOLEAN:
      return toBoolean;
    case DataType.DATE:
      return toDate;
    case DataType.DOUBLE:
      return toDouble;
    case DataType.INTEGER:
      return toInt;
    case DataType.STRING:
      return toString;
    default:
      throw new Error('not existed case');
  }
};

export default stringToData;
