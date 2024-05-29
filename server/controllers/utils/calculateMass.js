exports.calculateMass = (diameter, parentObject) => {
    // Assume spherical fragments and a typical density for space debris
    const density = parentObject.materialDensity; // kg/m^3
    const radius = diameter / 2;
    const volume = (4 / 3) * Math.PI * Math.pow(radius, 3);
    return density * volume;
}