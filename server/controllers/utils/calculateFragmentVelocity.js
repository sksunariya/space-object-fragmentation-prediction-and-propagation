const math = require("mathjs");

exports.calculateFragmentVelocity = (parentObject, energyOfEvent, historicalData, realTimeData) => {
    const meanVelocity = parentObject.velocity;
    console.log("meanVelocity: ", meanVelocity);
    const stdDev = calculateStandardDeviation(parentObject, energyOfEvent);
    const velocityMagnitude = Math.sqrt(meanVelocity[0]*meanVelocity[0] + meanVelocity[1]*meanVelocity[1] + meanVelocity[2]*meanVelocity[2])

    // Calculate direction vector from location of breakup
    const directionVector = [
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5
    ];
    const norm = math.norm(directionVector);
    const normalizedDirection = directionVector.map(v => v / norm);

    
    const velocityImparted = normalizedDirection.map(v => v * velocityMagnitude);

    // console.log("velocityImparted: ", velocityImparted, historicalAdjustment, realTimeCorrection);

    
    let vx = meanVelocity[0] + velocityImparted[0]* stdDev ;
    let vy = meanVelocity[1] + velocityImparted[1]* stdDev ;
    let vz = meanVelocity[2] + velocityImparted[2]* stdDev ;
    // console.log("v: ", vx, vy, vz);
    let vMag = Math.sqrt(vx*vx + vy*vy + vz*vz);
    return [vx, vy, vz, vMag];
    
}


function calculateStandardDeviation(parentObject, energyOfEvent) {
    // Hypothetical parameters based on historical data or empirical models
    const baseStdDev = Math.sqrt(energyOfEvent / parentObject.mass); // Adjust stdDev based on energy and mass
    const massFactor = parentObject.mass > 500 ? 1.2 : 1.0; // Example factor based on total mass (CAN BE REPLACED WITH EXPERIMENTAL VALUES)
    const velocityFactor = math.norm(parentObject.velocity) > 7500 ? 1.1 : 1.0; // Example factor based on parent velocity
    console.log("std dev: ", baseStdDev*massFactor*velocityFactor);
    return baseStdDev * massFactor * velocityFactor;
}
