/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
import CustomException from '../exceptions';
import { FieldDescriptionContainer } from '../models/fieldDescription';
import DataType from '../models/literalDataTypes';
import { Filter } from '../models/nodes';
import { Token } from '../models/tokens';
import ValidationResult from '../models/validations';
import { dataTypeNotSupportedException } from '../utils/exceptions';
import stringToData from '../utils/stringToData';

class FmFilter extends Filter {
  supportedTypes: DataType[] = [DataType.STRING];

  variables: Token[];

  word: Token;

  constructor(variables: Token[], word: Token) {
    super();
    this.variables = variables;
    this.word = word;
  }

  validate(fdCon: FieldDescriptionContainer): ValidationResult {
    try {
      // eslint-disable-next-line no-restricted-syntax
      for (const v of this.variables) {
        const type = fdCon.getFieldDescription(v).dataType;
        if (!this.supportedTypes.includes(type)) {
          throw dataTypeNotSupportedException(type);
        }
        fdCon.incOccurrence(v);
      }

      // FmFilter only works with STRING
      stringToData(DataType.STRING)(this.word);
      return new ValidationResult(true, undefined);
    } catch (err) {
      const exception = new CustomException(`FmFilter: ${err.message}`);
      return new ValidationResult(false, exception);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  toMongoCriteria(fdCon: FieldDescriptionContainer): string {
    throw new Error('Method not implemented.');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  toMySqlCriteria(fdCon: FieldDescriptionContainer): string {
    throw new Error('Method not implemented.');
  }
}

class TrueCondition extends Filter {
  validate(fdCon: FieldDescriptionContainer): ValidationResult {
    return new ValidationResult(true, undefined);
  }

  toMongoCriteria(fdCon: FieldDescriptionContainer): string {
    return '{"_id": {"$exists": true}}';
  }

  toMySqlCriteria(fdCon: FieldDescriptionContainer): string {
    return 'TRUE';
  }
}

class FalseCondition extends Filter {
  validate(fdCon: FieldDescriptionContainer): ValidationResult {
    return new ValidationResult(true, undefined);
  }

  toMongoCriteria(fdCon: FieldDescriptionContainer): string {
    return '{"_id": {"$exists": false}}';
  }

  toMySqlCriteria(fdCon: FieldDescriptionContainer): string {
    return 'FALSE';
  }
}

export {
  FmFilter,
  TrueCondition,
  FalseCondition,
};
