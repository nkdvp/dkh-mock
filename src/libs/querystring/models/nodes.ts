/* eslint-disable max-classes-per-file */
import { FieldDescriptionContainer } from './fieldDescription';
import ValidationResult from './validations';

export abstract class TreeNode {
  readonly name: string;

  abstract validate(fdCon: FieldDescriptionContainer): ValidationResult;

  abstract toMongoCriteria(fdCon: FieldDescriptionContainer): string;

  abstract toMySqlCriteria(fdCon: FieldDescriptionContainer): string;
}

export abstract class Clause extends TreeNode {}
export abstract class Filter extends TreeNode {}
