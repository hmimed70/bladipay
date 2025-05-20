const wilayas = require('./Wilaya.json');
const communes = require('./Communes.json');
const providers = require('./ShippingProviders')

exports.filterBodyData = (reqBody, allowedFields) => Object.fromEntries(Object.entries(reqBody).filter(([key]) => allowedFields.includes(key)));

exports.getProviderApiByName = (providerName) =>
  (providers.find(p => p.name === providerName) ||
    (() => { throw new Error(`Provider with name "${providerName}" not found.`) })()).api;

exports.normalizeCommune = (name) => name ? name.toLowerCase().replace(/['-]/g, '') : '';

exports.getWilayaCode = (wilayaName) => (wilayas.find((w) => w.nom === wilayaName) || {}).code || "Unknown";

exports.isCommuneExist = (communeName) => communes.find((c) => c.name === communeName || c.second_name === communeName);

exports.splitName = (name) => {
  const [firstName, ...lastName] = name.split(' ');
  return {firstname: firstName ? (firstName) : '', familyname: lastName.length > 0 ? lastName.join(' ') : '' };
}
