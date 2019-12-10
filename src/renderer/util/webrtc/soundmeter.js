'use strict';

import { Promise, resolve, reject } from 'bluebird-lst';

let support = require('./rtcSupport').default;

class SoundMeter{
    constructor() {
      if(support.supportWebAudio){
        this.AudioContext = window.AudioContext || window.webkitAudioContext;
        this.context = new AudioContext();
      }
      this.instant = 0.0;
      this.slow = 0.0;
      this.clip = 0.0;
      this.script = this.context.createScriptProcessor(1024,1,1);

      const that = this;
      this.script.onaudioprocess = function (event) {
          const input = event.inputBuffer.getChannelData(0);
          let i;
          let sum = 0.0;
          let clipcount = 0;
          for (i = 0; i < input.length; ++i) {
              sum += input[i] * input[i];
              if (Math.abs(input[i]) > 0.99) {
                  clipcount += 1;
              }
          }
          that.instant = Math.sqrt(sum / input.length);
          that.slow = 0.95 * that.slow + 0.05 * that.instant;
          that.clip = clipcount / input.length;
      }
    }
    connectToSource (stream, callback) {
        console.log('SoundMeter connecting');
        try {
            this.mic = this.context.createMediaStreamSource(stream);
            this.mic.connect(this.script);
            // necessary to make sample run, but should not be.
            this.script.connect(this.context.destination);
            if (typeof callback !== 'undefined') {
                callback(null);
            }
        } catch (e) {
            console.error(e);
            if (typeof callback !== 'undefined') {
                callback(e);
            }
        }
    }
    stop () {
        this.mic.disconnect();
        this.script.disconnect();
    }
}


//
// class SoundMeter{
//   constructor(){
//     if(support.supportWebAudio){
//       this.AudioContext = window.AudioContext || window.webkitAudioContext;
//       this.context = new AudioContext();
//     }
//     this.analyser = this.context.createAnalyser();
//     this.analyser.fftSize = 1024;
//     this.analyser.smoothingTimeConstant = 0.5;
//
//     this.mediaStreamSource = null;
//     this.microphoneVolume = 0;
//   }
//
//   connectToSource (stream, callback) {
//     const that = this;
//     console.log('SoundMeter connecting');
//       try {
//         that.mediaStreamSource = that.context.createMediaStreamSource(stream);
//         that.mediaStreamSource.connect(that.analyser);
//
//         // that.audioInterval = setInterval(()=>{
//           if (that.context.state === 'suspended') {
//             that.context.resume();
//           }
//           let array = new Uint8Array(that.analyser.frequencyBinCount);
//           that.analyser.getByteFrequencyData(array);
//
//           let values = 0;
//
//           let length = array.length;
//           for (let i = 0; i < length; i++) {
//               values += array[i];
//           }
//           setTimeout(() => {
//             that.microphoneVolume = (values / length);
//           });
//           if(typeof callback != 'undefined'){
//               callback(that)
//           }
//         // },100)
//         that.analyser.disconnect();
//       } catch (e) {
//
//       }
//   };
//
//   stop(){
//     this.mediaStreamSource.disconnect();
//     this.analyser.disconnect();
//   };
// }

export default SoundMeter
// export default SoundMeter;
