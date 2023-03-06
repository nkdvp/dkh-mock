import mongoose from 'mongoose';

const testSchema = new mongoose.Schema({
  test: 'string',
}, { collection: 'test' });
const model = mongoose.model('test', testSchema);
export default model;
