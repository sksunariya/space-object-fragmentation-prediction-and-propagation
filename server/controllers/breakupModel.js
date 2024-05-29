// IMPORT UTILITY functions
const {fetchHistoricalData, fetchRealTimeData } = require("./utils/historicalAndRealTimeData");
const { calculateTotalFragments } = require("./utils/calculateFragments");
const { calculateFragmentVelocity } = require("./utils/calculateFragmentVelocity");
const { randomFragmentSize } = require("./utils/calculateFragmentSize");
const { calculateMass } = require("./utils/calculateMass");
const { calculateAreaToMassRatio } = require("./utils/calculateAreaToMassRatio");

const { generateTLE } = require("./utils/generateTLE");
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const math = require('mathjs');

const satellite = require("satellite.js");


// IMPORT CLASS
const ParentObject = require("./utilClass/parentObject");
const Fragment = require("./utilClass/fragment");


class BreakupModel {
    constructor(parentObject, energyOfEvent, locationOfBreakup, efficiency = 0.8) {
        this.parentObject = parentObject;
        this.energyOfEvent = energyOfEvent; // Energy released during the event
        this.locationOfBreakup = locationOfBreakup; // Location within the parent object
        this.efficiency = efficiency; // Efficiency factor for mass conversion
        this.fragments = []; // array to store generated fragments
        this.alpha = 2.2; // Power law exponent for fragment size distribution
        this.minSize = 0.1; // Minimum fragment size in meters
        this.maxSize = 2; // Maximum fragment size in meters (1 meter)
        this.dragCoefficient = 2.2; // Typical drag coefficient for spherical objects
        this.timeStep = 1; // Time step in seconds for drag calculation
        this.G = 6.67430e-11; // Gravitational constant in m^3 kg^-1 s^-2
        this.solarRadiationPressure = 4.56e-6; // Solar radiation pressure at 1 AU in N/m²
        this.speedOfLight = 3e8; // Speed of light in m/s

        this.historicalData = fetchHistoricalData();
        this.realTimeData = fetchRealTimeData();
    }


    generateFragments() {
        const fragmentCount = calculateTotalFragments(this.parentObject, this.historicalData, this.energyOfEvent);
        let remainingMass = this.parentObject.mass * this.efficiency; // Adjust mass based on efficiency as some energy might be lost in the incident

        for (let i = 0; i < fragmentCount; i++) {
            const diameter = randomFragmentSize(this.alpha, this.minSize, this.maxSize);
            let mass = calculateMass(diameter, this.parentObject);


            // Adjust mass if remainingMass is not enough
            if (mass > remainingMass) {
                mass = remainingMass;
            }

            const areaToMassRatio = calculateAreaToMassRatio(diameter, mass);

            const gmst = satellite.gstime(this.parentObject.timeOfEvent);
            const velocity = calculateFragmentVelocity(this.parentObject, this.energyOfEvent, this.historicalData, this.realTimeData);
            
            let position = this.parentObject.position;
            let positionGeodetic = satellite.eciToGeodetic({x: position[0], y: position[1], z: position[2]}, gmst);

            let pos = {
                x: position[0],
                y: position[1],
                z: position[2]
            }
            let vel = {
                x: velocity[0],
                y: velocity[1],
                z: velocity[2]
            }

            let fragmentTLE = generateTLE(pos, vel, this.parentObject.timeOfEvent);
            this.fragments.push(new Fragment(diameter, mass, areaToMassRatio, velocity, position,  this.parentObject.timeOfEvent, fragmentTLE, positionGeodetic));
            // console.log("pushed in fragments");
            remainingMass -= mass;

            // Stop if remaining mass is negligible
            if (remainingMass <= 0) {
                console.log(`Fragments generated: ${i + 1}`);
                break;
            }
        }
        
    }



    async runSimulation() {
        console.log("run Simulation:");
        this.generateFragments();

        this.fragments.forEach(fragment => {
            console.log(fragment);
            console.log(`Fragment: Diameter=${fragment.diameter.toFixed(3)} m, Mass=${fragment.mass.toFixed(3)} kg, A/m=${fragment.areaToMassRatio.toFixed(3)} m^2/kg, Velocity=[${fragment.velocity.map(v => v.toFixed(3)).join(', ')}] m/s, Time of Event=${fragment.timeOfEvent}`);
        });
        
        console.log("parentvelocity: ", Math.sqrt(this.parentObject.velocity[0]*this.parentObject.velocity[0]+this.parentObject.velocity[1]*this.parentObject.velocity[1]+this.parentObject.velocity[2]*this.parentObject.velocity[2]))

        return this.fragments;
    }
}

exports.breakupModel = async (req, res) => {
    try{

        const parentObject = new ParentObject(
            400000, // Mass in kg
            { length: 109, width: 94, height: 73 }, // Dimensions in meters
            2700, // Material density in kg/m^3
            [4118.122395342112, -2922.2549060504672, -5766.013714858897], // Velocity in m/s
            [-5077.667595619432, 564.4280111776876, 4453.041696427384], // position in meters
            new Date(), // Time of event
        );

        const energyOfEvent = 1e3; // Energy released during the event in Joules
        const locationOfBreakup = { x: 109, y: 0, z: 1 }; // Example location of breakup within the parent object

        const breakupModel = await new BreakupModel(parentObject, energyOfEvent, locationOfBreakup, 0.8);
        let fragments = await breakupModel.runSimulation();

        return res.status(200).json({
            success: true,
            message: "Fragments generated successfully.",
            data: fragments
        })
    }
    catch(error){
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Error while generating fragments.",
            Error: error
        })
    }


}


