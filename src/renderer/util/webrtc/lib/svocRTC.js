'use strict';

let RTCMain = require('./svocRTCMain').default;
let Log = require('../log').default;
let setting = require('../RTCSettings').default;
function svocRTC() {
  var _this = this;
  _this.remoteMediaStream = null;
  _this.CallPresentationStarted = null;
  _this.CallPresentationStopped = null;
  _this.CallPresentationUpdate = null;
  _this.CallPresentationVideoUpdate = null;
  _this.CallLocalMediaStream = null;
  _this.CallRemoteMediaStream = null;
  _this.onPresentationReload = null;
  _this.CallScreenshareConnected = null;
  _this.CallScreenshareStopped = null;
  _this.CallScreenShareMissing = null;
  _this.onCallDisconnect = null;
  _this.onCallError = null;

  _this.CallParticipantUpdate = null;
}
var screenshareCallback = null;
svocRTC.prototype.init = function (host, alias, displayName, pin, bw, token, registration_token) {
  var _this = this;
  _this.displayName = displayName;

  RTCMain.onConnect = function (stream) {
    // tool.init('remoteVideo', stream);
    Log.info('-----remoteMediaStream-----', stream)
    _this.CallRemoteMediaStream(stream)
  }
  RTCMain.onSetup = function (stream, pinStatus, conferenceExtension) {
    setTimeout(() => {
      if(stream) {
        Log.info('-----localMediaStream-----', stream)
        _this.CallLocalMediaStream(stream);
        _this.connect();
      } else if (_this.remoteMediaStream) { //platformSettings.hasWebRTC &&
        RTCMain.connect();
      } else if(pinStatus !== 'none') {
        Log.warn('-----pinStatus-----', pinStatus)
        _this.connect(pin);
      }else{
        _this.connect();
      }
    },5000);

  }
  RTCMain.onError = function (reason) {
    if(reason === "calls error"){
      _this.onCallError('网络异常，请重新加入会议')
    }else if (reason === "refresh_token error") {
      _this.onCallError('网络异常，请重新加入会议(4002)')
    }
    Log.error('call::error', reason)
  }
  RTCMain.onDisconnect = function (msg) {
    if(msg == 'Disconnected by another participant'){
      _this.onCallDisconnect('通话方已将您挂断')
    }else {
      _this.onCallDisconnect(msg)
    }
    return msg;
  }

  RTCMain.onPresentation = function(isActive, presenter) {
    setTimeout(() => {
      Log.info('RTCMain.onPresentation', isActive, presenter);
      if (isActive) {
        _this.CallPresentationStarted(presenter)
        _this.presentationAcitve = true;
        // _this.presentationName = presenter;
      } else {
          delete _this.presentationAcitve;
          if (typeof _this.screenShareMode === 'undefined') {
              // suppress presentationStopped event when we have stolen presentation
              _this.CallPresentationStopped()
          }
      }
    });
  };
  RTCMain.onPresentationReload = function(src) {
    setTimeout(() => {
      Log.info('RTCMain.onPresentationReload 图片', src);
      if (_this.presentationAcitve || _this.screenShareMode === 'screen' || _this.screenShareMode === 'screen_http') {
          _this.CallPresentationUpdate(src)
          _this.presentationImgSrc = src;
      }
    });
  };
  RTCMain.onPresentationConnected = function(src) {
    setTimeout(() => {
      Log.info('RTCMain.onPresentationConnected', src);
      // $rootScope.$broadcast('call::presentationVideoUpdate', src);
      _this.CallPresentationVideoUpdate(src)
      if (src instanceof MediaStream) {
          _this.presentationVideoSrc = src;
          Log.debug('in MediaStream')
      } else {
          _this.presentationVideoSrc = src; //$sce.trustAsResourceUrl(src);
          Log.debug('in trustAsResourceUrl')
      }
    });
  };
  RTCMain.onPresentationDisconnected = function(reason) {
    setTimeout(() => {
          // Only called when we are receiving video presentation and remote side stop
          Log.info('RTCMain.onPresentationDisconnected', reason);
          if (reason && reason.indexOf(': ') > 0) {
              reason = reason.substr(reason.lastIndexOf(': ') + 2);
          }
          // $rootScope.$broadcast('call::presentationVideoUpdate', null, reason);
          _this.CallPresentationVideoUpdate(null, reason)
          delete _this.presentationVideoSrc;
      });
  };
  RTCMain.onScreenshareConnected = function (src) {
    setTimeout(() => {
      Log.info('RTCMain.onScreenshareConnected', src);
      // _this.CallScreenshareConnected(src);
      delete _this.presentationAcitve;
      _this.presentationName = `${displayName}`
      if (screenshareCallback) {
        screenshareCallback();
      }
      screenshareCallback = null;
    });
  };
  RTCMain.onScreenshareStopped = function (reason) {
    // setTimeout(() => {
      Log.info('RTCMain.onScreenshareStopped', reason);
      delete _this.screenShareMode;
      if (reason !== RTCMain.trans.ERROR_SCREENSHARE_CANCELLED) {
        delete _this.presentationImgSrc;
        delete _this.presentationVideoSrc;
      }
      // if(reason !== 'Screenshare remotely disconnected: Presentation stolen'){
        _this.CallScreenshareStopped(reason)
      // }
    // })
  };
  RTCMain.onScreenshareMissing = function () {
    setTimeout(() => {
      Log.info('RTCMain.onScreenshareMissing');
      RTCMain.onScreenshareStopped();
      _this.CallScreenShareMissing()
    })
  }

  RTCMain.onParticipantUpdate = function (msg) {
    setTimeout(() => {
        Log.info('RTCMain.onParticipantUpdate');
        _this.CallParticipantUpdate(msg)
    })
  }

  RTCMain.makeCall(host, alias, displayName, pin, bw, 'none', setting.h264_enabled);
}
svocRTC.prototype.startCall = function (callType, videoSource, audioSource, flashElement) {
  var _this = this;
  Log.debug('----startCall-----', callType, videoSource, audioSource, flashElement)
  RTCMain.call_type = callType;
  RTCMain.flash = flashElement;
  RTCMain.video_source = videoSource;
  RTCMain.audio_source = audioSource;
  // platformSettings.hasWebRTC &&
  if (_this.remoteMediaStream) {
      RTCMain.renegotiate(callType);
  } else {
      RTCMain.addCall(callType, flashElement);
  }
}

