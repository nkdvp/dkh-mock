/* eslint-disable implicit-arrow-linebreak */
import { invalidTokenException, noMatchingBracketException, unexpectedCharacterException } from '../utils/exceptions';
import { findFirst, matchingElemPosition } from '../utils/generics';
import { Token, TokenType } from '../models/tokens';
import * as LexemeToToken from './lexemeToToken';

const convertFuncPath = 'step1.Step1Converter.convert: ';
const convertArrayFuncPath = 'step1.Step1Converter.convertArray: ';

const markStrings = (queryString: string): boolean[] => {
  let quoteCounter = 0;
  let foundLeftQuotes = false;
  let leftQuotesAt = -1;
  const marks: boolean[] = Array(queryString.length).fill(false);

  queryString.split('').forEach((letter, i) => {
    quoteCounter = letter === "'" ? quoteCounter + 1 : 0;
    if (quoteCounter < 3) return;

    if (foundLeftQuotes) {
      for (let iter = leftQuotesAt; iter <= i; iter += 1) {
        marks[iter] = true;
      }
      foundLeftQuotes = false;
    } else {
      foundLeftQuotes = true;
      leftQuotesAt = i - 2;
    }
  });

  if (foundLeftQuotes) {
    throw noMatchingBracketException(
      convertFuncPath,
      0,
      queryString.length,
    )('string', leftQuotesAt);
  }

  return marks;
};

const getRightParenPosition = matchingElemPosition<string>('(', ')')((x, y) => x === y);
const getRightBracketPosition = findFirst<string>(']')((x, y) => x === y);
const getRightHashPosition = findFirst<string>('#')((x, y) => x === y);
const getRightBracePosition = findFirst<string>('}')((x, y) => x === y);

const instanceOfToken = (obj: any): obj is Token => 'type' in obj && 'lexeme' in obj;

const parsingLexemeToTokenWithOrders = (...parsingFuncs: LexemeToToken.LexemeToTokenConverter[]) =>
  (lexeme: string) => {
    if (lexeme.length === 0) {
      throw invalidTokenException(lexeme);
    }
    const parsingFunc = parsingFuncs.find((func) => {
      const parsingResult = func(lexeme);
      return instanceOfToken(parsingResult);
    });

    if (parsingFunc) {
      return parsingFunc(lexeme) as Token;
    }
    throw invalidTokenException(lexeme);
  };

const isAlphaNumeric = (c: string): boolean =>
  (c >= 'a' && c <= 'z')
  || (c >= 'A' && c <= 'Z')
  || c === '_'
  || (c >= '0' && c <= '9')
  || c === '+'
  || c === '-'
  || c === '.';

const nextSeperatorInArray = findFirst(',', ']')((x, y) => x === y);

const scanTokensInArray = (
  queryString: string,
  leftId: number,
  rightId: number,
  visited: boolean[],
): Token[] => {
  const tokens: Token[] = [];
  tokens.push({ type: TokenType.LEFT_BRACKET, lexeme: '[' });

  let pos = leftId;
  let numElems = 0;
  while (pos < rightId - 1) {
    const index = nextSeperatorInArray(queryString.split(''), pos + 1, rightId, visited);
    const lexeme = queryString.slice(pos + 1, index).trim();

    const isEmptyString = lexeme === '';
    if (isEmptyString) {
      if (numElems > 0) {
        throw unexpectedCharacterException(convertArrayFuncPath, leftId, rightId)('EMPTY_STRING', pos);
      }
    } else {
      // just let int before double, other orders is not important
      const lexemeToLiteralToken = parsingLexemeToTokenWithOrders(
        LexemeToToken.toString,
        LexemeToToken.toDate,
        LexemeToToken.toVariable,
        LexemeToToken.toBoolean,
        LexemeToToken.toInt,
        LexemeToToken.toDouble,
      );
      const token = lexemeToLiteralToken(lexeme);
      tokens.push(token);
    }

    pos = index;
    numElems += 1;
  }

  tokens.push({ type: TokenType.RIGHT_BRACKET, lexeme: ']' });
  return tokens;
};

