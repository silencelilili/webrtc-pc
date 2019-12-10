'use strict';
let support = require('./rtcSupport').default;
/**
 * 
 */
function getMediaDevices() {
  return new Promise((resolve, reject) => {
    _getMediaDevices(resolve, reject);
  });
}

function _getMediaDevices(onSuccess, onFailure) {
  if(support.supportGetUserMedia){
    return navigator.mediaDevices.enumerateDevices().then(onSuccess, onFailure);
  }else{
    return navigator.enumerateDevices( onSuccess, onFailure);
  }
  onFailure(new Error('enumerateDevices fail'));
}

function handleDevices() {
  // getMediaDevices()
  // .then((deviceInfos)=>{
  //   gotDevices(deviceInfos)
  // })
  // .catch((error)=>{
  //   console.log(error)
  // })

  return new Promise((resolve, reject) => {
    getMediaDevices()
    .then((deviceInfos)=>{
      resolve(gotDevices(deviceInfos))
    })
    .catch((error)=>{
      reject(error)
      console.log(error)
    })
  })
}

function gotDevices(deviceInfos){
  let deviceList = {
    audioInputSelect: [],
    audioOutputSelect: [],
    videoSelect: []
  };
  for (let i = 0; i < deviceInfos.length; i++) {
    let deviceInfo = deviceInfos[i];
    if (deviceInfo.kind === 'audioinput') {
      deviceInfo.text = deviceInfo.label || `microphone ${deviceList.audioInputSelect.length + 1}`;
      deviceList.audioInputSelect.push(deviceInfo);
    } else if (deviceInfo.kind === 'audiooutput') {
      deviceInfo.text = deviceInfo.label || `speaker ${deviceList.audioOutputSelect.length + 1}`;
      deviceList.audioOutputSelect.push(deviceInfo);
    }else if (deviceInfo.kind === 'videoinput') {
      deviceInfo.text = deviceInfo.label || `camera ${deviceList.videoSelect.length + 1}`;
      deviceList.videoSelect.push(deviceInfo);
    }
  }
  return deviceList;
}

function attachOutputSinkId(element, sinkId) {
  if (typeof element.sinkId !== 'undefined') {
    element.setSinkId(sinkId)
      .then(() => {
        console.log(`Success, audio output device attached: ${sinkId}`);
      })
      .catch(error => {
        let errorMessage = error;
        if (error.name === 'SecurityError') {
          errorMessage = `You need to use HTTPS for selecting audio output device: ${error}`;
        }
        console.error(errorMessage);
        // Jump back to first output device in the list as it's the default.
        // audioOutputSelect.selectedIndex = 0;
      });
  } else {
    console.warn('Browser does not support output device selection.');
  }
}

export default {
  handleDevices,
  attachOutputSinkId
}
