/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable max-classes-per-file */
import CustomException from '../exceptions';
import { FieldDescriptionContainer } from '../models/fieldDescription';
import DataType from '../models/literalDataTypes';
import { Filter } from '../models/nodes';
import { Token } from '../models/tokens';
import ValidationResult from '../models/validations';
import { dataTypeNotSupportedException } from '../utils/exceptions';
import { formattedFieldName } from '../utils/mongo';
import stringToData from '../utils/stringToData';

const compareFilterValidation = (filterName: string) =>
  (fdCon: FieldDescriptionContainer, supportedTypes: DataType[], variable: Token, value: Token) => {
    try {
      const type = fdCon.getFieldDescription(variable).dataType;
      if (!supportedTypes.includes(type)) {
        throw dataTypeNotSupportedException(type);
      }
      fdCon.incOccurrence(variable);

      stringToData(type)(value);

      return new ValidationResult(true, undefined);
    } catch (err) {
      const exception = new CustomException(`${filterName}: ${err.message}`);
      return new ValidationResult(false, exception);
    }
  };

class EqFilter extends Filter {
  supportedTypes: DataType[] = [
    DataType.STRING, DataType.DATE, DataType.INTEGER, DataType.DOUBLE, DataType.BOOLEAN,
  ];

  variable: Token;

  value: Token;

  constructor(variable: Token, value: Token) {
    super();
    this.variable = variable;
    this.value = value;
  }

  validate(fdCon: FieldDescriptionContainer): ValidationResult {
    return compareFilterValidation('EqFilter')(fdCon, this.supportedTypes, this.variable, this.value);
  }

  toMongoCriteria(fdCon: FieldDescriptionContainer): string {
    const fd = fdCon.getFieldDescription(this.variable);
    const field = formattedFieldName(fd.mapTo);
    const value = stringToData(fd.dataType)(this.value);
    return `{${field}: ${value}}`;
  }

  toMySqlCriteria(fdCon: FieldDescriptionContainer): string {
    const fd = fdCon.getFieldDescription(this.variable);
    const field = fd.mapTo;
    const value = stringToData(fd.dataType)(this.value);
    return `${field} = ${value}`;
  }
}

class NeFilter extends Filter {
  supportedTypes: DataType[] = [
    DataType.STRING, DataType.DATE, DataType.INTEGER, DataType.DOUBLE, DataType.BOOLEAN,
  ];

  variable: Token;

  value: Token;

  constructor(variable: Token, value: Token) {
    super();
    this.variable = variable;
    this.value = value;
  }

  validate(fdCon: FieldDescriptionContainer): ValidationResult {
    return compareFilterValidation('NeFilter')(fdCon, this.supportedTypes, this.variable, this.value);
  }

  toMongoCriteria(fdCon: FieldDescriptionContainer): string {
    const fd = fdCon.getFieldDescription(this.variable);
    const field = formattedFieldName(fd.mapTo);
    const value = stringToData(fd.dataType)(this.value);
    return `{${field}: {"$ne": ${value}}}`;
  }

  toMySqlCriteria(fdCon: FieldDescriptionContainer): string {
    const fd = fdCon.getFieldDescription(this.variable);
    const field = fd.mapTo;
    const value = stringToData(fd.dataType)(this.value);
    return `${field} <> ${value}`;
  }
}

class LtFilter extends Filter {
  supportedTypes: DataType[] = [DataType.DATE, DataType.INTEGER, DataType.DOUBLE];

  variable: Token;

  value: Token;

  constructor(variable: Token, value: Token) {
    super();
    this.variable = variable;
    this.value = value;
  }

  validate(fdCon: FieldDescriptionContainer): ValidationResult {
    return compareFilterValidation('LtFilter')(fdCon, this.supportedTypes, this.variable, this.value);
  }

  toMongoCriteria(fdCon: FieldDescriptionContainer): string {
    const fd = fdCon.getFieldDescription(this.variable);
    const field = formattedFieldName(fd.mapTo);
    const value = stringToData(fd.dataType)(this.value);
    return `{${field}: {"$lt": ${value}}}`;
  }

  toMySqlCriteria(fdCon: FieldDescriptionContainer): string {
    const fd = fdCon.getFieldDescription(this.variable);
    const field = fd.mapTo;
    const value = stringToData(fd.dataType)(this.value);
    return `${field} < ${value}`;
  }
}

