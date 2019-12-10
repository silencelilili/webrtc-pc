
let tool = require('./tool').default;
let Log = require('../log').default;
let rtcPort = require('./pexPort').default;

function callPort(){
  var self = this;
  self.props = {};
  self.parent = {};
}
callPort.prototype.createInit = function (params) {
  var self = this;
  self.props = params;
  self.parent = params.parent;
  Log.port('params------',params)
}
callPort.prototype.Call_calls = function (state, sdp, cb) {
  var self = this;
  // Log.port('Call_calls======', self.props.call_uuid, self.parent )
  var request = state == 'UPDATING' ? 'calls/' + self.props.call_uuid + '/update' : 'calls';
  self.sendRequestCall(request, sdp, function(e){
    cb(e)
  })
}
callPort.prototype.Call_ack = function(cb) {
  var self = this;
  // Log.port("Remote description active");

  // if (self.parent.recv_audio === false && self.parent.recv_video === false && self.parent.chrome_ver > 47 && self.parent.localStream) {
  //   peerConnection.pcAddStream([self.parent.localStream]);
  // }
  self.sendRequestCall('calls/' + self.props.call_uuid + '/ack', null, function() {
    // TODO
    cb();
    Log.port('ack接口返回', self.props)
  });
}
callPort.prototype.Call_disconnect = function (cb) {
  var self = this;
  Log.port('Call_disconnect', self.props.call_uuid, self.props)
  self.sendRequestCall('calls/' + self.props.call_uuid + '/disconnect', {}, cb);
}
callPort.prototype.sendRequestCall = function(request, params, cb, retries) {
  var self = this;
  // Only do async if explicitly asked
  var async = cb === false ? false : true;
  var xhr = new XMLHttpRequest();
  var xhrUrl = "https://" + self.parent.node + "/api/client/v2/conferences/" + self.parent.conference_uri + "/participants/" + self.parent.uuid + "/" + request;
  // Log.port("callPortCall.sendRequest", request, params, xhrUrl);
  xhr.open("POST", xhrUrl, async);
  if (cb) {
    xhr.onload = cb;
  }
  if (retries === undefined) {
    retries = 0;
  }
  xhr.onerror = function() {
    if (++retries > 10 || cb === false) {
        Log.error("Error sending request: " + request);
    } else {
        setTimeout(function() { rtcPort.sendRequest(request, params, cb, retries); }, retries * 500);
    }
  };
  xhr.ontimeout = function() {
      if (++retries > 10 || cb === false) {
        Log.error("Timeout sending request: " + request);
      } else {
        setTimeout(function() { rtcPort.sendRequest(request, params, cb, retries); }, retries * 500);
      }
  };
  /*xhr.withCredentials = true;*/
  if (tool.getCookie('JwtToken')) {
    xhr.setRequestHeader("JwtToken", tool.getCookie('JwtToken'));
  }
  if (self.parent.token) {
      xhr.setRequestHeader('token', self.parent.token);
  } else if (self.parent.pin !== null) {
      xhr.setRequestHeader('pin', self.parent.pin);
  }
  // if (self.parent.basic_username && self.parent.basic_password) {
  //     xhr.setRequestHeader('Authorization', 'Basic ' + Base64.encode(self.parent.basic_username + ':' + self.parent.basic_password));
  // }
  if (params) {
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.send(JSON.stringify(params));
  } else {
      xhr.send();
  }
  if (cb === false) {
    // Log.port("callPortCall.sendRequest response", xhr.responseText);
      var msg = {};
      try {
          msg = JSON.parse(xhr.responseText);
      } catch (error) {
          msg.reason = xhr.status + " " + xhr.statusText;
      }
      msg.http_status = xhr.status;
      return msg;
  }
}
export default new callPort()