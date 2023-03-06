export enum TokenType {
  // single-char tokens
  LEFT_PAREN, RIGHT_PAREN, LEFT_BRACKET, RIGHT_BRACKET,

  // literals
  VARIABLE, STRING, INT, DOUBLE, BOOLEAN, DATE,

  // special-char operators
  BANG_EQUAL,
  DOUBLE_EQUALS, TRIPLE_EQUALS,
  GREATER, GREATER_EQUAL,
  LESS, LESS_EQUAL,
  LIKE,

  // clauses & operators
  AND, OR, NOT,
  IN, NIN, RANGE,
}

export interface Token {
  type: TokenType;
  lexeme: string;
}
