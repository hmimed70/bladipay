exports.validateInput = (inputData, requiredFields) => {
  const missingFields = [];

  requiredFields.forEach(field => {
    const value = inputData[field];

    if (value === undefined || (typeof value === 'string' && value.trim() === '')) {
      missingFields.push(field);
    }
  });

  return missingFields;
};
