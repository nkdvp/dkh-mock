/* eslint-disable max-classes-per-file */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable class-methods-use-this */
import CustomException from '../exceptions';
import { FieldDescriptionContainer } from '../models/fieldDescription';
import DataType from '../models/literalDataTypes';
import { Filter } from '../models/nodes';
import { Token } from '../models/tokens';
import ValidationResult from '../models/validations';
import { dataTypeNotSupportedException } from '../utils/exceptions';
import { formattedFieldName } from '../utils/mongo';
import stringToData from '../utils/stringToData';

const arrayFilterValidation = (filterName: string) =>
  (
    fdCon: FieldDescriptionContainer,
    supportedTypes: DataType[],
    variable: Token,
    values: Token[],
  ) => {
    try {
      const type = fdCon.getFieldDescription(variable).dataType;
      if (!supportedTypes.includes(type)) {
        throw dataTypeNotSupportedException(type);
      }
      fdCon.incOccurrence(variable);

      // eslint-disable-next-line no-restricted-syntax
      for (const v of values) {
        stringToData(type)(v);
      }

      return new ValidationResult(true, undefined);
    } catch (err) {
      const exception = new CustomException(`${filterName}: ${err.message}`);
      return new ValidationResult(false, exception);
    }
  };

class InFilter extends Filter {
  supportedTypes: DataType[] = [DataType.STRING, DataType.DATE, DataType.INTEGER, DataType.DOUBLE];

  variable: Token;

  values: Token[];

  constructor(variable: Token, values: Token[]) {
    super();
    this.variable = variable;
    this.values = values;
  }

  validate(fdCon: FieldDescriptionContainer): ValidationResult {
    return arrayFilterValidation('InFilter')(fdCon, this.supportedTypes, this.variable, this.values);
  }

  toMongoCriteria(fdCon: FieldDescriptionContainer): string {
    const fd = fdCon.getFieldDescription(this.variable);
    const field = formattedFieldName(fd.mapTo);
    const values = this.values.map((v) => stringToData(fd.dataType)(v));
    return `{${field}: {"$in": [${values}]}}`;
  }

  toMySqlCriteria(fdCon: FieldDescriptionContainer): string {
    const fd = fdCon.getFieldDescription(this.variable);
    const field = fd.mapTo;
    const values = this.values.map((v) => stringToData(fd.dataType)(v));
    const valuesSeparatedByComma = values.reduce((res, elem, i) => (i ? `${res}, ${elem}` : elem), '');
    return `${field} IN (${valuesSeparatedByComma})`;
  }
}

class NinFilter extends Filter {
  supportedTypes: DataType[] = [DataType.STRING, DataType.DATE, DataType.INTEGER, DataType.DOUBLE];

  variable: Token;

  values: Token[];

  constructor(variable: Token, values: Token[]) {
    super();
    this.variable = variable;
    this.values = values;
  }

  validate(fdCon: FieldDescriptionContainer): ValidationResult {
    return arrayFilterValidation('NinFilter')(fdCon, this.supportedTypes, this.variable, this.values);
  }

  toMongoCriteria(fdCon: FieldDescriptionContainer): string {
    const fd = fdCon.getFieldDescription(this.variable);
    const field = formattedFieldName(fd.mapTo);
    const values = this.values.map((v) => stringToData(fd.dataType)(v));
    return `{${field}: {"$nin": [${values}]}}`;
  }

  toMySqlCriteria(fdCon: FieldDescriptionContainer): string {
    const fd = fdCon.getFieldDescription(this.variable);
    const field = fd.mapTo;
    const values = this.values.map((v) => stringToData(fd.dataType)(v));
    const valuesSeparatedByComma = values.reduce((res, elem, i) => (i ? `${res}, ${elem}` : elem), '');
    return `${field} NOT IN (${valuesSeparatedByComma})`;
  }
}

class RangeFilter extends Filter {
  supportedTypes: DataType[] = [DataType.STRING, DataType.DATE, DataType.INTEGER, DataType.DOUBLE];

  variable: Token;

  values: Token[];

  constructor(variable: Token, values: Token[]) {
    super();
    this.variable = variable;
    this.values = values;
  }

  validate(fdCon: FieldDescriptionContainer): ValidationResult {
    return arrayFilterValidation('RangeFilter')(fdCon, this.supportedTypes, this.variable, this.values);
  }

  toMongoCriteria(fdCon: FieldDescriptionContainer): string {
    const fd = fdCon.getFieldDescription(this.variable);
    const field = formattedFieldName(fd.mapTo);
    const values = this.values.map((v) => stringToData(fd.dataType)(v));
    return `{${field}: {"$range": [${values}]}}`;
  }

  toMySqlCriteria(fdCon: FieldDescriptionContainer): string {
    const fd = fdCon.getFieldDescription(this.variable);
    const field = fd.mapTo;
    const values = this.values.map((v) => stringToData(fd.dataType)(v));
    return `${field} BETWEEN ${values[0]} AND ${values[1]}`;
  }
}

export {
  InFilter,
  NinFilter,
  RangeFilter,
};