svocRTC.prototype.connect = function (pin, extension) {
  var _this = this;
  Log.debug('Call.connect', pin, extension);
  _this.microphoneMuted = RTCMain.muteAudio();
  _this.cameraMuted = RTCMain.muteVideo();
  RTCMain.connect(pin, extension);
}

svocRTC.prototype.startPresentationVideo = function () {
  var _this = this;
  RTCMain.getPresentation();
  Log.debug('call.startPresentationVideo')
}

svocRTC.prototype.stopPresentationVideo = function () {
  var _this = this;
  Log.debug('Call.stopPresentationVideo');
  RTCMain.stopPresentation();
  // $rootScope.$broadcast('call::presentationVideoUpdate', null);
  delete _this.presentationVideoSrc;
  _this.refreshPresentation();
}
svocRTC.prototype.refreshPresentation = function () {
  var _this = this;
  RTCMain.onPresentationReload(RTCMain.getPresentationURL());
}

svocRTC.prototype.startScreenShare = function (sourceVideoId) {
  var _this = this;
  Log.debug('Call.startScreenShare');
  _this.screenShareMode = 'screen';
  _this.presentationName = _this.displayName;
  RTCMain.present(_this.screenShareMode, sourceVideoId);
}

svocRTC.prototype.stopScreenShare = function () {
  var _this = this;
  Log.debug('Call.stopScreenShare');
  delete _this.screenShareMode;
  delete _this.presentationImgSrc;
  delete _this.presentationVideoSrc;
  RTCMain.present(null, null);
}


