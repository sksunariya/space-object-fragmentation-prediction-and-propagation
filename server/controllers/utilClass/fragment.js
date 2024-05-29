module.exports = class Fragment {
    constructor(diameter, mass, areaToMassRatio, velocity, position,  timeOfEvent, TLE, positionGeodetic) {
        this.diameter = diameter;
        this.mass = mass;
        this.areaToMassRatio = areaToMassRatio;
        this.velocity = velocity;
        this.position = position; // Initialize position
        this.positionGeodetic = positionGeodetic;
        this.timeOfEvent = timeOfEvent; // Time of event
        this.TLE = TLE;
    }
}