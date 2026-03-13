/*
	camera.js v1.1
	http://github.com/idevelop/camera.js

	Author: Andrei Gheorghe (http://idevelop.github.com)
	License: MIT
*/

var camera = (function() {
	var options;
	var video, canvas, context;
	var animationFrameId;
	var lastFrameTime = 0;
	var fpsWindowStart = 0;
	var processedFrames = 0;
	var running = false;
	var streamRef;

	function initVideoStream() {
		video = document.createElement("video");
		video.setAttribute('width', options.width);
		video.setAttribute('height', options.height);
		video.setAttribute('playsinline', 'true');
		video.setAttribute('webkit-playsinline', 'true');

		if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
			navigator.mediaDevices.getUserMedia({
				video: true,
				audio: false,
			}).then(function(stream) {
				streamRef = stream;
				options.onSuccess();
				video.srcObject = stream;
				initCanvas();
			}).catch(options.onError);
			return;
		}

		navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
		if (navigator.getUserMedia) {
			navigator.getUserMedia({
				video: true,
				audio: false,
			}, function(stream) {
				streamRef = stream;
				options.onSuccess();

				if (video.mozSrcObject !== undefined) {
					video.mozSrcObject = stream;
				} else {
					video.srcObject = stream;
				}

				initCanvas();
			}, options.onError);
		} else {
			options.onNotSupported();
		}
	}

	function initCanvas() {
		canvas = options.targetCanvas || document.createElement("canvas");
		canvas.setAttribute('width', options.width);
		canvas.setAttribute('height', options.height);

		context = canvas.getContext('2d');

		// mirror video
		if (options.mirror) {
			context.translate(canvas.width, 0);
			context.scale(-1, 1);
		}
	}

	function startCapture() {
		if (running) return;

		video.play();
		running = true;
		lastFrameTime = 0;
		fpsWindowStart = 0;
		processedFrames = 0;

		function renderFrame(timestamp) {
			if (!running) return;

			if (!fpsWindowStart) {
				fpsWindowStart = timestamp;
			}

			var minFrameMs = Math.round(1000 / options.fps);
			if (!lastFrameTime || timestamp - lastFrameTime >= minFrameMs) {
				lastFrameTime = timestamp;
				processedFrames += 1;

				try {
					context.drawImage(video, 0, 0, video.width, video.height);
					options.onFrame(canvas);
				} catch (e) {
					// drawing may fail while camera stream initializes
				}
			}

			if (timestamp - fpsWindowStart >= 1000) {
				var elapsed = timestamp - fpsWindowStart;
				var currentFps = Math.round((processedFrames * 1000) / elapsed);
				options.onFpsUpdate(currentFps);
				fpsWindowStart = timestamp;
				processedFrames = 0;
			}

			animationFrameId = requestAnimationFrame(renderFrame);
		}

		animationFrameId = requestAnimationFrame(renderFrame);
	}

	function stopCapture() {
		pauseCapture();

		if (streamRef && streamRef.getTracks) {
			streamRef.getTracks().forEach(function(track) {
				track.stop();
			});
			streamRef = null;
		}

		if (video.mozSrcObject !== undefined) {
			video.mozSrcObject = null;
		} else {
			video.srcObject = null;
		}
	}

	function pauseCapture() {
		running = false;
		if (animationFrameId) {
			cancelAnimationFrame(animationFrameId);
			animationFrameId = null;
		}
		video.pause();
	}

	return {
		init: function(captureOptions) {
			var doNothing = function(){};

			options = captureOptions || {};

			options.fps = options.fps || 30;
			options.width = options.width || 640;
			options.height = options.height || 480;
			options.mirror = options.mirror || false;
			options.targetCanvas = options.targetCanvas || null; // TODO: is the element actually a <canvas> ?

			options.onSuccess = options.onSuccess || doNothing;
			options.onError = options.onError || doNothing;
			options.onNotSupported = options.onNotSupported || doNothing;
			options.onFrame = options.onFrame || doNothing;
			options.onFpsUpdate = options.onFpsUpdate || doNothing;

			initVideoStream();
		},

		start: startCapture,

		pause: pauseCapture,

		stop: stopCapture
	};
})();
