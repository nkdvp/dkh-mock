/* eslint-disable no-confusing-arrow */
/* eslint-disable implicit-arrow-linebreak */
import CustomException from '../exceptions';
import { invalidTokenException } from '../utils/exceptions';
import { Token, TokenType } from '../models/tokens';

export type LexemeToTokenConverter = (lexeme: string) => Token | CustomException;
type MappingRule = { lexeme: string; type: TokenType };

const bracketRules: MappingRule[] = [
  { lexeme: '(', type: TokenType.LEFT_PAREN },
  { lexeme: ')', type: TokenType.RIGHT_PAREN },
  { lexeme: '[', type: TokenType.LEFT_BRACKET },
  { lexeme: ']', type: TokenType.RIGHT_BRACKET },
];

const clauseRules: MappingRule[] = [
  { lexeme: 'and', type: TokenType.AND },
  { lexeme: 'or', type: TokenType.OR },
  { lexeme: 'not', type: TokenType.NOT },
];

const operatorRules: MappingRule[] = [
  { lexeme: '!=', type: TokenType.BANG_EQUAL },
  { lexeme: '==', type: TokenType.DOUBLE_EQUALS },
  { lexeme: '===', type: TokenType.TRIPLE_EQUALS },
  { lexeme: '<', type: TokenType.LESS },
  { lexeme: '<=', type: TokenType.LESS_EQUAL },
  { lexeme: '>', type: TokenType.GREATER },
  { lexeme: '>=', type: TokenType.GREATER_EQUAL },
  { lexeme: 'like', type: TokenType.LIKE },

  { lexeme: 'in', type: TokenType.IN },
  { lexeme: 'nin', type: TokenType.NIN },
  { lexeme: 'range', type: TokenType.RANGE },
];

const booleanRules: MappingRule[] = [
  { lexeme: 'true', type: TokenType.BOOLEAN },
  { lexeme: 'false', type: TokenType.BOOLEAN },
];

// > UTILS FUNCS

const toTokenUsingRules = (rules: MappingRule[]): LexemeToTokenConverter =>
  (lexeme: string) => {
    const matchingRule = rules.find((rule) => rule.lexeme === lexeme);
    return matchingRule ? { type: matchingRule.type, lexeme } : invalidTokenException(lexeme);
  };

const parsableToDouble = (lexeme: string): boolean => !Number.isNaN(Number(lexeme));
const parsableToInt = (lexeme: string): boolean => {
  if (!parsableToDouble(lexeme)) return false;
  return Number.isInteger(Number(lexeme));
};

// < UTILS FUNCS

const toBracket = toTokenUsingRules(bracketRules);

const toClause = toTokenUsingRules(clauseRules);

const toOperator = toTokenUsingRules(operatorRules);

const toBoolean = toTokenUsingRules(booleanRules);

const toVariable: LexemeToTokenConverter = (lexeme: string) => {
  if (lexeme.length < 2 || lexeme[0] !== '{' || lexeme[lexeme.length - 1] !== '}') {
    return invalidTokenException(lexeme);
  }
  return { type: TokenType.VARIABLE, lexeme };
};

const toDate: LexemeToTokenConverter = (lexeme: string) => {
  if (lexeme.length < 2 || lexeme[0] !== '#' || lexeme[lexeme.length - 1] !== '#') {
    return invalidTokenException(lexeme);
  }
  return { type: TokenType.DATE, lexeme };
};

const toString: LexemeToTokenConverter = (lexeme: string) => {
  if (!lexeme.startsWith("'''") || !lexeme.endsWith("'''")) {
    return invalidTokenException(lexeme);
  }
  return { type: TokenType.STRING, lexeme };
};

const toInt: LexemeToTokenConverter = (lexeme: string) =>
  !lexeme.includes('.') && parsableToInt(lexeme) ? { type: TokenType.INT, lexeme } : invalidTokenException(lexeme);

const toDouble: LexemeToTokenConverter = (lexeme: string) =>
  parsableToDouble(lexeme) ? { type: TokenType.DOUBLE, lexeme } : invalidTokenException(lexeme);

export {
  toBracket,
  toClause,
  toOperator,
  toBoolean,
  toVariable,
  toDate,
  toString,
  toInt,
  toDouble,
};
