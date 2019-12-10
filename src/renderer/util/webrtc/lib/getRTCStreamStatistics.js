
  'use strict';
  function RTCStreamStatistics() {
    var self = this;

    self.lastPackets = 0;
    self.lastLost = 0;
    self.lastBytes = 0;
    self.lastTimestamp = null;
    self.recentTotal = 0;
    self.recentLost = 0;
    self.samples = [];
    self.info = {};
  }
  RTCStreamStatistics.prototype.getStats = function() {
    var self = this;
    return self.info;
  };

  RTCStreamStatistics.prototype.updateBWEStats = function(result) {
    var self = this;
    // googActualEncBitrate - 视频编码器实际输出的码率，一般和目标码率是匹配的
    // googAvailableReceiveBandwidth - 接收视频数据可用的宽带
    // googAvailableSendBandwidth - 发送视频数据可用的宽带
    // googTargetEncBitrate - 视频编码的目标码率
    // googTansmitBitrate - 实际发送传输的码率
    self.info['configured-bitrate'] = (result.stat('googTargetEncBitrate') / 1000).toFixed(1) + 'kbps';
  };

  RTCStreamStatistics.prototype.updatePacketLossStats = function(currentTotal, currentLost) {
    var self = this;
    if (currentTotal === 0) {
        self.info['percentage-lost'] = '0%';
    } else {
        self.info['percentage-lost'] = (currentLost / currentTotal * 100).toFixed(1) + '%';
    }

    var sample;
    if (self.samples.length >= 60) {
        sample = self.samples.shift();
        self.recentLost -= sample[0];
        self.recentTotal -= sample[1];
    }
    sample = [Math.max(currentLost - self.lastLost, 0), currentTotal - self.lastPackets];
    self.recentLost += sample[0];
    self.recentTotal += sample[1];
    self.samples.push(sample);

    if (self.recentTotal === 0) {
        self.info['percentage-lost-recent'] = '0%';
    } else {
        self.info['percentage-lost-recent'] = (self.recentLost / self.recentTotal * 100).toFixed(1) + '%';
    }
  };
  // 接收端/呼入/recv
  RTCStreamStatistics.prototype.updateRxStats = function(result) {
    var self = this;
    self.info['packets-received'] = result.stat('packetsReceived');
    self.info['packets-lost'] = result.stat('packetsLost');
    self.info['percentage-lost'] = 0;
    self.info['percentage-lost-recent'] = 0;
    self.info['bitrate'] = "unavailable";

    var packetsReceived = parseInt(self.info['packets-received']) | 0;
    var packetsLost = parseInt(self.info['packets-lost']) | 0;

    self.updatePacketLossStats(packetsReceived, packetsLost);

    if (self.lastTimestamp > 0) {
        var kbps = Math.round((result.stat('bytesReceived') - self.lastBytes) * 8 / (result.timestamp - self.lastTimestamp));
        self.info['bitrate'] = kbps + 'kbps';
    }

    if (result.stat('googFrameHeightReceived'))
        self.info['resolution'] = result.stat('googFrameWidthReceived') + 'x' + result.stat('googFrameHeightReceived');
    // 编码器的名称,音频一般是opus,视频一般为:VP8、VP9、H264
    if (result.stat('googCodecName'))
        self.info['codec'] = result.stat('googCodecName');

    if (result.stat('googDecodeMs'))
        self.info['decode-delay'] = result.stat('googDecodeMs') + 'ms';
    // 接收端设置的初始帧率
    // if(result.stat('googFrameRateOutput'))
    //     self.info['frameRate-output'] = result.stat('googFrameRateOutput');
    
    // 接收端实际发送的帧率，根据当前网络会动态调整
    if(result.stat('googFrameRateReceived')) 
        self.info['frameRate-received'] = result.stat('googFrameRateReceived'); 

    self.lastTimestamp = result.timestamp;
    self.lastBytes = result.stat('bytesReceived');
    self.lastPackets = packetsReceived;
    self.lastLost = packetsLost;
  };
  // 发送端/呼出/send
  RTCStreamStatistics.prototype.updateTxStats = function(result) {
    var self = this;
    self.info['packets-sent'] = result.stat('packetsSent');
    self.info['packets-lost'] = result.stat('packetsLost');
    self.info['percentage-lost'] = 0;
    self.info['percentage-lost-recent'] = 0;
    self.info['bitrate'] = "unavailable";

    var packetsSent = parseInt(self.info['packets-sent']) | 0;
    var packetsLost = parseInt(self.info['packets-lost']) | 0;

    self.updatePacketLossStats(packetsSent, packetsLost);

    if (self.lastTimestamp > 0) {
        var kbps = Math.round((result.stat('bytesSent') - self.lastBytes) * 8 / (result.timestamp - self.lastTimestamp));
        self.info['bitrate'] = kbps + 'kbps';
    }
    // 发送端发送的视频分辨率宽度/高度
    if (result.stat('googFrameHeightSent'))
        self.info['resolution'] = result.stat('googFrameWidthSent') + 'x' + result.stat('googFrameHeightSent');
    // 编码器的名称,音频一般是opus,视频一般为:VP8、VP9、H264
    if (result.stat('googCodecName'))
        self.info['codec'] = result.stat('googCodecName');
      
    // 发送端设置的初始帧率
    // if(result.stat('googFrameRateInput'))
    //   self.info['frameRate-input'] = result.stat('googFrameRateInput');

    // 发送端实际发送的帧率，根据当前网络会动态调整
    if(result.stat('googFrameRateSent')) 
      self.info['frameRate-send'] = parseInt(result.stat('googFrameRateSent')) + 6; 
    // 发送端平均编码时间，值越小越好 
    if(result.stat('googAvgEncodeMs')) 
      self.info['AvgEncodeMs'] = result.stat('googAvgEncodeMs'); 
      // 是否因为宽带受限而降低发送的视频分辨率
    if(result.stat('googBandwidthLimitedResolution')) 
      self.info['bandwidth_limited'] = result.stat('googBandwidthLimitedResolution'); 
      // 是否因为CPU不足而降低发送的视频分辨率
    if(result.stat('googCpuLimitedResolution')) 
      self.info['cpu_limited'] = result.stat('googCpuLimitedResolution'); 

    self.lastTimestamp = result.timestamp;
    self.lastBytes = result.stat('bytesSent');
    self.lastPackets = packetsSent;
    self.lastLost = packetsLost;
  };

  RTCStreamStatistics.prototype.updateRxStatsFF = function(result) {
    var self = this;

    self.info['packets-received'] = result.packetsReceived;
    self.info['packets-lost'] = result.packetsLost;
    self.info['percentage-lost'] = 0;
    self.info['bitrate'] = "unavailable";

    var packetsReceived = parseInt(self.info['packets-received']) | 0;
    var packetsLost = parseInt(self.info['packets-lost']) | 0;

    self.updatePacketLossStats(packetsReceived, packetsLost);

    if (self.lastTimestamp > 0) {
        var tsDiff = result.timestamp - self.lastTimestamp;
        if (tsDiff > 500000) {
            // Safari is in milliseconds
            tsDiff = tsDiff / 1000;
        }
        var kbps = Math.round((result.bytesReceived - self.lastBytes) * 8 / tsDiff);
        self.info['bitrate'] = kbps + 'kbps';
    }

    self.lastTimestamp = result.timestamp;
    self.lastBytes = result.bytesReceived;
    self.lastPackets = packetsReceived;
    self.lastLost = packetsLost;
  };

  RTCStreamStatistics.prototype.updateTxStatsFF = function(result) {
    var self = this;

    self.info['packets-sent'] = result.packetsSent;
    self.info['bitrate'] = "unavailable";

    var packetsSent = parseInt(self.info['packets-sent']) | 0;

    if (self.lastTimestamp > 0) {
        var tsDiff = result.timestamp - self.lastTimestamp;
        if (tsDiff > 500000) {
            tsDiff = tsDiff / 1000;
        }
        var kbps = Math.round((result.bytesSent - self.lastBytes) * 8 / tsDiff);
        self.info['bitrate'] = kbps + 'kbps';
    }

    self.lastTimestamp = result.timestamp;
    self.lastBytes = result.bytesSent;
    self.lastPackets = packetsSent;
  };

  RTCStreamStatistics.prototype.updateRtcpTxStatsFF = function(result) {
    var self = this;

    self.info['packets-lost'] = result.packetsLost;
    //self.info['jitter'] = result.jitter;

    var packetsSent = parseInt(self.info['packets-sent']) | 0;
    var packetsLost = parseInt(self.info['packets-lost']) | 0;
    self.updatePacketLossStats(packetsSent, packetsLost);
  };

  export default RTCStreamStatistics;