class LteFilter extends Filter {
  supportedTypes: DataType[] = [DataType.DATE, DataType.INTEGER, DataType.DOUBLE];

  variable: Token;

  value: Token;

  constructor(variable: Token, value: Token) {
    super();
    this.variable = variable;
    this.value = value;
  }

  validate(fdCon: FieldDescriptionContainer): ValidationResult {
    return compareFilterValidation('LteFilter')(fdCon, this.supportedTypes, this.variable, this.value);
  }

  toMongoCriteria(fdCon: FieldDescriptionContainer): string {
    const fd = fdCon.getFieldDescription(this.variable);
    const field = formattedFieldName(fd.mapTo);
    const value = stringToData(fd.dataType)(this.value);
    return `{${field}: {"$lte": ${value}}}`;
  }

  toMySqlCriteria(fdCon: FieldDescriptionContainer): string {
    const fd = fdCon.getFieldDescription(this.variable);
    const field = fd.mapTo;
    const value = stringToData(fd.dataType)(this.value);
    return `${field} <= ${value}`;
  }
}

class GtFilter extends Filter {
  supportedTypes: DataType[] = [DataType.DATE, DataType.INTEGER, DataType.DOUBLE];

  variable: Token;

  value: Token;

  constructor(variable: Token, value: Token) {
    super();
    this.variable = variable;
    this.value = value;
  }

  validate(fdCon: FieldDescriptionContainer): ValidationResult {
    return compareFilterValidation('GtFilter')(fdCon, this.supportedTypes, this.variable, this.value);
  }

  toMongoCriteria(fdCon: FieldDescriptionContainer): string {
    const fd = fdCon.getFieldDescription(this.variable);
    const field = formattedFieldName(fd.mapTo);
    const value = stringToData(fd.dataType)(this.value);
    return `{${field}: {"$gt": ${value}}}`;
  }

  toMySqlCriteria(fdCon: FieldDescriptionContainer): string {
    const fd = fdCon.getFieldDescription(this.variable);
    const field = fd.mapTo;
    const value = stringToData(fd.dataType)(this.value);
    return `${field} > ${value}`;
  }
}

class GteFilter extends Filter {
  supportedTypes: DataType[] = [DataType.DATE, DataType.INTEGER, DataType.DOUBLE];

  variable: Token;

  value: Token;

  constructor(variable: Token, value: Token) {
    super();
    this.variable = variable;
    this.value = value;
  }

  validate(fdCon: FieldDescriptionContainer): ValidationResult {
    return compareFilterValidation('GteFilter')(fdCon, this.supportedTypes, this.variable, this.value);
  }

  toMongoCriteria(fdCon: FieldDescriptionContainer): string {
    const fd = fdCon.getFieldDescription(this.variable);
    const field = formattedFieldName(fd.mapTo);
    const value = stringToData(fd.dataType)(this.value);
    return `{${field}: {"$gte": ${value}}}`;
  }

  toMySqlCriteria(fdCon: FieldDescriptionContainer): string {
    const fd = fdCon.getFieldDescription(this.variable);
    const field = fd.mapTo;
    const value = stringToData(fd.dataType)(this.value);
    return `${field} >= ${value}`;
  }
}

class LikeFilter extends Filter {
  supportedTypes: DataType[] = [DataType.STRING];

  variable: Token;

  value: Token;

  constructor(variable: Token, value: Token) {
    super();
    this.variable = variable;
    this.value = value;
  }

  validate(fdCon: FieldDescriptionContainer): ValidationResult {
    return compareFilterValidation('LikeFilter')(fdCon, this.supportedTypes, this.variable, this.value);
  }

  toMongoCriteria(fdCon: FieldDescriptionContainer): string {
    const fd = fdCon.getFieldDescription(this.variable);
    const field = formattedFieldName(fd.mapTo);
    const value = stringToData(fd.dataType)(this.value);
    return `{${field}: {"$regex": ${value}, "$options": "i"}}`;
  }

  toMySqlCriteria(fdCon: FieldDescriptionContainer): string {
    const fd = fdCon.getFieldDescription(this.variable);
    const field = fd.mapTo;
    const value = `"%${this.value.lexeme.slice(3, this.value.lexeme.length - 3)}%"`;
    return `${field} LIKE ${value}`;
  }
}

export {
  EqFilter,
  NeFilter,
  LtFilter,
  LteFilter,
  GtFilter,
  GteFilter,
  LikeFilter,
};
