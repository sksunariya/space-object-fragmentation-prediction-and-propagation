
exports.calculateAreaToMassRatio = (diameter, mass) => {
    // Assume spherical fragments
    const area = Math.PI * Math.pow(diameter / 2, 2);
    return area / mass;
}