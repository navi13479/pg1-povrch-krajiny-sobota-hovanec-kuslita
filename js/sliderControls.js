
function updateMovementSpeed(speedInput) {
    document.getElementById("speedOut").innerHTML = speedInput.value;
}

function updateManualMove(newVal) {
    document.getElementById("manualMoveOut").innerHTML = newVal.value;
}

function updateWaterLevel(waterLevel) {
    document.getElementById("waterOut").innerHTML = waterLevel.value;
}

function updateHeights(scale) {
    document.getElementById("heightsOut").innerHTML = scale.value;
}

function changeFontSize(event) {
    const htmlMain = document.getElementById('main');
    const currentSize = parseFloat(window.getComputedStyle(htmlMain).fontSize);

    // Check if the pressed key is 'Z' or 'X'
    if (event.key === 'z') {
        // Decrease font size by 2 pixels
        htmlMain.style.fontSize = `${Math.max(currentSize - 2, 8)}px`;
    } else if (event.key === 'x') {
        // Increase font size by 2 pixels
        htmlMain.style.fontSize = `${currentSize + 2}px`;
    }
}

// Event listener for keypress
document.addEventListener('keydown', changeFontSize);
