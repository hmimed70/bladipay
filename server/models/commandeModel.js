
const mongoose = require('mongoose');
const validator = require('validator');

const commandeSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['recharge', 'achat_dinars', 'achat_euros'],
    required: true
  },
  clientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
  },
  user: {
    nom: {
        type: String,
            required: [true, "S'il vous plaît entrez nom de beneficiaire"],
    maxLength: [30, "Nom ne peut pas dépasser 30 caractères"],
    minLength: [2, "Nom doit avoir plus de 2 caractères"],
    },
    prenom: {
        type: String,
            required: [true, "S'il vous plaît entrez prenom de beneficiaire"],
    maxLength: [30, "Prenom ne peut pas dépasser 30 caractères"],
    minLength: [2, "Prenom doit avoir plus de 2 caractères"],    },
  email: {
    type: String,
    required: [true, "S'il vous plaît entrez adresse e-mail de beneficiaire"],
    validate: [validator.isEmail, "S'il vous plaît entrez une adresse e-mail valide"],
  },
telephone: {
  type: String,
  required: [true, "S'il vous plaît entrez le numéro de téléphone du bénéficiaire"],
  validate: {
    validator: function (v) {
      return /^(?:(?:\+213|0)(5|6|7)[0-9]{8}|(?:\+33|0)[1-9][0-9]{8})$/.test(v);
    },
    message: props => `${props.value} n'est pas un numéro de téléphone valide pour l'Algérie ou la France`
  }
},
    baridiMob: String, // Optional depending on type
    iban: String // Optional depending on type
  },
  amountPaid: {
    value: Number,
    currency: {
      type: String,
      enum: ['EUR', 'DZD']
    }
  },
  amountReceived: {
    value: Number,
    currency: {
      type: String,
      enum: ['EUR', 'DZD']
    }
  },
  trackingCode: String,
  paymentReceiptUrl: String, // Could be file URL or base64 string
  paymentMethod: {
    type: String,
    enum: ['card', 'baridimob', 'cheque'],
    //required: true
    default: 'card'
  },
  paymentStatus: {
    type: String,
    enum: ['en_attente', 'confirmee',  'livree', 'annulee'],
    default: 'en_attente'
  },
  livreeAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});


const Commande = mongoose.models.Commande || mongoose.model('Commande', commandeSchema);
module.exports = Commande ;