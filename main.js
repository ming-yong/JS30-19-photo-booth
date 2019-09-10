const video = document.querySelector(".video_player");
const canvas = document.querySelector(".canvas_photo");
const ctx = canvas.getContext("2d");
const strip = document.querySelector(".div_photo");
const snap = document.querySelector(".audio_snap");
//filter boolean
let ghost = false;
let split = false;
let greenScreen = false;

function getVideo() {
	navigator.mediaDevices
		.getUserMedia({ video: true, audio: false })
		.then(localMediaStream => {
			video.srcObject = localMediaStream;
			video.play();
		})
		.catch(error => console.error(error));
}

function paintCanvas() {
	const width = video.videoWidth;
	const height = video.videoHeight;
	canvas.width = width;
	canvas.height = height;
	return setInterval(() => {
		ctx.drawImage(video, 0, 0, width, height); //image/video|start at 0,0|paint the width and the height

		//take the pixels out
		let pixels = ctx.getImageData(0, 0, width, height);
		//mess with them
		if (ghost) {
			ctx.globalAlpha = 0.1;
		} else {
			ctx.globalAlpha = 1;
		}

		if (split) {
			pixels = rgbSplitFilter(pixels);
		} else if (greenScreen) {
			pixels = greenScreenEffect(pixels);
		}

		//put them back
		ctx.putImageData(pixels, 0, 0);
	}, 16);
}

function takePhoto() {
	//sound
	snap.currentTime = 0;
	snap.play();
	//take photo
	const data = canvas.toDataURL("image/jpeg");
	const link = document.createElement("a");
	link.href = data;
	link.setAttribute("download", "yourPhoto");
	link.innerHTML = `<img src="${data}" alt="your photo"/>`;
	strip.insertBefore(link, strip.firstChild);
}

function greenScreenEffect(pixels) {
	for (i = 0; i < pixels.data.length; i = i + 4) {
		red = pixels.data[i + 0];
		green = pixels.data[i + 1];
		blue = pixels.data[i + 2];
		alpha = pixels.data[i + 3];

		if (red >= 25 && green >= 25 && blue >= 25 && red <= 150 && green <= 150 && blue <= 150) {
			// take it out!
			pixels.data[i + 3] = 0;
		}
	}

	return pixels;
}

function rgbSplitFilter(pixels) {
	for (let i = 0; i < pixels.data.length; i += 4) {
		pixels.data[i - 150] = pixels.data[i + 0]; // RED
		pixels.data[i + 500] = pixels.data[i + 1]; // GREEN
		pixels.data[i - 550] = pixels.data[i + 2]; // Blue
	}
	return pixels;
}

//other filter
// function redEffect(pixels) {
// 	for (let i = 0; i < pixels.data.length; i += 4) {
// 		pixels.data[i + 0] = pixels.data[i + 0] + 100; //red
// 		pixels.data[i + 1] = pixels.data[i + 1] - 50; //green
// 		pixels.data[i + 2] = pixels.data[i + 2] * 0.5; //blue
// 	}
// 	return pixels;
// }

// function greenScreen(pixels) {
// 	const levels = {};

// 	document.querySelectorAll(".div_rgb input").forEach(input => {
// 		levels[input.name] = input.value;
// 	});

// 	for (i = 0; i < pixels.data.length; i = i + 4) {
// 		red = pixels.data[i + 0];
// 		green = pixels.data[i + 1];
// 		blue = pixels.data[i + 2];
// 		alpha = pixels.data[i + 3];

// 		if (red >= levels.rmin && green >= levels.gmin && blue >= levels.bmin && red <= levels.rmax && green <= levels.gmax && blue <= levels.bmax) {
// 			// take it out!
// 			pixels.data[i + 3] = 0;
// 		}
// 	}

// 	return pixels;
// }

getVideo();
video.addEventListener("canplay", paintCanvas); //once the video play
document.querySelector(".filter_ghost").addEventListener("click", () => (ghost = !ghost));
document.querySelector(".filter_split").addEventListener("click", () => (split = !split));
document.querySelector(".filter_greenScreenEffect").addEventListener("click", () => (greenScreen = !greenScreen));
