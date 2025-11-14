// Calculate and display regression results
document.getElementById("calculate-btn").addEventListener("click", function() {
    const rows = document.querySelectorAll("#input-rows > div");
    const xValues = [];
    const yValues = [];

    rows.forEach(row => {
        const inputs = row.querySelectorAll("input");
        const xInput = inputs[0].value.trim();
        const yInput = inputs[1].value.trim();
        
        if (xInput === "" && yInput === "") {
            return;
        }
        
        const x = parseFloat(xInput);
        const y = parseFloat(yInput);

        if (!isNaN(x) && !isNaN(y) && isFinite(x) && isFinite(y)) {
            xValues.push(x);
            yValues.push(y);
        }
    });

    if (xValues.length < 2) {
        alert("Please enter at least 2 valid data points with numeric values.");
        return;
    }

    const n = xValues.length;
    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = yValues.reduce((a, b) => a + b, 0);
    const meanX = sumX / n;
    const meanY = sumY / n;
    
    let sumXY = 0;
    let sumX2 = 0;
    let sumY2 = 0;
    
    for (let i = 0; i < n; i++) {
        const dx = xValues[i] - meanX;
        const dy = yValues[i] - meanY;
        sumXY += dx * dy;
        sumX2 += dx * dx;
        sumY2 += dy * dy;
    }
    
    if (Math.abs(sumX2) < 1e-10) {
        alert("Error: All X values are the same. Cannot calculate regression line.\nPlease enter different X values.");
        return;
    }
    
    if (Math.abs(sumY2) < 1e-10) {
        alert("Error: All Y values are the same. The relationship is constant.\nSlope will be 0 and correlation undefined.");
    }

    const m = sumXY / sumX2;
    const b = meanY - m * meanX;

    let r, r2;
    const rDenominator = Math.sqrt(sumX2 * sumY2);
    
    if (Math.abs(rDenominator) < 1e-10) {
        r = 0;
        r2 = 0;
    } else {
        r = sumXY / rDenominator;
        r2 = r * r;
    }
    
    if (!isFinite(m) || !isFinite(b)) {
        alert("Error: Calculation resulted in invalid values. Please check your data.");
        return;
    }

    let strength;
    const absR = Math.abs(r);
    if (!isFinite(r) || isNaN(r)) {
        strength = "Undefined";
    } else if (absR >= 0.9) {
        strength = "Very Strong";
    } else if (absR >= 0.7) {
        strength = "Strong";
    } else if (absR >= 0.5) {
        strength = "Moderate";
    } else if (absR >= 0.3) {
        strength = "Weak";
    } else {
        strength = "Very Weak";
    }

    const formatNumber = (num) => {
        if (!isFinite(num) || isNaN(num)) return "N/A";
        return parseFloat(num.toFixed(4)).toString();
    };
    
    const equation = b >= 0 
        ? `y = ${formatNumber(m)}x + ${formatNumber(b)}`
        : `y = ${formatNumber(m)}x - ${formatNumber(Math.abs(b))}`;
    
    document.getElementById("equation").textContent = equation;
    document.getElementById("slope").textContent = formatNumber(m);
    document.getElementById("intercept").textContent = formatNumber(b);
    document.getElementById("correlation").textContent = formatNumber(r);
    document.getElementById("r-squared").textContent = formatNumber(r2);
    document.getElementById("strength").textContent = strength;

    drawScatterPlot(xValues, yValues, m, b);
});

function drawScatterPlot(xValues, yValues, m, b) {
    const canvas = document.getElementById("scatter-diagram");
    const ctx = canvas.getContext("2d");

    if (!xValues || !yValues || xValues.length === 0 || yValues.length === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const padding = 60;
    const width = canvas.width - 2 * padding;
    const height = canvas.height - 2 * padding;

    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);

    const xRange = maxX - minX || 1;
    const yRange = maxY - minY || 1;
    const xMin = minX - xRange * 0.1;
    const xMax = maxX + xRange * 0.1;
    const yMin = minY - yRange * 0.1;
    const yMax = maxY + yRange * 0.1;

    const scaleX = (x) => padding + ((x - xMin) / (xMax - xMin)) * width;
    const scaleY = (y) => canvas.height - padding - ((y - yMin) / (yMax - yMin)) * height;

    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    ctx.fillStyle = "#333";
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    ctx.fillText("X", canvas.width / 2, canvas.height - 20);

    ctx.save();
    ctx.translate(20, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("Y", 0, 0);
    ctx.restore();

    ctx.strokeStyle = "#ddd";
    ctx.lineWidth = 1;
    ctx.fillStyle = "#666";
    ctx.font = "12px Arial";

    for (let i = 0; i <= 5; i++) {
        const x = xMin + (xMax - xMin) * (i / 5);
        const px = scaleX(x);

        ctx.beginPath();
        ctx.moveTo(px, canvas.height - padding);
        ctx.lineTo(px, canvas.height - padding + 5);
        ctx.stroke();

        ctx.textAlign = "center";
        ctx.fillText(x.toFixed(1), px, canvas.height - padding + 20);

        ctx.strokeStyle = "#f0f0f0";
        ctx.beginPath();
        ctx.moveTo(px, padding);
        ctx.lineTo(px, canvas.height - padding);
        ctx.stroke();
        ctx.strokeStyle = "#ddd";
    }

    for (let i = 0; i <= 5; i++) {
        const y = yMin + (yMax - yMin) * (i / 5);
        const py = scaleY(y);

        ctx.beginPath();
        ctx.moveTo(padding, py);
        ctx.lineTo(padding - 5, py);
        ctx.stroke();

        ctx.textAlign = "right";
        ctx.fillText(y.toFixed(1), padding - 10, py + 5);

        ctx.strokeStyle = "#f0f0f0";
        ctx.beginPath();
        ctx.moveTo(padding, py);
        ctx.lineTo(canvas.width - padding, py);
        ctx.stroke();
        ctx.strokeStyle = "#ddd";
    }

    if (isFinite(m) && isFinite(b)) {
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 2;
        ctx.beginPath();
        const y1 = m * xMin + b;
        const y2 = m * xMax + b;
        
        if (isFinite(y1) && isFinite(y2)) {
            ctx.moveTo(scaleX(xMin), scaleY(y1));
            ctx.lineTo(scaleX(xMax), scaleY(y2));
            ctx.stroke();
        }
    }

    ctx.fillStyle = "#4f46e5";
    xValues.forEach((x, i) => {
        const y = yValues[i];
        const px = scaleX(x);
        const py = scaleY(y);

        ctx.beginPath();
        ctx.arc(px, py, 5, 0, 2 * Math.PI);
        ctx.fill();

        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.strokeStyle = "#3b82f6";
    });
}
