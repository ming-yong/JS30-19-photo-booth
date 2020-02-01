# JS30-19-photo-booth

![image: demonstration of photo booth](https://github.com/ming-yong/JS30-19-photo-booth/blob/master/photoBooth.gif)

Photo booth using web cam with different filters and downloadable photo. Built with vanilla JS and based on [JavaScript 30 by WesBos](https://github.com/wesbos/JavaScript30).

## Running this project

### Live version
[https://ming-yong.github.io/JS30-19-photo-booth/](https://ming-yong.github.io/JS30-19-photo-booth/)

## User stories

- **User story #1:** I can select desired filter.
- **User story #2:** I can take photo by clicking the "take photo" button.
- **User story #3:** I can download the photo by clicking the image.

## Notes

### Connect the web cam with browser

In HTML, we have a `video`, `canvas`, `div` for photo and `audio` tag.

Before we connect the web cam and the browser, we will need to set up a server. Make sure you grab the `package.json` file and have Node.js installed, then run `npm install` and `npm start` in your terminal(Git Bash in my case) to start the server.

```js
const video = document.querySelector(".video_player");
const canvas = document.querySelector(".canvas_photo");
const ctx = canvas.getContext("2d");
const strip = document.querySelector(".div_photo");
const snap = document.querySelector(".audio_snap");

function getVideo() {
 navigator.mediaDevices
  .getUserMedia({ video: true, audio: false })
  .then(localMediaStream => {
   video.srcObject = localMediaStream;
   video.play();
  })
  .catch(error => console.error(error));
}

getVideo();
```

### Take a photo

The idea is to paint what we have on the webcam to the canvas every X ms(16 ms in this case) and create image from the canvas.

```js
function paintCanvas() {
 const width = video.videoWidth;
 const height = video.videoHeight;
 //setting canvas height and width as the same with video cam
 canvas.width = width;
 canvas.height = height;
 return setInterval(() => {
  ctx.drawImage(video, 0, 0, width, height); //image/video|start at 0,0|paint the width and the height
 }, 16);
}

function takePhoto() {
 //play the sound
 snap.currentTime = 0;
 snap.play();
 //take photo
 const data = canvas.toDataURL("image/jpeg"); //create an URL
 const link = document.createElement("a"); //create a link for download
 link.href = data;
 link.setAttribute("download", "yourPhoto");
 link.innerHTML = `<img src="${data}" alt="your photo"/>`; //create and image
 strip.insertBefore(link, strip.firstChild); //insert downloadable image into the div for image
}

video.addEventListener("canplay", paintCanvas); //once the video play
```

### Add a filter

All you need to make a filter is to change the property(rgba) of the pixels. Here we will add our code for that right after `ctx.drawImage()` in `paintCanvas`. I used boolean value as a flag to toggle each filter.

```js
//filter boolean
let ghost = false;
let split = false;
let greenScreen = false;

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

document.querySelector(".filter_ghost").addEventListener("click", () => (ghost = !ghost));
document.querySelector(".filter_split").addEventListener("click", () => (split = !split));
document.querySelector(".filter_greenScreenEffect").addEventListener("click", () => (greenScreen = !greenScreen));
```
