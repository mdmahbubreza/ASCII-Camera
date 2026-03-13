ASCII Camera
============

ASCII Camera uses the HTML5 getUserMedia API to transform a video stream from your webcam into a real-time ASCII representation.

## Live demo

* https://ascii-camera-one.vercel.app

## Maintainer links

* GitHub: https://github.com/mdmahbubreza
* Sponsor: https://github.com/sponsors/mdmahbubreza

## New interactive features

The app now includes lightweight interactive controls for:

* ASCII style switcher (`Classic`, `Blocks`, `Matrix`, `Dense`)
* Color ASCII mode (renders each glyph with source pixel color)
* Resolution slider (`Low`, `Medium`, `High`)
* Matrix overlay mode (green falling characters)
* Frame export actions:
	* Capture current ASCII frame as PNG
	* Copy ASCII text to clipboard
	* Download ASCII text as `.txt`
* Optional fun modes:
	* `Glitch`
	* `Edge Detect` (Sobel-based)
	* `Emoji`

## Keyboard shortcuts

* `A` → cycle ASCII charset
* `C` → toggle color mode
* `M` → toggle Matrix mode
* `S` → capture PNG snapshot
* `+` / `-` → increase / decrease resolution
* `H` → show/hide on-screen shortcut legend

## HUD overlays

* A lightweight monospace HUD is rendered in the stage corner.
* `FPS: N` updates once per second using `requestAnimationFrame` timing.
* The shortcut legend uses a semi-transparent terminal-style panel to avoid blocking the ASCII output.

## Repository

* Project homepage: https://github.com/mdmahbubreza
* Sponsor page: https://github.com/sponsors/mdmahbubreza

<img src="https://andrei.codes/images/ascii-screenshot.png" />

## Supported browsers

* Modern Chrome, Firefox, Edge, and Safari with `getUserMedia` support

## Libraries used

* Camera input is done using the [camera.js library](https://github.com/idevelop/camera.js).
* ASCII transformation is adapted from [jsascii library](http://www.nihilogic.dk/labs/jsascii/) by [Jacob Seidelin](http://blog.nihilogic.dk/).

## Credits

Originally created by **Andrei Gheorghe** and adapted in this fork.

## License

- This code is licensed under the MIT License.