svocRTC.prototype.imageShareStart = function (cb) {
  var _this = this;
  Log.debug('Call.imageShareStart', cb);
  screenshareCallback = cb;
  _this.screenShareMode = 'screen_http';
  RTCMain.present(_this.screenShareMode, null);
  _this.presentationName = _this.displayName;
};
svocRTC.prototype.imageShareSetImage = function (dataURL) {
  var _this = this;
  Log.debug('Call.imageShareSetImage', dataURL);
  RTCMain.sendPresentationImage({files: [dataURL]});
}

svocRTC.prototype.getCallStatistics = function(callback) {
  var _this = this;
  if (RTCMain.call && RTCMain.call.getMediaStatistics) {
    window.getMediaStatistics = RTCMain.call.getMediaStatistics()
      return RTCMain.call.getMediaStatistics();
  } else {
    window.getMediaStatistics = RTCMain.getMediaStatistics()
      return RTCMain.getMediaStatistics();
  }

};

svocRTC.prototype.toggleMicrophone = function() {
  var _this = this;
  _this.microphoneMuted = RTCMain.muteAudio();
};
svocRTC.prototype.toggleCamera = function() {
  var _this = this;
  _this.cameraMuted = RTCMain.muteVideo();
  return _this.cameraMuted;
};

svocRTC.prototype.disconnectAll = function() {
  var _this = this;
  RTCMain.disconnectAll();
};
svocRTC.prototype.disconnect = function(reason) {
  var _this = this;
  Log.debug('Call.disconnect');
  delete _this.presentationVideoSrc;
  try {
    RTCMain.present(null, null);
    RTCMain.stopPresentation();
    RTCMain.disconnectCall();
    RTCMain.disconnect(reason, false);
    _this.CallLocalMediaStream = null;
  } catch (e) {
    Log.error('Failed to disconnect pexrtc', e);
  }
};
  if (setting.screenshareFrameRate !== undefined) {
    var resolution = calculateScreenshareResolution(setting.screenshareFrameRate)
    RTCMain.screenshare_width = resolution[0]
    RTCMain.screenshare_height = resolution[1]
    RTCMain.screenshare_fps = setting.screenshareFrameRate;
  }
  if (setting.defaultBandwidth !== undefined) {
    RTCMain.bandwidth_in = parseInt(setting.defaultBandwidth) - 64;
    if (RTCMain.bandwidth_in < 0) {
      RTCMain.bandwidth_in = 0;
    }
    RTCMain.bandwidth_out = RTCMain.bandwidth_in;
  }

  function calculateScreenshareResolution (fps) {
    /* Calculate the appropriate max screen share resolution for a given
       frame rate. The logic is such that for any frame rate the
       bandwidth and cpu usage will be approximately constant.

       It's possible to process more pixels per second at higher fps
       since there is less change between each frame. Assume that the
       increase in number of pixels per second as a function of frame
       rate is linear. Upper limit is set to UHD (4K) to avoid issues
       with sharing displays with crazy high resolution. */
    var r1 = {w: 3840, h: 2160, f:  1};
    var r2 = {w: 1366, h:  768, f: 15};

    // pixels_per_second = a * fps + b
    var p1 = r1.w * r1.h * r1.f;            // pixels per second for min fps
    var p2 = r2.w * r2.h * r2.f;            // pixels per second for max fps
    var a = (p2 - p1) / (r2.f - r1.f);
    var b = (r2.f * p1 - r1.f * p2) / (r2.f - r1.f);

    // Find pixels per second for current fps and resulting scaling ratio
    var pixels_per_second = a * fps + b;
    var ratio_pixels_per_frame = (pixels_per_second / r1.f) / (p1 * fps);
    var ratio_dimension = Math.sqrt(ratio_pixels_per_frame);

    var w = window.screen.width;
    var h = window.screen.height;

    if (h > w) {
        // Screen is rotated
        var tmp = r1.w;
        r1.w = r1.h;
        r1.h = tmp;
    }

    w = Math.min(Math.ceil(r1.w * ratio_dimension), w);
    h = Math.min(Math.ceil(r1.h * ratio_dimension), h);

    return [w, h];
  }


export default new svocRTC()
