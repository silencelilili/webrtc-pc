<template>
  <div class="index">
    <el-row class="index-box">
      <el-col class="main" :span="18">
        <div class="middle">
          <div class="video">
            <video muted id="localVideo" class="localvideo mirrorRotateLevel" autoplay ></video>
          </div>
        </div>
      </el-col>
      <el-col class="JoinForm" :span="6">
        <template v-if="hackReset">
          <JoinMeeting  />
        </template>
      </el-col>
    </el-row>


    <!-- 设置摄像头/麦克风 -->
    <el-dialog
            title="设置"
            :visible.sync="deviceDialog"
            :show-close="false"
            :close-on-click-modal="false"
            :close-on-press-escape="false"
            :modal-append-to-body="false"
            width="38%">
      <div v-if="deviceDialog">
        <el-form :model="deviceForm" label-width="100px" class="dialog-form">
          <el-form-item label="摄像头">
            <el-select v-model="deviceForm.videoSource" placeholder="请选择摄像头" @change="setDefaultDevice('videoSource', deviceForm.videoSource)">
              <el-option
                      v-for="list in deviceListInfo.videoSelect"
                      :key="list.deviceId"
                      :label="list.text"
                      :value="list.deviceId"
              ></el-option>
              <el-option
                      :label="'无摄像头'"
                      value="">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="麦克风">
            <el-select v-model="deviceForm.audioSource" placeholder="请选择麦克风" @change="setDefaultDevice('audioSource', deviceForm.audioSource)">
              <el-option
                      v-for="list in deviceListInfo.audioInputSelect"
                      :key="list.deviceId"
                      :label="list.text"
                      :value="list.deviceId"
              ></el-option>
              <el-option
                      :label="'无麦克风'"
                      value="">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="扬声器">
            <el-select v-model="deviceForm.audioOutput" placeholder="请选择扬声器" @change="setDefaultDevice('audioOutput', deviceForm.audioOutput)">
              <el-option
                      v-for="list in deviceListInfo.audioOutputSelect"
                      :key="list.deviceId"
                      :label="list.text"
                      :value="list.deviceId"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <!-- <el-button @click="deviceDialog = false">取 消</el-button> -->
        <el-button type="primary" @click="submitDevices()">确定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import JoinMeeting from '@/components/JoinMeeting.vue'
import getUserMedia from '@/util/webrtc/getUserMedia'
import getMediaDevices from '@/util/webrtc/getMediaDevices'

import SoundMeter from '@/util/webrtc/soundmeter'

import { common } from '@/util/common'
import setting from '@/util/webrtc/RTCSettings'
import { tokenService } from '@/util/tokenService'
import { clearInterval } from 'timers';