const scanTokens = (
  queryString: string,
  leftId: number,
  rightId: number,
  visited: boolean[],
): Token[] => {
  const tokens: Token[] = [];

  for (let i = leftId; i < rightId; i += 1) {
    // STRING
    if (visited[i]) {
      let j = i;
      while (j < rightId && visited[j]) j += 1;
      tokens.push({ type: TokenType.STRING, lexeme: queryString.slice(i, j) });
      i = j - 1;
      // eslint-disable-next-line no-continue
      continue;
    }

    const c = queryString[i];
    switch (c) {
      case '(': { // SUB GROUP
        const rightParenAt = getRightParenPosition(queryString.split(''), i, rightId, visited);
        if (rightParenAt < 0) {
          throw noMatchingBracketException(convertFuncPath, leftId, rightId)('clause', i);
        }
        tokens.push({ type: TokenType.LEFT_PAREN, lexeme: '(' });
        tokens.push(...scanTokens(queryString, i + 1, rightParenAt, visited));
        tokens.push({ type: TokenType.RIGHT_PAREN, lexeme: ')' });

        i = rightParenAt;
        break;
      }

      case '[': { // ARRAY
        const rightBracketAt = getRightBracketPosition(queryString.split(''), i + 1, rightId, visited);
        if (rightBracketAt < 0) {
          throw noMatchingBracketException(convertFuncPath, leftId, rightId)('array', i);
        }
        tokens.push(...scanTokensInArray(queryString, i, rightBracketAt + 1, visited));

        i = rightBracketAt;
        break;
      }

      case '#': { // DATE
        const rightHashAt = getRightHashPosition(queryString.split(''), i + 1, rightId, visited);
        if (rightHashAt < 0) {
          throw noMatchingBracketException(convertFuncPath, leftId, rightId)('date', i);
        }
        tokens.push({ type: TokenType.DATE, lexeme: queryString.slice(i, rightHashAt + 1) });

        i = rightHashAt;
        break;
      }

      case '{': { // FIELD
        const rightBraceAt = getRightBracePosition(queryString.split(''), i + 1, rightId, visited);
        if (rightBraceAt < 0) {
          throw noMatchingBracketException(convertFuncPath, leftId, rightId)('field', i);
        }
        tokens.push({ type: TokenType.VARIABLE, lexeme: queryString.slice(i, rightBraceAt + 1) });

        i = rightBraceAt;
        break;
      }

      case '<':
      case '>': { // GT, GTE, LT, LTE filters
        if (i + 1 < rightId && queryString[i + 1] === '=') {
          const type = c === '<' ? TokenType.LESS_EQUAL : TokenType.GREATER_EQUAL;
          tokens.push({ type, lexeme: `${c}=` });

          i += 1;
        } else {
          const type = c === '<' ? TokenType.LESS : TokenType.GREATER;
          tokens.push({ type, lexeme: c });
        }
        break;
      }

      case '=': { // EQ, TEXT_SEARCH filters
        if (i + 2 < rightId && queryString.slice(i, i + 3) === '===') {
          tokens.push({ type: TokenType.TRIPLE_EQUALS, lexeme: '===' });

          i += 2;
        } else if (i + 1 < rightId && queryString.slice(i, i + 2) === '==') {
          tokens.push({ type: TokenType.DOUBLE_EQUALS, lexeme: '==' });

          i += 1;
        } else {
          throw unexpectedCharacterException(convertFuncPath, leftId, rightId)('=', i);
        }
        break;
      }

      case '!': { // NE filter
        if (i + 1 < rightId && queryString.slice(i, i + 2) === '!=') {
          tokens.push({ type: TokenType.BANG_EQUAL, lexeme: '!=' });

          i += 1;
        } else {
          throw unexpectedCharacterException(convertFuncPath, leftId, rightId)('=', i);
        }
        break;
      }

      case ' ':
      case '\r':
      case '\t': {
        break;
      }

      default: { // NUMBER (INT, DOUBLE), BOOLEAN, CLAUSE (AND, OR, NOT), FILTER (IN, NIN, RANGE)
        let j = i;
        while (j < rightId && isAlphaNumeric(queryString[j])) j += 1;
        if (i === j) {
          throw unexpectedCharacterException(convertFuncPath, leftId, rightId)(c, i);
        }
        const lexeme = queryString.slice(i, j).toLowerCase();

        // just let int before double, other orders is not important
        const token = parsingLexemeToTokenWithOrders(
          LexemeToToken.toInt,
          LexemeToToken.toDouble,
          LexemeToToken.toBoolean,
          LexemeToToken.toOperator,
          LexemeToToken.toClause,
        )(lexeme);
        tokens.push(token);

        i = j - 1;
      }
    }
  }

  return tokens;
};

const tokenize = (queryString: string) => {
  const visited = markStrings(queryString);
  return scanTokens(queryString, 0, queryString.length, visited);
};

export default tokenize;
