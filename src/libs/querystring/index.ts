import { FieldDescription, FieldDescriptionContainer } from './models/fieldDescription';
import tokenize from './tokenizing/tokenizer';
import parse from './parsing/parser';
import prepareSubQueryString from './utils/subQueryString';

const toNode = (qs: string, container: FieldDescriptionContainer) => {
  const tokens = tokenize(qs);
  const node = parse(tokens);
  const validationResult = node.validate(container);
  if (!validationResult.valid) {
    throw validationResult.exception;
  }
  return node;
};

const toMySqlCriteria = (qs: string, fdList: FieldDescription[]) => {
  if (qs === '') return 'true';
  const container = new FieldDescriptionContainer(...fdList);
  return toNode(qs, container).toMySqlCriteria(container);
};

const toMongoCriteria = (qs: string, fdList: FieldDescription[]) => {
  if (qs === '') return '{}';
  const container = new FieldDescriptionContainer(...fdList);
  return toNode(qs, container).toMongoCriteria(container);
};

export { toMySqlCriteria, toMongoCriteria, prepareSubQueryString };
