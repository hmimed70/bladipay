const Parameter = require('../models/ParameterModel');
const catchAsyncError = require('../middlewares/catchAsyncError');
const ErrorHandler = require('../utils/errorHandler');

// Create or update parameter (singleton)
exports.setParameters = catchAsyncError(async (req, res, next) => {
  const {
    rechargeOptions,
    euroToDinarRate,
    dinarToEuroRate,
    limitAchatDinarsJour,
    limitAchatEuroJour
  } = req.body;

  const existing = await Parameter.findOne();
  
  let params;
  if (existing) {
    existing.rechargeOptions = rechargeOptions;
    existing.euroToDinarRate = euroToDinarRate;
    existing.dinarToEuroRate = dinarToEuroRate;
    existing.limitAchatDinarsJour = limitAchatDinarsJour;
    existing.limitAchatEuroJour = limitAchatEuroJour;
    params = await existing.save();
  } else {
    params = await Parameter.create({
      rechargeOptions,
      euroToDinarRate,
      dinarToEuroRate,
      limitAchatDinarsJour,
      limitAchatEuroJour
    });
  }

  res.status(200).json({
    success: true,
    parameter: params
  });
});

// Get parameters
exports.getParameters = catchAsyncError(async (req, res, next) => {
  const params = await Parameter.findOne();

  if (!params) return next(new ErrorHandler("Paramètres introuvables", 404));

  res.status(200).json({
    success: true,
    parameter: params
  });
});
