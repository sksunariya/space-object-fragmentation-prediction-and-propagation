const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const math = require('mathjs');

function calculateVelocityMagnitudes(fragments) {
    return fragments.map(fragment => math.norm(fragment.velocity));
}

exports.plotVelocityDistribution = async (fragments) => {
    const velocityMagnitudes = calculateVelocityMagnitudes();
    
    // Set up ChartJS
    const width = 800;
    const height = 600;
    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });
    
    const configuration = {
        type: 'bar',
        data: {
            labels: velocityMagnitudes.map((_, index) => index),
            datasets: [{
                label: 'Fragment Velocity Magnitudes',
                data: velocityMagnitudes,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    };

    const imageBuffer = await chartJSNodeCanvas.renderToBuffer(configuration);
    return require('fs').writeFileSync('./velocity_distribution.png', imageBuffer);
}