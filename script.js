// Calculate and display regression results
document.getElementById("calculate-btn").addEventListener("click", function() {
    // Get all input rows
    const rows = document.querySelectorAll("#input-rows > div");
    const xValues = [];
    const yValues = [];

    // Extract X and Y values
    rows.forEach(row => {
        const inputs = row.querySelectorAll("input");
        const x = parseFloat(inputs[0].value);
        const y = parseFloat(inputs[1].value);

        if (!isNaN(x) && !isNaN(y)) {
            xValues.push(x);
            yValues.push(y);
        }
    });

    // Need at least 2 points
    if (xValues.length < 2) {
        alert("Please enter at least 2 valid data points.");
        return;
    }

    // Calculate regression
    const n = xValues.length;
    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = yValues.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
    const sumX2 = xValues.reduce((sum, x) => sum + x * x, 0);
    const sumY2 = yValues.reduce((sum, y) => sum + y * y, 0);

    // Calculate slope (m) and intercept (b)
    const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const b = (sumY - m * sumX) / n;

    // Calculate correlation coefficient (r)
    const r = (n * sumXY - sumX * sumY) /
              Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    const r2 = r * r;

    // Determine strength
    let strength;
    const absR = Math.abs(r);
    if (absR >= 0.9) strength = "Very Strong";
    else if (absR >= 0.7) strength = "Strong";
    else if (absR >= 0.5) strength = "Moderate";
    else if (absR >= 0.3) strength = "Weak";
    else strength = "Very Weak";

    // Display results
    document.getElementById("equation").textContent = `y = ${m.toFixed(4)}x + ${b.toFixed(4)}`;
    document.getElementById("slope").textContent = m.toFixed(4);
    document.getElementById("intercept").textContent = b.toFixed(4);
    document.getElementById("correlation").textContent = r.toFixed(4);
    document.getElementById("r-squared").textContent = r2.toFixed(4);
    document.getElementById("strength").textContent = strength;

    // Draw scatter plot
    drawScatterPlot(xValues, yValues, m, b);
});

function drawScatterPlot(xValues, yValues, m, b) {
    const canvas = document.getElementById("scatter-diagram");
    const ctx = canvas.getContext("2d");

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set white background
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const padding = 60;
    const width = canvas.width - 2 * padding;
    const height = canvas.height - 2 * padding;

    // Find min and max values
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);

    // Add some padding to the ranges
    const xRange = maxX - minX || 1;
    const yRange = maxY - minY || 1;
    const xMin = minX - xRange * 0.1;
    const xMax = maxX + xRange * 0.1;
    const yMin = minY - yRange * 0.1;
    const yMax = maxY + yRange * 0.1;

    // Scale functions
    const scaleX = (x) => padding + ((x - xMin) / (xMax - xMin)) * width;
    const scaleY = (y) => canvas.height - padding - ((y - yMin) / (yMax - yMin)) * height;

    // Draw axes
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    // Draw axis labels
    ctx.fillStyle = "#333";
    ctx.font = "14px Arial";
    ctx.textAlign = "center";

    // X-axis label
    ctx.fillText("X", canvas.width / 2, canvas.height - 20);

    // Y-axis label
    ctx.save();
    ctx.translate(20, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("Y", 0, 0);
    ctx.restore();

    // Draw grid and ticks
    ctx.strokeStyle = "#ddd";
    ctx.lineWidth = 1;
    ctx.fillStyle = "#666";
    ctx.font = "12px Arial";

    // X-axis ticks
    for (let i = 0; i <= 5; i++) {
        const x = xMin + (xMax - xMin) * (i / 5);
        const px = scaleX(x);

        ctx.beginPath();
        ctx.moveTo(px, canvas.height - padding);
        ctx.lineTo(px, canvas.height - padding + 5);
        ctx.stroke();

        ctx.textAlign = "center";
        ctx.fillText(x.toFixed(1), px, canvas.height - padding + 20);

        // Grid line
        ctx.strokeStyle = "#f0f0f0";
        ctx.beginPath();
        ctx.moveTo(px, padding);
        ctx.lineTo(px, canvas.height - padding);
        ctx.stroke();
        ctx.strokeStyle = "#ddd";
    }

    // Y-axis ticks
    for (let i = 0; i <= 5; i++) {
        const y = yMin + (yMax - yMin) * (i / 5);
        const py = scaleY(y);

        ctx.beginPath();
        ctx.moveTo(padding, py);
        ctx.lineTo(padding - 5, py);
        ctx.stroke();

        ctx.textAlign = "right";
        ctx.fillText(y.toFixed(1), padding - 10, py + 5);

        // Grid line
        ctx.strokeStyle = "#f0f0f0";
        ctx.beginPath();
        ctx.moveTo(padding, py);
        ctx.lineTo(canvas.width - padding, py);
        ctx.stroke();
        ctx.strokeStyle = "#ddd";
    }

    // Draw regression line
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2;
    ctx.beginPath();
    const y1 = m * xMin + b;
    const y2 = m * xMax + b;
    ctx.moveTo(scaleX(xMin), scaleY(y1));
    ctx.lineTo(scaleX(xMax), scaleY(y2));
    ctx.stroke();

    // Draw data points
    ctx.fillStyle = "#4f46e5";
    xValues.forEach((x, i) => {
        const y = yValues[i];
        const px = scaleX(x);
        const py = scaleY(y);

        ctx.beginPath();
        ctx.arc(px, py, 5, 0, 2 * Math.PI);
        ctx.fill();

        // Add stroke for better visibility
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.strokeStyle = "#3b82f6";
    });
}

