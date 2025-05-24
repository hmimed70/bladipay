const mongoose = require('mongoose');

const rechargeOptionsSchema = new mongoose.Schema({
  eur: Number,
  dzd: Number,
});

const parameterSchema = new mongoose.Schema({
  baridimob_bladipay: { type: String, required: true },
  rechargeOptions: [rechargeOptionsSchema], // Recharge mobile options
  achatEuros: { type: Number, required: true }, // Achat dinars
  achatDinars: { type: Number, required: true }, // Achat euros
  limitAchatDinarsJour: { type: Number, required: true }, // Daily limit achat dinars in DZD
  limitAchatEuroJour: { type: Number, required: true }, // Daily limit achat euros in EUR
}, {
  timestamps: true,
});

module.exports = mongoose.model('Parameter', parameterSchema);
