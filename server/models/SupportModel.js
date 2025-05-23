const mongoose = require('mongoose');

const SupportSchema = new mongoose.Schema({
  type: {
    type: String,
  enum: [
    'Problème de Recharge',
    'Problème de Paiement',
    'Retard de commande',
    'Demande de Remboursement',
    'Modification de Commande',
    'problème de Compte',
    'Suggestions',
    'Autre'
  ],    
  required: true
  },
  clientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
  },
  description: {
    type: String,
    required: [true, "S'il vous plaît entrez votre description"],
  },
    image: { type: String, default: null }, 

}, {
    timestamps: true
});
const Support = mongoose.models.Support || mongoose.model('Support', SupportSchema);
module.exports = Support ;