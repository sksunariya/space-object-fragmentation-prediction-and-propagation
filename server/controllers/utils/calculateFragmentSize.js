exports.randomFragmentSize = (alpha, minSize, maxSize) => {
    // Using a power law distribution to simulate fragment size

    // Generate a uniform random number in the range (0, 1)
    const u = Math.random();

    // Apply the inverse transform sampling method for power law distribution
    return Math.pow(((Math.pow(maxSize, 1 - alpha) - Math.pow(minSize, 1 - alpha)) * u + Math.pow(minSize, 1 - alpha)), 1 / (1 - alpha));
}