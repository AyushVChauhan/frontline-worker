const tf = require("@tensorflow/tfjs-node");
tf.enableProdMode();
const faceapi = require("@vladmandic/face-api");
const { Canvas, Image } = require("canvas");
faceapi.env.monkeyPatch({ Canvas, Image });
Promise.all([
	faceapi.nets.ssdMobilenetv1.loadFromDisk("face-models"),
	faceapi.nets.faceRecognitionNet.loadFromDisk("face-models"),
	faceapi.nets.faceLandmark68Net.loadFromDisk("face-models"),
]).then(() => {});
module.exports = faceapi;
