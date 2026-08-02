const seen = new Set();

async function claim(key, charge) {
  if (seen.has(key)) {
    return { duplicate: true };
  }

  const result = await charge();
  seen.add(key);
  return { duplicate: false, result };
}

module.exports = { claim };
