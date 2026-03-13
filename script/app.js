/*
 * ASCII Camera
 * http://idevelop.github.com/ascii-camera/
 *
 * Copyright 2013, Andrei Gheorghe (http://github.com/idevelop)
 * Released under the MIT license
 */

(function() {
	var asciiContainer = document.getElementById("ascii");
	var matrixOverlay = document.getElementById("matrixOverlay");
	var charsetSelect = document.getElementById("charsetSelect");
	var funModeSelect = document.getElementById("funModeSelect");
	var resolutionRange = document.getElementById("resolutionRange");
	var resolutionLabel = document.getElementById("resolutionLabel");
	var toggleColorButton = document.getElementById("toggleColor");
	var toggleMatrixButton = document.getElementById("toggleMatrix");
	var captureFrameButton = document.getElementById("captureFrame");
	var copyAsciiButton = document.getElementById("copyAscii");
	var downloadAsciiButton = document.getElementById("downloadAscii");
	var playPauseButton = document.getElementById("button");
	var hudContainer = document.getElementById("hud");
	var hudToggleButton = document.getElementById("hudToggle");
	var hudContent = document.getElementById("hudContent");
	var fpsIndicator = document.getElementById("fpsIndicator");
	var shortcutLegend = document.getElementById("shortcutLegend");

	var capturing = false;
	var latestAsciiText = "";
	var latestAsciiHtml = "";
	var matrixDrops = [];
	var latestFpsText = "FPS: --";

	var FEATURES = {
		hud: true,
		fpsIndicator: true,
		shortcutLegend: true
	};

	var RESOLUTION = {
		1: { label: "Low", cellSize: 4 },
		2: { label: "Medium", cellSize: 2 },
		3: { label: "High", cellSize: 1 }
	};

	var state = {
		characterSet: "classic",
		funMode: "none",
		colorMode: false,
		matrixMode: false,
		resolution: 3,
		legendVisible: window.matchMedia && window.matchMedia("(max-width: 768px)").matches ? false : true
	};

	function getCellSize() {
		return RESOLUTION[state.resolution].cellSize;
	}

	function updateResolutionUi() {
		resolutionLabel.textContent = RESOLUTION[state.resolution].label;
	}

	function updateModeButtons() {
		toggleColorButton.textContent = "Color: " + (state.colorMode ? "On" : "Off");
		toggleMatrixButton.textContent = "Matrix: " + (state.matrixMode ? "On" : "Off");
		matrixOverlay.style.opacity = state.matrixMode ? "0.55" : "0";
	}

	function updateHudVisibility() {
		if (!FEATURES.hud || !hudContainer) {
			if (hudContainer) hudContainer.style.display = "none";
			return;
		}

		hudContainer.style.display = "flex";
		hudContainer.classList.toggle("collapsed", !state.legendVisible);
		hudContainer.classList.toggle("expanded", state.legendVisible);

		if (hudToggleButton) {
			hudToggleButton.textContent = state.legendVisible ? "Hide" : "Help";
		}

		if (fpsIndicator) {
			fpsIndicator.style.display = FEATURES.fpsIndicator ? "block" : "none";
			fpsIndicator.textContent = latestFpsText;
		}

		if (shortcutLegend) {
			var legendEnabled = FEATURES.shortcutLegend && state.legendVisible;
			shortcutLegend.classList.toggle("hidden", !legendEnabled);
		}

		if (hudContent) {
			hudContent.style.display = state.legendVisible ? "block" : "none";
		}
	}

	function toggleLegendVisibility() {
		state.legendVisible = !state.legendVisible;
		updateHudVisibility();
	}

	function updateFpsIndicator(fps) {
		if (!FEATURES.hud || !FEATURES.fpsIndicator || !fpsIndicator) {
			return;
		}

		var nextText = "FPS: " + fps;
		if (nextText !== latestFpsText) {
			latestFpsText = nextText;
			fpsIndicator.textContent = nextText;
		}
	}

	function toggleColorMode() {
		state.colorMode = !state.colorMode;
		latestAsciiHtml = "";
		updateModeButtons();
	}

	function toggleMatrixMode() {
		state.matrixMode = !state.matrixMode;
		if (!state.matrixMode) {
			matrixOverlay.textContent = "";
		}
		updateModeButtons();
	}

	function cycleCharset() {
		var optionCount = charsetSelect.options.length;
		var nextIndex = (charsetSelect.selectedIndex + 1) % optionCount;
		charsetSelect.selectedIndex = nextIndex;
		state.characterSet = charsetSelect.value;
	}

	function adjustResolution(direction) {
		var next = state.resolution + direction;
		state.resolution = Math.max(1, Math.min(3, next));
		resolutionRange.value = String(state.resolution);
		updateResolutionUi();
	}

	function renderMatrixOverlay(asciiText) {
		if (!state.matrixMode) {
			return;
		}

		var lines = asciiText.split("\n");
		var rows = lines.length;
		var cols = lines[0] ? lines[0].length : 0;
		if (!rows || !cols) return;

		if (matrixDrops.length !== cols) {
			matrixDrops = [];
			for (var i = 0; i < cols; i++) {
				matrixDrops.push(Math.floor(Math.random() * rows));
			}
		}

		var matrixChars = "01$#@*+-";
		var output = [];
		for (var r = 0; r < rows; r++) {
			output[r] = new Array(cols + 1).join(" ").split("");
		}

		for (var c = 0; c < cols; c++) {
			if (Math.random() > 0.985) {
				matrixDrops[c] = 0;
			}

			var head = matrixDrops[c];
			for (var trail = 0; trail < 6; trail++) {
				var row = head - trail;
				if (row >= 0 && row < rows) {
					output[row][c] = matrixChars.charAt(Math.floor(Math.random() * matrixChars.length));
				}
			}

			matrixDrops[c] = head + 1;
			if (matrixDrops[c] > rows + 6) {
				matrixDrops[c] = Math.floor(Math.random() * rows * 0.3);
			}
		}

		matrixOverlay.textContent = output.map(function(line) {
			return line.join("");
		}).join("\n");
	}

	function renderAscii(result) {
		latestAsciiText = result.text;

		if (state.colorMode) {
			if (result.html !== latestAsciiHtml) {
				latestAsciiHtml = result.html;
				asciiContainer.innerHTML = result.html;
			}
		} else if (result.text !== asciiContainer.textContent) {
			asciiContainer.textContent = result.text;
		}

		renderMatrixOverlay(result.text);
	}

	function downloadData(filename, mimeType, content) {
		var blob = new Blob([content], { type: mimeType });
		var url = URL.createObjectURL(blob);
		var anchor = document.createElement("a");
		anchor.href = url;
		anchor.download = filename;
		document.body.appendChild(anchor);
		anchor.click();
		anchor.remove();
		URL.revokeObjectURL(url);
	}

	function captureAsciiImage() {
		if (!latestAsciiText) return;

		var lines = latestAsciiText.split("\n");
		var maxWidth = lines.reduce(function(max, line) {
			return Math.max(max, line.length);
		}, 0);

		var fontSize = 12;
		var lineHeight = 12;
		var margin = 12;
		var canvas = document.createElement("canvas");
		canvas.width = Math.max(1, maxWidth * 8 + margin * 2);
		canvas.height = Math.max(1, lines.length * lineHeight + margin * 2);

		var ctx = canvas.getContext("2d");
		ctx.fillStyle = "#090b12";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.font = fontSize + "px Courier New";
		ctx.textBaseline = "top";
		ctx.fillStyle = "#f4f7ff";

		for (var i = 0; i < lines.length; i++) {
			ctx.fillText(lines[i], margin, margin + i * lineHeight);
		}

		var link = document.createElement("a");
		link.href = canvas.toDataURL("image/png");
		link.download = "ascii-camera-frame.png";
		document.body.appendChild(link);
		link.click();
		link.remove();
	}

	function copyAsciiToClipboard() {
		if (!latestAsciiText) return;

		if (navigator.clipboard && navigator.clipboard.writeText) {
			navigator.clipboard.writeText(latestAsciiText);
			return;
		}

		var textarea = document.createElement("textarea");
		textarea.value = latestAsciiText;
		document.body.appendChild(textarea);
		textarea.select();
		document.execCommand("copy");
		textarea.remove();
	}

	function downloadAsciiText() {
		if (!latestAsciiText) return;
		downloadData("ascii-camera-frame.txt", "text/plain;charset=utf-8", latestAsciiText);
	}

	function bindControls() {
		charsetSelect.addEventListener("change", function() {
			state.characterSet = charsetSelect.value;
		});

		funModeSelect.addEventListener("change", function() {
			state.funMode = funModeSelect.value;
		});

		resolutionRange.addEventListener("input", function() {
			state.resolution = Number(resolutionRange.value);
			updateResolutionUi();
		});

		toggleColorButton.addEventListener("click", toggleColorMode);
		toggleMatrixButton.addEventListener("click", toggleMatrixMode);
		captureFrameButton.addEventListener("click", captureAsciiImage);
		copyAsciiButton.addEventListener("click", copyAsciiToClipboard);
		downloadAsciiButton.addEventListener("click", downloadAsciiText);
		if (hudToggleButton) {
			hudToggleButton.addEventListener("click", toggleLegendVisibility);
		}

		document.addEventListener("keydown", function(event) {
			var targetTag = event.target && event.target.tagName;
			if (targetTag === "INPUT" || targetTag === "SELECT" || targetTag === "TEXTAREA") {
				return;
			}

			var key = event.key;
			if (key === "a" || key === "A") {
				event.preventDefault();
				cycleCharset();
			} else if (key === "c" || key === "C") {
				event.preventDefault();
				toggleColorMode();
			} else if (key === "m" || key === "M") {
				event.preventDefault();
				toggleMatrixMode();
			} else if (key === "s" || key === "S") {
				event.preventDefault();
				captureAsciiImage();
			} else if (key === "+" || key === "=") {
				event.preventDefault();
				adjustResolution(1);
			} else if (key === "-" || key === "_") {
				event.preventDefault();
				adjustResolution(-1);
			} else if (key === "h" || key === "H") {
				event.preventDefault();
				toggleLegendVisibility();
			}
		});
	}

	function toggleCapture() {
		if (capturing) {
			camera.pause();
			playPauseButton.innerText = "Resume";
		} else {
			camera.start();
			playPauseButton.innerText = "Pause";
		}

		capturing = !capturing;
	}

	bindControls();
	updateResolutionUi();
	updateModeButtons();
	updateHudVisibility();
	playPauseButton.disabled = true;

	camera.init({
		width: 240,
		height: 180,
		fps: 30,
		mirror: true,

		onFrame: function(canvas) {
			ascii.fromCanvas(canvas, {
				contrast: 128,
				characterSet: state.characterSet,
				cellSize: getCellSize(),
				colorMode: state.colorMode,
				funMode: state.funMode,
				callback: renderAscii
			});
		},

		onFpsUpdate: updateFpsIndicator,

		onSuccess: function() {
			document.getElementById("info").style.display = "none";
			playPauseButton.disabled = false;
			playPauseButton.onclick = toggleCapture;
			if (!capturing) {
				camera.start();
				capturing = true;
				playPauseButton.innerText = "Pause";
			}
		},

		onError: function(error) {
			document.getElementById("info").textContent = "Unable to access your camera. Please check browser permissions.";
		},

		onNotSupported: function() {
			document.getElementById("info").style.display = "none";
			asciiContainer.style.display = "none";
			document.getElementById("controls").style.display = "none";
			if (hudContainer) {
				hudContainer.style.display = "none";
			}
			document.getElementById("notSupported").style.display = "block";
		}
	});
})();
