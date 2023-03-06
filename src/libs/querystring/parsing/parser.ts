/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-continue */
/* eslint-disable operator-linebreak */
/* eslint-disable implicit-arrow-linebreak */
import { AndClause, NotClause, OrClause } from './clauses';
import { TreeNode } from '../models/nodes';
import { Token, TokenType } from '../models/tokens';
import { findFirst, matchingElemPosition } from '../utils/generics';
import { notCorrectPiecesException, outOfRangeException } from '../utils/exceptions';
import { arrayFilterFactory, compareFilterFactory, FmFilter } from './filters';
import { FalseCondition, TrueCondition } from './specialFilters';

// token-types order:
// OR: 8
// AND: 7
// ===: 6
// IN, NIN, RANGE: 5
// == != < <= > >=: 4
// NOT: 2
const FULLMATCH_FILTER_LEVEL = 6;
const ARRAY_FILTER_LEVEL = 5;
const COMPARE_FILTER_LEVEL = 4;
const NOT_CLAUSE_LEVEL = 2;
const BOOLEAN_FILTER_LEVEL = 1;
const precedenceRules: [TokenType, number][] = [
  [TokenType.OR, 8],
  [TokenType.AND, 7],
  [TokenType.TRIPLE_EQUALS, 6],
  [TokenType.IN, 5],
  [TokenType.NIN, 5],
  [TokenType.RANGE, 5],
  [TokenType.DOUBLE_EQUALS, 4],
  [TokenType.BANG_EQUAL, 4],
  [TokenType.LESS, 4],
  [TokenType.LESS_EQUAL, 4],
  [TokenType.GREATER, 4],
  [TokenType.GREATER_EQUAL, 4],
  [TokenType.LIKE, 4],
  [TokenType.NOT, 2],

  [TokenType.BOOLEAN, 1],
];

const parseFuncPath = 'step2.Step2Converter.convert: ';

const getRightParentAt = matchingElemPosition<Token>(
  { type: TokenType.LEFT_PAREN, lexeme: '(' },
  { type: TokenType.RIGHT_PAREN, lexeme: ')' },
)((x, y) => x.type === y.type && x.lexeme === y.lexeme);
const getRightBracketAt = findFirst<Token>({ type: TokenType.RIGHT_BRACKET, lexeme: ']' })(
  (x, y) => x.type === y.type && x.lexeme === y.lexeme,
);

const and = (tokens: Token[], leftId: number, rightId: number) => {
  let lastIndex = leftId - 1;
  const nodes: TreeNode[] = [];
  for (let i = leftId; i < rightId; i += 1) {
    if (tokens[i].type === TokenType.LEFT_PAREN) {
      i = getRightParentAt(tokens, i, rightId, []);
    }
    if (tokens[i].type !== TokenType.AND) continue;
    nodes.push(buildAST(tokens, lastIndex + 1, i));
    lastIndex = i;
  }
  nodes.push(buildAST(tokens, lastIndex + 1, rightId));
  return new AndClause(nodes);
};

const or = (tokens: Token[], leftId: number, rightId: number) => {
  let lastIndex = leftId - 1;
  const nodes: TreeNode[] = [];
  for (let i = leftId; i < rightId; i += 1) {
    if (tokens[i].type === TokenType.LEFT_PAREN) {
      i = getRightParentAt(tokens, i, rightId, []);
    }
    if (tokens[i].type !== TokenType.OR) continue;
    nodes.push(buildAST(tokens, lastIndex + 1, i));
    lastIndex = i;
  }
  nodes.push(buildAST(tokens, lastIndex + 1, rightId));
  return new OrClause(nodes);
};

const not = (tokens: Token[], leftId: number, rightId: number) => {
  const notSubGroup =
    tokens[leftId + 1].type !== TokenType.LEFT_PAREN &&
    getRightParentAt(tokens, leftId + 1, rightId, []) !== rightId - 1;
  if (tokens[leftId].type !== TokenType.NOT || notSubGroup) {
    throw notCorrectPiecesException(parseFuncPath, leftId, rightId)(NOT_CLAUSE_LEVEL);
  }

  return new NotClause(buildAST(tokens, leftId + 2, rightId - 1));
};

