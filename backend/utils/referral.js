function makeReferralCode(name = "USER") {
  const clean = name.replace(/[^a-zA-Z]/g, "").slice(0, 5).toUpperCase() || "USER";
  return `${clean}${Date.now().toString().slice(-6)}`;
}
module.exports = makeReferralCode;
