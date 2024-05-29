const satellite = require("satellite.js");
exports.generateTLE = (position, velocity, currentDate, satelliteNumber="00000", classification='U', internationalDesignator="00000A", revolutionNumber="00001") => {

    const mu = 398600.4418;

    function formatTLEEpoch(date) {
        // Extract year, day of the year, and fraction of the day
        const year = date.getUTCFullYear().toString().slice(-2); // Last two digits of the year
        const dayOfYear = getDayOfYear(date); // Get the day of the year
        const fractionOfDay = (date.getUTCHours() * 3600 + date.getUTCMinutes() * 60 + date.getUTCSeconds() + date.getUTCMilliseconds() / 1000) / 86400;

        // Format the fraction of the day to 8 decimal places
        const fractionString = fractionOfDay.toFixed(8).slice(2); // Exclude '0.' from the string

        return `${year.padStart(2, '0')}${dayOfYear.toFixed().padStart(3, '0')}.${fractionString}`;
    }
    function getDayOfYear(date) {
        // Get the current date and calculate the day of the year
        const start = new Date(date.getUTCFullYear(), 0, 0);
        const diff = date - start;
        const oneDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / oneDay);
    }
    // // const epochDate = new Date(); // Current date and time
    // // const tleEpoch = formatTLEEpoch(epochDate);
    // // console.log("TLE Epoch:", tleEpoch);

    // // console.log("date.now: " , new Date());



    function calculateChecksum(line) {
        // Simplified checksum calculation
        let checksum = 0;
        for (let i = 0; i < line.length; i++) {
            let char = line.charAt(i);
            if (char >= '0' && char <= '9') {
                checksum += parseInt(char);
            } else if (char === '-') {
                checksum += 1;
            }
        }
        return checksum % 10;
    }

    function vectorMagnitude(v) {
        return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    }

    function vectorDot(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    }

    function vectorCross(v1, v2) {
        return {
            x: v1.y * v2.z - v1.z * v2.y,
            y: v1.z * v2.x - v1.x * v2.z,
            z: v1.x * v2.y - v1.y * v2.x,
        };
    }

    const vMagnitude = vectorMagnitude(velocity);
    const rMagnitude = vectorMagnitude(position);

    // angular momentum
    const h = vectorCross(position, velocity);
    const hMagnitude = vectorMagnitude(h);

    // Inclination
    let i = (Math.acos(h.z / hMagnitude)) * (180 / Math.PI);

    // node vector
    const n = vectorCross({x: 0, y: 0, z: 1}, h);
    const nMagnitude = vectorMagnitude(n);

    // RAAN
    let raan = (n.y >= 0) ? Math.acos(n.x / nMagnitude) : (2*Math.PI)-Math.acos(n.x / nMagnitude);
    raan = raan * (180 / Math.PI)

    // Eccentricity vector
    const vCorssH = vectorCross(velocity, h);
        
    const eVec = {
        x: (vCorssH.x / mu - position.x / rMagnitude),
        y: (vCorssH.y / mu - position.y / rMagnitude),
        z: (vCorssH.z / mu - position.z / rMagnitude),
    }

    // eccentricity
    let e = vectorMagnitude(eVec);

    // Argument of periapsis
    let omega = Math.acos((vectorDot(n, eVec)) / (nMagnitude * e));
    if (eVec.z < 0) omega = 2 * Math.PI - omega;
    omega = omega*(180/Math.PI)

    // True anomaly
    let nu = Math.acos(vectorDot(eVec, position) / (e * rMagnitude));
    if (vectorDot(position, velocity) < 0) nu = 2 * Math.PI - nu;

    // Semi-major axis
    const a = 1 / ((2/rMagnitude) - (vMagnitude * vMagnitude / mu ));


    // eccentric anomaly
    const E = 2 * Math.atan(Math.sqrt((1 - e) / (1 + e)) * Math.tan(nu / 2));
    // mean anomaly
    let meanAnomaly = Math.abs(E - e * Math.sin(E)) * (180 / Math.PI);

    // mean motion
    let meanMotion = Math.sqrt(mu/Math.pow(a,3));
    meanMotion = meanMotion * 13750.987;



    let epoch = formatTLEEpoch(currentDate);

    i = i.toFixed(4).padStart(8, " ");
    raan = raan.toFixed(4).padStart(8, " ");
    omega = omega.toFixed(4).padStart(8, " ");
    meanAnomaly = meanAnomaly.toFixed(4).padStart(8, " ");
    meanMotion = meanMotion.toFixed(8).padStart(11, " ");

    console.log("position: ", position, velocity);
    console.log("i: ", i, ", raan: ", raan, ", omega: ", omega, ", meananomaly: " , meanAnomaly, ", meanmotion: ", meanMotion);


    let line1 = `1 ${satelliteNumber}${classification} ${internationalDesignator}   ${epoch} -.00002182  00000-0 -11606-4 0  292`;
    let line2 = `2 ${satelliteNumber} ${i} ${raan} ${e.toFixed(7).substring(2)} ${omega} ${meanAnomaly} ${meanMotion}${revolutionNumber}`;

    // Calculate checksum for each line
    line1 += calculateChecksum(line1);
    line2 += calculateChecksum(line2);

    const resultTLE = `${line1}\n${line2}`;

    // console.log("generatedTLE (in generateTLE) : ")
    // console.log( resultTLE);

    return resultTLE;
}


// let initialTLE = `1 00000U 00000A   24144.96397389 -.00002182  00000-0 -11606-4 0  2928
// 2 00000  75.4979 246.3949 77.7023432 341.9657      NaN         NaN000011`


// initialTLE = 
// `1 25544U 98067A   22097.38965280  .00000580  00000-0  19520-4 0  9994
//  2 25544  51.6448 332.0653 0003090  91.8233  85.9339 15.48953106316992`

// let satrec = satellite.twoline2satrec(
//     initialTLE.split('\n')[0].trim(), 
//     initialTLE.split('\n')[1].trim()
// );

// const epoch = new Date(); // YYDDD.DDDDDDDD format
// // const epoch = '24052.00000000';

// const positionAndVelocity = satellite.propagate(satrec, epoch);
// console.log("positonvel: ", positionAndVelocity);

// const tle = generateTLE(positionAndVelocity.position, positionAndVelocity.velocity, epoch);
// console.log(tle);
