import { FmFilter } from './specialFilters';
import {
  EqFilter, NeFilter, LtFilter, LteFilter, GtFilter, GteFilter, LikeFilter,
} from './compareFilters';
import {
  InFilter, NinFilter, RangeFilter,
} from './arrayFilters';
import { Token, TokenType } from '../models/tokens';
import { invalidArrayFilterException, invalidCompareFilterException } from '../utils/exceptions';

const compareFilterFactory = (op: Token) => (variable: Token, value: Token) => {
  switch (op.type) {
    case TokenType.DOUBLE_EQUALS:
      return new EqFilter(variable, value);
    case TokenType.BANG_EQUAL:
      return new NeFilter(variable, value);
    case TokenType.LESS:
      return new LtFilter(variable, value);

    case TokenType.LESS_EQUAL:
      return new LteFilter(variable, value);
    case TokenType.GREATER:
      return new GtFilter(variable, value);
    case TokenType.GREATER_EQUAL:
      return new GteFilter(variable, value);
    case TokenType.LIKE:
      return new LikeFilter(variable, value);
    default:
      throw invalidCompareFilterException(op);
  }
};

const arrayFilterFactory = (op: Token) => (variable: Token, values: Token[]) => {
  switch (op.type) {
    case TokenType.IN:
      return new InFilter(variable, values);
    case TokenType.NIN:
      return new NinFilter(variable, values);
    case TokenType.RANGE:
      return new RangeFilter(variable, values);
    default:
      throw invalidArrayFilterException(op);
  }
};

export {
  FmFilter,
  compareFilterFactory,
  arrayFilterFactory,
};
