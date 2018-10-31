# node-red-contrib-mic

Node-RED node for microphone (based on nodejs mic : a simple stream wrapper for arecord (Linux (including Raspbian)) and sox (Mac/Windows)).

## Install
Run the following npm command in your Node-RED environment.
```
npm install node-red-contrib-mic
```

## Usage
This package add 1 input node (Mic) to Node-RED.

The Mic node expect the following payload :
* `start` (or empty): Start recording
* `stop`: Stop recording
* `pause` Pause recording
* `resume`: Resume recording

Because it is not possible to access the microphone several times at the same time, whenever a node (no matter which one) receives the `start` payload, it stops the previous recording and starts a new one.


The Mic node comprises the following options:

* **Output payload type**: Type of the payload output
    * `Stream`: On start recording, emit one message with a Readable stream as the payload
    * `Buffer`: When recording, emit multiple messages with a Buffer as the payload
* **Endian**: `little` or `big`, default: `little`
* **Bitwidth**: `8` or `16` or `24` or anything valid supported by arecord or sox, default: `16`
* **Encoding**: `signed-integer` or `unsinged-integer`, default:`signed-integer`
* **Channels**: `1` or `2` or anything valid supported by arecord or sox, default: `1` (mono)
* **Device**: `hw:0,0` or `plughw:1,0` or anything valid supported by arecord, default: `plughw:1,0`
* **Rate**: `8000` or `16000` or `44100` or anything valid supported by arecord or sox, default: `16000`
* **Silence timeout**: The 'silence' signal is raised after reaching these many consecutive frames, default: `0`
* **Stop record on silence**: `true` or `false` (useless with Silence timeout set to 0), default: `false`
* **Debug**: `true` or `false` - can be used to help in debugging
* **File type**: string defaults to `raw`, allows you to set a valid file type such as `mp3` or `wav` (for sox only).


## License
The MIT License (MIT)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
