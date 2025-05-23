const mongoose = require('mongoose');

const emailConfigSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom du service est requis.'],
    enum: {
      values: ['gmail', 'outlook', 'sendgrid', 'mailgun', 'custom', 'sendinblue', 'mailtrap', 'autre'],
      message: 'Service invalide. Choisissez parmi gmail, outlook, sendgrid, sendinblue, mailtrap mailgun, custom.'
    },
  },
  smtpHost: {
    type: String,
    required: [true, 'L\'hôte SMTP est requis.'],
    trim: true,
  },
  smtpPort: {
    type: Number,
    required: [true, 'Le port SMTP est requis.'],
    min: [1, 'Le port doit être supérieur à 0.'],
    max: [65535, 'Le port ne peut pas dépasser 65535.'],
  },
  secure: {
    type: Boolean,
    default: false,
  },
  authUser: {
    type: String,
    required: [true, 'Le nom d\'utilisateur SMTP est requis.'],
  },
  authPass: {
    type: String,
    required: [true, 'Le mot de passe SMTP est requis.'],
  },
  dailyLimit: {
    type: Number,
    default: 500,
    min: [1, 'Le quota quotidien doit être au moins de 1.'],
  },
  sentToday: {
    type: Number,
    default: 0,
    min: [0, 'Le nombre de mails envoyés aujourd\'hui ne peut pas être négatif.'],
  },
  lastReset: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('EmailConfig', emailConfigSchema);
