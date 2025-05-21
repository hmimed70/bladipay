const mongoose = require('mongoose');

const rechargeOptionsSchema = new mongoose.Schema({
  eur: Number,
  dzd: Number,
});

const parameterSchema = new mongoose.Schema({
  rechargeOptions: [rechargeOptionsSchema], // Recharge mobile options
  euroToDinarRate: { type: Number, required: true }, // Achat dinars
  dinarToEuroRate: { type: Number, required: true }, // Achat euros
  limitAchatDinarsJour: { type: Number, required: true }, // Daily limit achat dinars in DZD
  limitAchatEuroJour: { type: Number, required: true }, // Daily limit achat euros in EUR
}, {
  timestamps: true,
});

module.exports = mongoose.model('Parameter', parameterSchema);