export default {
  name: "index",
  data() {
    return {
      hackReset: true,
      constraints: {},
      localVideo: '',
      localStream: null,
      videoWidth: setting.videoWidth,
      videoHeight: setting.videoHeight,
      // refreshInterval: null

      // 设置选择音视频设备
      deviceDialog: false,
      deviceListInfo: {
          videoSelect: [],
          audioOutputSelect: [],
          audioInputSelect: []
      },
      deviceForm: {
          videoSource: '',
          audioSource: '',
          audioOutput: ''
      },
    };
  },
  computed: {

    ...mapGetters('devicesInfo', {
      deviceInfoIds: 'getDevices'
    }),
    ...mapGetters({
      'watchServerAddress': 'getServerAddress',
      'watchIsLoggedIn': 'getIsLoggedIn'
    }),
    // isAnonymous(){
    //   return this.$store.getters.getIsLoggedIn && this.$store.getters.getLoginData
    // }
    // watchServerAddress() {
    //   return this.$store.getters.getServerAddress;
    // },
    // watchIsLoggedIn() {
    //   return this.$store.getters.getIsLoggedIn;
    // }
  },
  components: {
    JoinMeeting
  },
  methods: {


      // 获取可用麦克风/扬声器列表
      getMediaDevicesFn() {
          let _this = this;
          getMediaDevices.handleDevices()
              .then((res) => {
                  const deviceList = res;
                  console.log('获取到的媒体列表：', deviceList)
                  _this.deviceListInfo = deviceList;
                  _this.$store.dispatch('devicesInfo/asynDevicesInfoList', deviceList);
                  /**********************/
                  // 打开程序后先选择音视频
                  if(!common.getSessionStorage('videoSourceId') || !common.getSessionStorage('audioSourceId')){
                      _this.deviceDialog = true; // 打开设置窗口
                  }
                  /**********************/
                  _this.deviceForm = {
                      videoSource: deviceList.videoSelect[0].deviceId || common.getSessionStorage('videoSourceId'),
                      audioSource: deviceList.audioInputSelect[0].deviceId ||common.getSessionStorage('audioSourceId'),
                      audioOutput: deviceList.audioOutputSelect[0].deviceId || common.getSessionStorage('audioOutputId')
                  }
                  // 默认选择第一个设备
                  _this.setDefaultDevice('audioSource', _this.deviceForm.audioSource);
                  _this.setDefaultDevice('audioOutput', _this.deviceForm.audioOutput);
                  _this.setDefaultDevice('videoSource', _this.deviceForm.videoSource);

              })
              .catch((error)=>{
                  console.log(error)
              })
      },
      // 设置媒体设备
      setDefaultDevice(type, deviceid) {
          this.$store.commit("devicesInfo/setDevices", {name: type, value: deviceid});
      },
      // 确定当前所选择的音视频设备
      submitDevices() {
          common.setSessionStorage('videoSourceId', this.deviceForm.videoSource)
          common.setSessionStorage('audioSourceId', this.deviceForm.audioSource)
          common.setSessionStorage('audioOutputId', this.deviceForm.audioOutput)
          this.deviceDialog = false;
      },


    // 获取本地媒体摄像头
    getUserMediaFn(devices) {
      const _this = this;
      // 如果存在本地媒体流，先停止
      if(this.localStream) {
        this.localStream.getTracks().forEach(track => {
          track.stop()
        });
      }
      let videoConstraint = {
          width: {},
          height: {},
          deviceId: {}
      };
      let audioConstraint = true;

      if (devices.videoSource && devices.videoSource != '') {
          videoConstraint.width = { min: 480, ideal: 1280, max: this.videoWidth }
          videoConstraint.height = { min: 320, ideal: 720, max: this.videoHeight }
          videoConstraint.deviceId = {'exact': devices.videoSource} //devices.videoSource;
      }else {
          videoConstraint = false;
      }
      if(devices.audioSource && devices.audioSource != ''){
          audioConstraint = { deviceId: {'exact': devices.audioSource || 'default'} }
      } else {
          audioConstraint = false;
      }

      // 摄像头和麦克风必须开启一个才能直播
      if(!audioConstraint && !videoConstraint) {
          this.$notification('摄像头和麦克风必须开启一个才能入会', 'warning');
      }

      const _localVideo = document.querySelector("#localVideo");
      let constraints = {
        video: videoConstraint,
        audio: audioConstraint || true
      };
      console.log('获取本地媒体 - 约束条件：', constraints)


      getUserMedia(constraints)
      .then((stream)=>{
        this.localStream = stream;
//        _localVideo.srcObject = this.localStream;
//         window.loc = this.localStream;
          const streamer =
              typeof stream.stop === "function"
                  ? stream
                  : stream.getTracks();

//                  console.log('streamer', streamer)
//          setInterval(()=>{

//          },200)

          try {
              _localVideo.src = window.URL.createObjectURL(stream);
          } catch (err) {
              _localVideo.srcObject = stream;
          }
         console.log('获取本地媒体 成功 -----', stream);
      })
      .catch((error)=>{
        console.error('获取本地媒体失败-----', error)
      })
    },

  },
  watch: {
    // watch 媒体设备改变 深度监听
    deviceInfoIds: {
      handler(curval) {
          console.log('watch 媒体设备改变',curval)
        this.getUserMediaFn(curval)
      },
      deep:true
    },
    // watch 服务器地址改变
    watchServerAddress() {
      this.hackReset = false;
      this.$nextTick(() => {
        this.hackReset = true; //重建组件
      });
     console.log('【joinMeeting】 重建组件',this.hackReset);
    },
    // watch 用户状态改变 登录/退出
    watchIsLoggedIn() {
      this.hackReset = false;
      this.$nextTick(() => {
        this.hackReset = true; //重建组件
      });
      console.log('【joinMeeting 】重建组件',this.hackReset);
    }
  },
  created() {
    console.log("进入【index】组件");
      this.getMediaDevicesFn();
  },
  mounted() {
    console.log("【index】组件加载完成");
    const that = this;
    that.$nextTick(()=>{
        that.getUserMediaFn(that.deviceInfoIds);
    })

  },
  beforeDestroy(){
    if(this.localStream) {
      this.localStream.getTracks().forEach(track => {
        track.stop()
      });
    }
    console.log("【index】即将销毁");
  },
  destroyed() {
    this.localStream = null;
    console.log("【index】组件销毁");
  },

};
</script>
<style scoped>

.index{
  position: relative;
  height: 100%;
  /* left: 99px; */
  /* top: 0; */
  overflow: hidden;
}
.index-box{
  height: 100%;
}
.main,
.JoinForm,
.middle,
.localvideo,
.video {
  height: 100%;
}
.localvideo{
  width: 100%;
}
.video {
  /* overflow-x: scroll; */
  /* border-bottom: 1px solid #ccc; */
  background: #000;
}


</style>
