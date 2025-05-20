
exports.filterBodyData = (reqBody, allowedFields) => Object.fromEntries(Object.entries(reqBody).filter(([key]) => allowedFields.includes(key)));





exports.splitName = (name) => {
  const [firstName, ...lastName] = name.split(' ');
  return {firstname: firstName ? (firstName) : '', familyname: lastName.length > 0 ? lastName.join(' ') : '' };
}
