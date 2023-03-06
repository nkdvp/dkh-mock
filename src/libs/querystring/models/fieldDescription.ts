/* eslint-disable max-classes-per-file */
import { fieldNotExistedException } from '../utils/exceptions';
import DataType from './literalDataTypes';
import { Token } from './tokens';

const InfiniteOccurrences = Number.MAX_SAFE_INTEGER;

export interface FieldDescription {
  readonly field: string;
  readonly required?: boolean;
  readonly dataType: DataType;
  readonly maxOccurrence?: number;
  readonly mapTo?: string;
}

export class FieldDescriptionContainer {
  readonly rules: Map<string, FieldDescription> = new Map();

  readonly fieldCounter: Map<string, number> = new Map();

  constructor(...fieldDescriptions: FieldDescription[]) {
    fieldDescriptions.forEach((partialFd) => {
      const fullFd: FieldDescription = {
        field: partialFd.field,
        required: partialFd.required || false,
        dataType: partialFd.dataType,
        maxOccurrence: partialFd.maxOccurrence || InfiniteOccurrences,
        mapTo: partialFd.mapTo || partialFd.field,
      };
      this.rules.set(fullFd.field, fullFd);
      this.fieldCounter.set(fullFd.field, 0);
    });
  }

  getFieldDescription(variable: Token): FieldDescription {
    const fieldName = variable.lexeme.slice(1, variable.lexeme.length - 1);
    if (!this.rules.has(fieldName)) {
      throw fieldNotExistedException(fieldName);
    }
    return this.rules.get(fieldName);
  }

  incOccurrence(...variables: Token[]) {
    variables.forEach((v) => {
      const fieldName = v.lexeme.slice(1, v.lexeme.length - 1);
      if (!this.fieldCounter.has(fieldName)) {
        throw fieldNotExistedException(fieldName);
      }
      const value = this.fieldCounter.get(fieldName);
      this.fieldCounter.set(fieldName, value + 1);
    });
  }
}
