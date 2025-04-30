const kgToPound = 2.20462 / 1;
const poundToKG = 1 / 2.20462;
const centimentersToFeet = 0.0328084 / 1;
const feetToCentimeters = 1 / 0.0328084;

const truncateToTwoDecimalPlaces = (n: number): number => {
  const numString = n.toString();
  const decimalIndex = numString.indexOf('.');

  if (decimalIndex === -1) {
    return n;
  }

  return parseFloat(numString.slice(0, decimalIndex + 3));
}

// formatWeight will format the input weight, n, into the unit system that we want. This is indicated by...
// UnitType: 0 means metric, UnitType: 1 means imperialism
const formatWeight = (inputUnitType: boolean, outputUnitType: boolean, n: number): number => {
  // same units, just output the same number
  if (inputUnitType === outputUnitType)
      return truncateToTwoDecimalPlaces(n);
  
  // metric to imperialism
  if (!inputUnitType && outputUnitType) {
    return truncateToTwoDecimalPlaces(n * kgToPound);
  }

  // imperialism to metric
  return truncateToTwoDecimalPlaces(n * poundToKG);
};

// formatHeight will format the input height, n, into the unit system that we want. This is indicated by...
// UnitType: 0 means metric, UnitType: 1 means imperialism
const formatHeight = (inputUnitType: boolean, outputUnitType: boolean, n: number): number => {
  // same units, just output the same number
  if (inputUnitType === outputUnitType)
    return truncateToTwoDecimalPlaces(n);

// metric to imperialism
if (!inputUnitType && outputUnitType) {
  return truncateToTwoDecimalPlaces(n * centimentersToFeet);
}

// imperialism to metric
return truncateToTwoDecimalPlaces(n * feetToCentimeters);
}

export {
  truncateToTwoDecimalPlaces,
  formatWeight,
  formatHeight,
};