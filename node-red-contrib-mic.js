module.exports = function(RED) {

	var Mic = require('mic');
	var micInstanceGlobal = null;

	//define state recording and set it to node
	const nodeStatusRecording = {fill : "red", shape : "ring", text : "recording"};
	const nodeStatusPaused = {fill : "red", shape : "dot", text : "paused"};
	const nodeStatusSilence = {fill : "green", shape : "dot", text : "silence.."};

	function initMic(node) {
		var micInstance = new Mic({
			'rate' : node.config.rate,
			'channels' : node.config.channels,
			'device' : node.config.device,
			'debug' : (node.config.debug == "true"),
			'exitOnSilence' : node.config.silenceTimeout,
			'fileType' : node.config.fileType
		});
		var micAudioStream = micInstance.getAudioStream();

		if (node.msg == undefined)
			node.msg = {};

		if (node.config.outputPayloadType == "buffer") {
			micAudioStream.on('data', function(data) {
				node.msg.payload = data;
				node.msg.event = "data";
				node.send(node.msg);
			});
		}

		micAudioStream.on('error', function(err) {
			node.log("Error in stream: " + err);
		});

		micAudioStream.on('startComplete', function() {
			node.log("Stream event startComplete");
			node.status(nodeStatusRecording);

			if (node.config.outputPayloadType == "stream") {
				node.msg.payload = micAudioStream;
				node.send(node.msg);
			}
		});

		micAudioStream.on('stopComplete', function() {
			node.log("Stream event stopComplete");
			node.status({});

			if (node.config.outputPayloadType == "stream") {
				micAudioStream.unpipe();
			} else {
				node.msg.payload = Buffer.alloc(0);
				node.msg.event = "end";
				node.send(node.msg);
			}
		});

		micAudioStream.on('pauseComplete', function() {
			node.log("Stream event pauseComplete");
			node.status(nodeStatusPaused);
		});

		micAudioStream.on('resumeComplete', function() {
			node.log("Stream event resumeComplete");
			node.status(nodeStatusRecording);
		});

		micAudioStream.on('silence', function() {
			node.log("Stream event silence");
			node.status(nodeStatusSilence);

			if (node.config.exitOnSilence == "true")
				node.stopRecord();
		});

		return micInstance;
	}

	/*******/
	// Mic //
	/*******/
	function Mic_Node(config) {
		RED.nodes.createNode(this, config);
		var node = this;
		node.config = config;

		node.on('input', function(msg) {
			node.log("Event input: " + msg.payload);
			node.msg = msg;

			switch (msg.payload) {
			case "pause":
				node.pauseRecord();
				break;
			case "resume":
				node.resumeRecord();
				break;
			case "stop":
				node.stopRecord();
				break;
			case "start":
			default:
				node.startRecord();
				break;
			}
		});

		node.on('close', function() {
			node.log("Event close");
			node.stopRecord();
		});

		node.startRecord = function() {
			if (micInstanceGlobal != null) {
				micInstanceGlobal.getAudioStream().on('audioProcessExitComplete', function() {
					node.log("Stream event processExitComplete");
					micInstanceGlobal = initMic(node);
					micInstanceGlobal.start();
				});

				micInstanceGlobal.stop();
			} else {
				micInstanceGlobal = initMic(node);
				micInstanceGlobal.start();
			}
		}

		node.stopRecord = function() {
			if (micInstanceGlobal != null) {
				micInstanceGlobal.stop();
				micInstanceGlobal = null;
			}
		}

		node.pauseRecord = function() {
			if (micInstanceGlobal != null) {
				micInstanceGlobal.pause();
			}
		}

		node.resumeRecord = function() {
			if (micInstanceGlobal != null) {
				micInstanceGlobal.resume();
			}
		}
	}

	RED.nodes.registerType("Mic", Mic_Node);

	RED.httpAdmin.post("/Mic/:id/:state", RED.auth.needsPermission("debug.write"), function(req, res) {
		var node = RED.nodes.getNode(req.params.id);
		var state = req.params.state;
		if (node !== null && typeof node !== "undefined") {
			if (state === "enable") {
				this.active = true;
				node.startRecord();
				res.sendStatus(200);
			} else if (state === "disable") {
				node.stopRecord();
				this.active = false;
				res.sendStatus(201);
			} else {
				res.sendStatus(404);
			}
		} else {
			res.sendStatus(404);
		}
	});
}