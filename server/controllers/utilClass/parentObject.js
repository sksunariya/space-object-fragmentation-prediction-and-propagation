module.exports = class ParentObject {
    constructor(mass, dimensions, materialDensity, velocity, position, timeOfEvent) {
        this.mass = mass; // kg
        this.dimensions = dimensions; // meters
        this.materialDensity = materialDensity; // kg/m^3
        this.velocity = velocity; // m/s
        this.position = position;
        this.timeOfEvent = timeOfEvent; // Date object
    }
}