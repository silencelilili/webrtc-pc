
let log = require('../log').default;

  var Log = log;
  var createEventSource = function() {
    var self = this;
    self.source;
    self.source_timeout = 0;
    self.call = null;
  }
  createEventSource.prototype.init = function(parent){
    var self = this;
    self.parent = parent;
    self.call = parent.call;
    if(self.parent.token){
      self.connect()
    }
  }
  createEventSource.prototype.connect = function () {
    var self = this;
    var url = "https://" + self.parent.node + "/api/client/v2/conferences/" + self.parent.conference_uri + "/events?token=" + self.parent.token;
    self.source = new EventSource(url);

    self.source.addEventListener("presentation_start", function(e) {
      var msg = JSON.parse(e.data);
      Log.sse("presentation_start", msg);
      msg.status = "start";
      if (self.parent.presentation_msg.status != 'start' ||
      self.parent.presentation_msg.presenter_uuid != msg.presenter_uuid) {
        self.parent.processPresentation(msg);
      }
      self.parent.presentation_msg = msg;
    }, false);

    self.source.addEventListener("presentation_stop", function(e) {
      var msg = {'status': "stop"};
      Log.sse("presentation_stop", msg);
      if (self.parent.presentation_msg.status != 'stop') {
          self.parent.processPresentation(msg);
      }
      self.parent.presentation_msg = msg;
    }, false);

    self.source.addEventListener("presentation_frame", function(e) {
      Log.sse("presentation_frame",self.parent.onHold, e.lastEventId);

      self.parent.presentation_event_id = e.lastEventId;
      if (self.parent.onPresentationReload && !self.parent.onHold) {
          self.parent.onPresentationReload(self.parent.getPresentationURL());
      }
    }, false);
    self.source.addEventListener("participant_create", function(e) {
      var msg = JSON.parse(e.data);
      Log.sse("participant_create", msg);
      // self.rosterList[msg.uuid] = msg;
      // if (msg.uuid == self.uuid && self.current_service_type && msg.service_type) {
      //     self.current_service_type = msg.service_type;
      // }
      // if (!self.oldRosterList) {
      //     if (self.onParticipantCreate) {
      //         self.onParticipantCreate(msg);
      //     }
      //     if (self.onRosterList) {
      //         self.onRosterList(self.getRosterList());
      //     }
      // }
    }, false);
    self.source.addEventListener("participant_update", function(e) {
      var msg = JSON.parse(e.data);
      Log.sse("participant_update", msg);
      if( self.parent.onParticipantUpdate ){
          self.parent.onParticipantUpdate(msg);
      }

      // self.rosterList[msg.uuid] = msg;
      // if (msg.uuid == self.uuid && self.current_service_type && msg.service_type) {
      //     self.current_service_type = msg.service_type;
      // }
      // if (!self.oldRosterList) {
      //     if (self.onParticipantUpdate) {
      //         self.onParticipantUpdate(msg);
      //     }
      //     if (self.onRosterList) {
      //         self.onRosterList(self.getRosterList());
      //     }
      // }
    }, false);
    self.source.addEventListener("participant_delete", function(e) {
      var msg = JSON.parse(e.data);
      Log.sse("participant_delete", msg);
      // delete self.rosterList[msg.uuid];
      // if (!self.oldRosterList) {
      //     if (self.onParticipantDelete) {
      //         self.onParticipantDelete(msg);
      //     }
      //     if (self.onRosterList) {
      //         self.onRosterList(self.getRosterList());
      //     }
      // }
    }, false);
    self.source.addEventListener("message_received", function(e) {
      var msg = JSON.parse(e.data);
      Log.sse("message_received", msg);
      // if (self.onChatMessage) {
      //     self.onChatMessage(msg);
      // }
    }, false);
    self.source.addEventListener("participant_sync_begin", function(e) {
      Log.sse("participant_sync_begin");
      // if (!self.oldRosterList) {
      //     self.oldRosterList = self.rosterList;
      // }
      // self.rosterList = {};
      // if (self.onSyncBegin) {
      //     self.onSyncBegin();
      // }
    }, false);
    self.source.addEventListener("participant_sync_end", function(e) {
      Log.sse("participant_sync_end", self.rosterList);
      // for (var uuid in self.rosterList) {
      //     if (!(uuid in self.oldRosterList) && self.onParticipantCreate) {
      //         self.onParticipantCreate(self.rosterList[uuid]);
      //     } else {
      //         if (self.onParticipantUpdate) {
      //             self.onParticipantUpdate(self.rosterList[uuid]);
      //         }
      //         delete self.oldRosterList[uuid];
      //     }
      // }
      // if (self.onParticipantDelete) {
      //     for (uuid in self.oldRosterList) {
      //         var msg = {'uuid': uuid};
      //         self.onParticipantDelete(msg);
      //     }
      // }
      // delete self.oldRosterList;
      // if (self.onRosterList) {
      //     self.onRosterList(self.getRosterList());
      // }
      // if (self.onSyncEnd) {
      //     self.onSyncEnd();
      // }
    }, false);
    self.source.addEventListener("call_disconnected", function(e) {
      var msg = JSON.parse(e.data);
      Log.sse("eventsource call_disconnected", msg);
      if (self.call && self.call.call_uuid == msg.call_uuid) {
        Log.sse('eventsource call_disconnected call=====')
        self.call.remoteDisconnect(msg);
      } else if (self.parent.presentation && self.parent.presentation.call_uuid == msg.call_uuid) {
        Log.sse('eventsource call_disconnected presentation=====')
        self.parent.presentation.remoteDisconnect(msg);
      } else if (self.parent.screenshare && self.parent.screenshare.call_uuid == msg.call_uuid) {
        Log.sse('eventsource call_disconnected screenshare=====')
        self.parent.screenshare.remoteDisconnect(msg);
      }
    }, false);
    self.source.addEventListener("disconnect", function(e) {
      var msg = JSON.parse(e.data);
      Log.sse("disconnect", msg);
      var reason = self.parent.trans.ERROR_DISCONNECTED;
      if ('reason' in msg) {
          reason = msg.reason;
      }
      if (self.parent.state != 'DISCONNECTING') {
          self.parent.disconnect();
          if (self.parent.onDisconnect) {
              self.parent.onDisconnect(reason);
          }
      }
    }, false);

    self.source.addEventListener("conference_update", function(e) {
      var msg = JSON.parse(e.data);
      Log.sse("conference_update", msg);
      // if (self.onConferenceUpdate) {
      //     self.onConferenceUpdate(msg);
      // }
    }, false);
    self.source.addEventListener("refer", function(e) {
      var msg = JSON.parse(e.data);
      Log.sse("refer", msg);
      // self.processRefer(msg);
    }, false);
    self.source.addEventListener("on_hold", function(e) {
      var msg = JSON.parse(e.data);
      Log.sse("call_hold", msg);
      self.parent.holdresume(msg.setting);
    }, false);
    self.source.addEventListener("stage", function(e) {
      var msg = JSON.parse(e.data);
      Log.sse("stage", msg);
      // if (self.onStageUpdate) {
      //     self.onStageUpdate(msg);
      // }
    }, false);
    self.source.addEventListener("layout", function(e) {
      var msg = JSON.parse(e.data);
      Log.sse("layout", msg);
      // if (self.onLayoutUpdate) {
      //     self.onLayoutUpdate(msg);
      // }
    }, false);
    self.source.addEventListener("refresh_token", function(e) {
      Log.sse("refresh_token");
      // self.refreshToken();
    }, false);


    self.source.onopen = function(e) {
      Log.sse("event source open");
      self.source_timeout = 10;
    };

    self.source.onerror = function(e) {
      Log.sse("event source error", e);
      if (self.parent.state != 'DISCONNECTING') {
          Log.sse("reconnecting...");
          self.source.close();
          self.source = null;
          // if (source_timeout > 15000) {
          //     self.error = "Error connecting to EventSource";
          //     return self.onError(self.trans.ERROR_CONNECTING);
          // }
          setTimeout(function() {
              // self.connect()
              // self.call.pcOfferCreated(self.parent.pc.localDescription);
          }, self.source_timeout);
          self.source_timeout += 1000;
      }
    };

    self.source.onclose = function(e){
      Log.sse("event source close", e)
    }
  }

export default new createEventSource()
