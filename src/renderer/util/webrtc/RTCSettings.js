
import {baseConfig} from '../../config/baseconfig'
export default {
  serverAddress: baseConfig.host,
  hasWebRTC: navigator.msLaunchUri ? false : navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia || (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) || false,
  isDesktopClient: window.process && window.process.platform,
  isWebClient: !(window.process && window.process.platform),
  dialOutProtocols: [
    'sip',
    'h323',
    'mssip',
    'rtmp',
    'rtsp',
    'auto',
  ],
  media: true,
  audioonly: false,
  callHistory: {},
  bandwidths: [
    {
      value: '256',
      label: '256kbps',
    }, {
      value: '512',
      label: '512kbps',
    }, {
      value: '768',
      label: '768kbps',
    }, {
      value: '1024',
      label: '1024kbps',
    }, {
      value: '2048',
      label: '2048kbps',
    }, {
      value: '2560',
      label: '2560kbps',
    }, {
      value: '3072',
      label: '3072kbps',
    }, {
      value: '4096',
      label: '4096kbps',
    }
  ],
  defaultDialOutRole: 'host', // 'host' or 'guest'
  h264_enabled: false, // 是否使用h264编码器
  enableFullMotionPresentation: true, //  是否全速率接收双流
  screenshareFrameRate: 8, //共享 帧率
  defaultBandwidth: 1024,
  videoWidth: 1920,
  videoHeight: 1080,
  sideBarHidden: false
}
