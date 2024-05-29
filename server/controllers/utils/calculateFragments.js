
exports.calculateTotalFragments = (parentObject, historicalData, energyOfEvent) => {
    const { mass, dimensions, materialDensity } = parentObject;

    // Adjust fragment count based on material properties and historical data
    const densityFactor = calculateDensityFactor(materialDensity);
    const historicalFactor = historicalData.fragmentCountFactor;

    // Empirical formula to estimate the number of fragments
    const fragmentCount = Math.floor(10 * Math.pow(energyOfEvent, 0.75) * densityFactor * historicalFactor);
    // console.log("fragmentcount: ", fragmentCount);
    return fragmentCount;
}

function calculateDensityFactor(materialDensity) {
    // function to adjust fragment count based on material density
    // Denser materials might produce fewer fragments
    const referenceDensity = 2700; // Reference density for typical space debris material (e.g., aluminum)
    return materialDensity / referenceDensity;
}
