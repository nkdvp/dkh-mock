/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
import CustomException from '../exceptions';
import { FieldDescriptionContainer } from '../models/fieldDescription';
import { Clause, TreeNode } from '../models/nodes';
import ValidationResult from '../models/validations';

export class AndClause extends Clause {
  children: TreeNode[];

  constructor(children: TreeNode[]) {
    super();
    this.children = children;
  }

  validate(fdCon: FieldDescriptionContainer): ValidationResult {
    let result = new ValidationResult(true, undefined);
    this.children.every((child, i) => {
      const vr = child.validate(fdCon);
      if (!vr.valid) {
        const exception = new CustomException(`AND ${i} | ${vr.exception.message}`);
        result = new ValidationResult(false, exception);
        return false;
      }
      return true;
    });
    return result;
  }

  toMongoCriteria(fdCon: FieldDescriptionContainer): string {
    const childrenCriteria = this.children.map((child) => child.toMongoCriteria(fdCon));
    return `{"$and": [${childrenCriteria}]}`;
  }

  toMySqlCriteria(fdCon: FieldDescriptionContainer): string {
    const childrenCriteria = this.children.map((child) => child.toMySqlCriteria(fdCon));
    return childrenCriteria.reduce((res, elem, i) => (i ? `${res} AND (${elem})` : `(${elem})`), '');
  }
}

export class OrClause extends Clause {
  children: TreeNode[];

  constructor(children: TreeNode[]) {
    super();
    this.children = children;
  }

  validate(fdCon: FieldDescriptionContainer): ValidationResult {
    let result = new ValidationResult(true, undefined);
    this.children.every((child, i) => {
      const vr = child.validate(fdCon);
      if (!vr.valid) {
        const exception = new CustomException(`OR ${i} | ${vr.exception.message}`);
        result = new ValidationResult(false, exception);
        return false;
      }
      return true;
    });
    return result;
  }

  toMongoCriteria(fdCon: FieldDescriptionContainer): string {
    const childrenCriteria = this.children.map((child) => child.toMongoCriteria(fdCon));
    return `{"$or": [${childrenCriteria}]}`;
  }

  toMySqlCriteria(fdCon: FieldDescriptionContainer): string {
    const childrenCriteria = this.children.map((child) => child.toMySqlCriteria(fdCon));
    return childrenCriteria.reduce((res, elem, i) => (i ? `${res} OR (${elem})` : `(${elem})`), '');
  }
}

export class NotClause extends Clause {
  child: TreeNode;

  constructor(child: TreeNode) {
    super();
    this.child = child;
  }

  validate(fdCon: FieldDescriptionContainer): ValidationResult {
    const vr = this.child.validate(fdCon);
    if (!vr.valid) {
      const exception = new CustomException(`NOT | ${vr.exception.message}`);
      return new ValidationResult(false, exception);
    }
    return new ValidationResult(true, undefined);
  }

  // TODO: $not operator can't be used as clause operator in mongodb
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  toMongoCriteria(fdCon: FieldDescriptionContainer): string {
    throw new Error('Method not implemented.');
  }

  toMySqlCriteria(fdCon: FieldDescriptionContainer): string {
    return `NOT (${this.child.toMySqlCriteria(fdCon)})`;
  }
}