const fullmatchOpr = (tokens: Token[], leftId: number, rightId: number) => {
  const op = tokens[rightId - 2];
  const str = tokens[rightId - 1];
  const notArray =
    tokens[leftId].type !== TokenType.LEFT_BRACKET ||
    getRightBracketAt(tokens, leftId, rightId, []) !== rightId - 3;
  if (op.type !== TokenType.TRIPLE_EQUALS || str.type !== TokenType.STRING || notArray) {
    throw notCorrectPiecesException(parseFuncPath, leftId, rightId)(FULLMATCH_FILTER_LEVEL);
  }

  return new FmFilter(tokens.slice(leftId + 1, rightId - 3), str);
};

const compareFilter = (tokens: Token[], leftId: number, rightId: number): TreeNode => {
  if (rightId - leftId !== 3 || tokens[leftId].type !== TokenType.VARIABLE) {
    throw notCorrectPiecesException(parseFuncPath, leftId, rightId)(COMPARE_FILTER_LEVEL);
  }
  return compareFilterFactory(tokens[leftId + 1])(tokens[leftId], tokens[rightId - 1]);
};

const arrayFilter = (tokens: Token[], leftId: number, rightId: number): TreeNode => {
  const notArray =
    tokens[leftId + 2].type !== TokenType.LEFT_BRACKET ||
    getRightBracketAt(tokens, leftId, rightId, []) !== rightId - 1;
  if (tokens[leftId].type !== TokenType.VARIABLE || notArray) {
    throw notCorrectPiecesException(parseFuncPath, leftId, rightId)(ARRAY_FILTER_LEVEL);
  }
  const values = tokens.slice(leftId + 3, rightId - 1);
  return arrayFilterFactory(tokens[leftId + 1])(tokens[leftId], values);
};

const booleanFilter = (tokens: Token[], leftId: number, rightId: number): TreeNode => {
  if (rightId - leftId !== 1) {
    throw notCorrectPiecesException(parseFuncPath, leftId, rightId)(BOOLEAN_FILTER_LEVEL);
  }
  const value = tokens[leftId].lexeme;
  return value.toLowerCase() === 'true' ? new TrueCondition() : new FalseCondition();
};

const precedenceOf = (type: TokenType) => {
  const rule = precedenceRules.find((e) => e[0] === type);
  if (!rule) {
    return -1;
  }
  return rule[1];
};

const buildAST = (tokens: Token[], leftId: number, rightId: number): TreeNode => {
  if (leftId >= rightId) {
    throw outOfRangeException(parseFuncPath, leftId, rightId);
  }

  const coveredByBracket =
    tokens[leftId].type === TokenType.LEFT_PAREN &&
    getRightParentAt(tokens, leftId, rightId, []) === rightId - 1;

  if (coveredByBracket) {
    return buildAST(tokens, leftId + 1, rightId - 1);
  }

  let maxPrecedence = 0;
  for (let i = leftId; i < rightId; i += 1) {
    if (tokens[i].type === TokenType.LEFT_PAREN) {
      i = getRightParentAt(tokens, i, rightId, []);
    } else {
      maxPrecedence = Math.max(maxPrecedence, precedenceOf(tokens[i].type));
    }
  }

  switch (maxPrecedence) {
    case 8:
      return or(tokens, leftId, rightId);
    case 7:
      return and(tokens, leftId, rightId);
    case 6:
      return fullmatchOpr(tokens, leftId, rightId);
    case 5:
      return arrayFilter(tokens, leftId, rightId);
    case 4:
      return compareFilter(tokens, leftId, rightId);
    case 2:
      return not(tokens, leftId, rightId);
    case 1:
      return booleanFilter(tokens, leftId, rightId);
    default:
      throw new Error('not existed');
  }
};

const parse = (tokens: Token[]): TreeNode => buildAST(tokens, 0, tokens.length);
export default parse;
