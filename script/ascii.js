// Author: Andrei Gheorghe (http://github.com/idevelop)

var ascii = (function() {
	var CHARSETS = {
		classic: "@%#*+=-:. ",
		blocks: "█▓▒░ ",
		matrix: "10 ",
		dense: "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvu",
		edge: " .:-=+*#%@"
	};

	var EMOJIS = ["🌑", "🌘", "🌗", "🌕", "✨", "⭐", "🔥", "💧", "🍀", "🟦", "🟩", "🟨", "🟥"];

	function asciiFromCanvas(canvas, options) {
		// Original code by Jacob Seidelin (http://www.nihilogic.dk/labs/jsascii/)
		// Modernized for style switching, color output and optional effects.

		var context = canvas.getContext("2d");
		var width = canvas.width;
		var height = canvas.height;
		var imageData = context.getImageData(0, 0, width, height);
		var data = imageData.data;
		var sampledBrightness = new Float32Array(width * height);

		var contrastFactor = (259 * (options.contrast + 255)) / (255 * (259 - options.contrast));
		for (var i = 0, p = 0; i < data.length; i += 4, p++) {
			var contrastedRed = bound(Math.floor((data[i] - 128) * contrastFactor) + 128, [0, 255]);
			var contrastedGreen = bound(Math.floor((data[i + 1] - 128) * contrastFactor) + 128, [0, 255]);
			var contrastedBlue = bound(Math.floor((data[i + 2] - 128) * contrastFactor) + 128, [0, 255]);
			sampledBrightness[p] = (0.299 * contrastedRed + 0.587 * contrastedGreen + 0.114 * contrastedBlue) / 255;
		}

		var charSetName = options.characterSet || "classic";
		var chars = (CHARSETS[charSetName] || CHARSETS.classic).split("");
		var cellSize = options.cellSize || 2;
		var rowStep = Math.max(2, cellSize * 2);
		var colorMode = !!options.colorMode;
		var funMode = options.funMode || "none";

		var textRows = [];
		var htmlRows = [];

		for (var y = 0; y < height; y += rowStep) {
			var textLine = [];
			var htmlLine = [];

			for (var x = 0; x < width; x += cellSize) {
				var offset = (y * width + x) * 4;
				var brightness = sampledBrightness[y * width + x];

				if (funMode === "edge") {
					brightness = sobelAt(sampledBrightness, width, height, x, y);
					chars = CHARSETS.edge.split("");
				}

				var character = mapValueToCharacter(brightness, chars);

				if (funMode === "emoji") {
					character = mapValueToCharacter(brightness, EMOJIS);
				} else if (funMode === "glitch" && Math.random() < 0.06) {
					character = chars[Math.floor(Math.random() * chars.length)];
				}

				textLine.push(character);

				if (colorMode) {
					var color = getColorAtOffset(data, offset);
					var glyph = character === " " ? "&nbsp;" : character;
					htmlLine.push("<span style=\"color:rgb(" + color.red + "," + color.green + "," + color.blue + ")\">" + glyph + "</span>");
				}
			}

			textRows.push(textLine.join(""));
			if (colorMode) {
				htmlRows.push(htmlLine.join(""));
			}
		}

		options.callback({
			text: textRows.join("\n"),
			html: colorMode ? htmlRows.join("<br>") : null
		});
	}

	function getColorAtOffset(data, offset) {
		return {
			red: data[offset],
			green: data[offset + 1],
			blue: data[offset + 2],
			alpha: data[offset + 3]
		};
	}

	function bound(value, interval) {
		return Math.max(interval[0], Math.min(interval[1], value));
	}

	function mapValueToCharacter(brightness, characters) {
		var index = (characters.length - 1) - Math.round(brightness * (characters.length - 1));
		index = bound(index, [0, characters.length - 1]);
		return characters[index];
	}

	function sobelAt(brightnessData, width, height, x, y) {
		function b(px, py) {
			var cx = bound(px, [0, width - 1]);
			var cy = bound(py, [0, height - 1]);
			return brightnessData[cy * width + cx];
		}

		var gx =
			-b(x - 1, y - 1) + b(x + 1, y - 1) +
			-2 * b(x - 1, y) + 2 * b(x + 1, y) +
			-b(x - 1, y + 1) + b(x + 1, y + 1);

		var gy =
			-b(x - 1, y - 1) - 2 * b(x, y - 1) - b(x + 1, y - 1) +
			b(x - 1, y + 1) + 2 * b(x, y + 1) + b(x + 1, y + 1);

		var magnitude = Math.sqrt(gx * gx + gy * gy);
		return bound(magnitude, [0, 1]);
	}

	function doNothing() {}

	return {
		fromCanvas: function(canvas, options) {
			options = options || {};
			options.contrast = (typeof options.contrast === "undefined" ? 128 : options.contrast);
			options.callback = options.callback || doNothing;

			return asciiFromCanvas(canvas, options);
		},

		charsets: CHARSETS
	};
})();
