import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema({
  agencia: { type: Number, require: true },
  conta: { type: Number, require: true },
  name: { type: String, require: true },
  balance: {
    type: Number,
    require: true,
    min: [0, "This account doesn't have money enough"],
  },
});

const newAccount = mongoose.model('account', accountSchema);

export { newAccount };
