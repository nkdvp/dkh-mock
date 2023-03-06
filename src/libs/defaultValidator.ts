import Validator from 'fastest-validator';
import mongoose from 'mongoose';

const defaultValidator = () => {
  const v = new Validator({
    defaults: {
      messages: {
      },
    },
  });

  // MONGO_OBJECT_ID
  v.alias('MONGO_OBJECT_ID', {
    type: 'string',
    custom: (value: any) => {
      // OPTIONAL FLAG
      if (!value) {return true;}
      // check value
      if (value && typeof (value) === 'string') {
        if (mongoose.isValidObjectId(value)) {return true;}
      }
      return [{
        type: 'MONGO_OBJECT_ID',
        actual: value,
        message: "The field '{field}' must be a valid ObjectId.",
      }];
    },
  });
  return v;
};
const customValidator: any = {
  MONGO_OBJECT_ID: 'MONGO_OBJECT_ID',
};
export { defaultValidator, customValidator };
