<template>
  <!-- 音频设置 -->
  <div class="audioPage">
    <!-- Audio input -->
    <div class="sidebar-left line-form">
      <span>麦克风</span>
      <el-select v-model="audioForm.audioSource" placeholder="请选择麦克风" @change="chooseDevicesFn('audioSource', audioForm.audioSource)">
        <el-option
        v-for="list in deviceList.audioInputSelect"
        :key="list.deviceId"
        :label="list.text"
        :value="list.deviceId"
        ></el-option>
        <el-option label="无麦克风" value=""></el-option>
      </el-select>
    </div>

    <!-- Audio output -->
    <div class="sidebar-left line-form">
      <span>扬声器</span>
      <el-select v-model="audioForm.audioOutput" placeholder="请选择扬声器" @change="chooseDevicesFn('audioOutput', audioForm.audioOutput)">
        <el-option
        v-for="list in deviceList.audioOutputSelect"
        :key="list.deviceId"
        :label="list.text"
        :value="list.deviceId"
        ></el-option>
      </el-select>
    </div>
    <div class="sidebar-left line-form" style="margin-top: 20px">
      <span>检测:</span>
      <el-progress :percentage="micInstantVolume * 100"></el-progress>
      <!--{{micInstantVolume}}-->
    </div>

    <!--<div>slow: <el-progress :percentage="micSlowVolume * 100"></el-progress>{{micSlowVolume}}</div>-->
    <div v-show="false">
      <audio id="playaudio" autoplay></audio>
    </div>

  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import {common} from '@/util/common'
import SoundMeter from '@/util/webrtc/soundmeter'
import { setInterval } from 'timers';

const soundMeter = new SoundMeter()
export default {
  name: "audioPage",
  data() {
    return {
      audioForm: {
        audioSource: '',
        audioOutput: ''
      },
      audioUrl: null,
      micInstantVolume: 0,
      micSlowVolume: 0,
      micTimer: null,
      audioInterval: null
      // deviceList: {
      //   audioInputSelect: [],
      //   audioOutputSelect: []
      // }
    }
  },
  computed: {

    ...mapGetters('devicesInfo',{ //用mapGetters来获取devicesInfo.js里面的getters getDevicesInfoList
        deviceList: 'getDevicesInfoList'
    }),
    ...mapGetters('devicesInfo',{ //用mapGetters来获取devicesInfo.js里面的getters getDevices
        deviceInfo: 'getDevices'
    }),
  },
  methods: {
    // 获取可用麦克风/扬声器列表
    _gotDevices(){
      // 默认选中第一个
      this.audioForm.audioSource = common.getSessionStorage('audioSourceId') || this.deviceInfo.audioSource;
      this.audioForm.audioOutput = common.getSessionStorage('audioOutputId') || this.deviceInfo.audioOutput;
      // common.setSessionStorage('audioSourceId', this.deviceInfo.audioSource)
      // common.setSessionStorage('audioOutputId', this.deviceInfo.audioOutput)
    },
    // 选择麦克风/扬声器
    chooseDevicesFn(type, deviceid) {
      this.$store.commit("devicesInfo/setDevices", {name: type, value: deviceid});
      // common.setLocstorage(type+'Id', deviceid)
      common.setSessionStorage(type+'Id', deviceid)
      // this.$router.push("/index");
      this.getUserMedia(type, deviceid)
    },
    getUserMedia(type, deviceid){
      const that = this;
      const constraints = {audio:{deviceId: deviceid}, video: false}
      navigator.mediaDevices.getUserMedia(constraints).then((stream)=>{
        that.handleSuccess(stream)
      }).catch(that.handleError);
    },
    handleSuccess(stream) {
      const that = this;
      that.audioUrl = stream
      const _localVideo = document.querySelector("#playaudio");
      _localVideo.srcObject = stream
      that.gotAudioTrack(stream)
    },
    handleError(err){
      console.error(err)
    },
    // 音频轨道
    gotAudioTrack(stream){
        const that = this;
        soundMeter.connectToSource(stream, function(e){
            if(e) {
                console.error(e)
                return;
            }
            that.micTimer = setInterval(() => {
                that.micInstantVolume = parseInt(soundMeter.instant.toFixed(2));
                that.micSlowVolume = parseInt(soundMeter.slow.toFixed(2));
            }, 300);
        })
    }

  },
  watch: {
//     soundMeter: {
//      handler(curval) {
//        const _value = curval;
//       console.log(curval)
//      },
//      deep:true
//    },
  },
  created() {
    console.log("进入【AudioPage】");
  },
  mounted() {
    console.log("【AudioPage】加载完成");
    this._gotDevices();
  },
  beforeDestroy(){
      if(this.audioUrl) {
          this.audioUrl.getTracks().forEach(track => {
              track.stop()
          });
      }
      console.log("【AudioPage】即将销毁");
  },
  destroyed() {
      if(this.micTimer) {
          clearInterval(this.micTimer)
          this.micTimer = null;
      }
      this.audioUrl = null;
      console.log("【AudioPage】组件销毁");
  }

 };
</script>

<style scoped>

</style>
