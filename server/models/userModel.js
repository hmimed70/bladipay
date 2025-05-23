const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');


const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  nom: {
    type: String,
    required: [true, "S'il vous plaît entrez votre nom"],
    maxLength: [30, "Nom ne peut pas dépasser 30 caractères"],
    minLength: [2, "Nom doit avoir plus de 2 caractères"],
  },
  prenom: {
    type: String,
    required: [true, "S'il vous plaît entrez votre prenom"],
    maxLength: [30, "Prenom ne peut pas dépasser 30 caractères"],
    minLength: [3, "Prenom doit avoir plus de 3 caractères"],
  },
  email: {
    type: String,
    required: [true, "S'il vous plaît entrez votre adresse e-mail"],
    unique: true,
    validate: [validator.isEmail, "S'il vous plaît entrez une adresse e-mail valide"],
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
  },
telephone: {
  type: String,
  required: [true, "S'il vous plaît entrez le numéro de téléphone du bénéficiaire"],
  unique: true,
  validate: {
    validator: function (v) {
      return /^(?:(?:\+213|0)(5|6|7)[0-9]{8}|(?:\+33|0)[1-9][0-9]{8})$/.test(v);
    },
    message: props => `${props.value} n'est pas un numéro de téléphone valide pour l'Algérie ou la France`
  }
},
  active: {
    type: Boolean,
    default: true,
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  passwordChangedAt: Date,


  role: {
    type: String,
    enum: ['admin', 'client'],
    default: 'client',
  },
  avatar: {
    type: String, 
    default: null
  }
},
{
    timestamps: true,
  });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});
/*
userSchema.pre(/^find/, function(next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});
*/
userSchema.pre('remove', async function (next) {
  try {
    // Delete payments associated with this user
   // await Payment.deleteMany({ userId: this._id });
    next();
  } catch (error) {
    //next(error);
  }
});
// Method to compare password during login
userSchema.methods.comparePassword = async function (candidatePassword, ) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};


userSchema.methods.getResetPasswordToken = function () {
    // Generating Token
    const resetToken = crypto.randomBytes(24).toString("hex");
  
    // Hashing and adding resetPasswordToken to userSchema
    this.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
  
    this.passwordResetExpires = Date.now() + 15 * 60 * 1000;
  
    return resetToken;
};

const User = mongoose.models.User || mongoose.model('User', userSchema);
module.exports = User ;