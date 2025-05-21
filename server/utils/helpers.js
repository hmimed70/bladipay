const Commande = require('../models/commandeModel');
exports.filterBodyData = (reqBody, allowedFields) => Object.fromEntries(Object.entries(reqBody).filter(([key]) => allowedFields.includes(key)));





exports.splitName = (name) => {
  const [firstName, ...lastName] = name.split(' ');
  return {firstname: firstName ? (firstName) : '', familyname: lastName.length > 0 ? lastName.join(' ') : '' };
}


exports.generateTrackingCode = () => {
  const prefix = 'CMD';
  const timestamp = Date.now().toString(36); // base36 timestamp
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase(); // 4 random chars
  return `${prefix}${timestamp}${randomPart}`;
};


exports.generateUniqueTrackingCode = async () => {
  let trackingCode;
  let exists = true;
  while (exists) {
    trackingCode = generateTrackingCode();
    exists = await Commande.exists({ trackingCode });
  }
  return trackingCode;
};
