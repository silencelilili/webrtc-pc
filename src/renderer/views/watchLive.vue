<template>
<!-- 观看直播 -->
  <div>
    <el-card :body-style="{ padding: '0px', margin:'8px' }">
      <div class="live-header">
        <h4 class="title">{{liveConferenceData.conferenceName}}</h4>
        <div>
          <el-col :span="6">
            <span>发起人：{{liveConferenceData.appointUser}}</span>
          </el-col>
          <el-col :span="8">
            <span>会议时间：{{liveConferenceData.startTime | date('yyyy-MM-dd HH:mm')}}</span>
          </el-col>

          <el-col :span="6" :offset="4">
            <span>观看人数：
              <template v-if="liveConferenceData.playNum <= 0">1人</template>
              <template v-else>{{liveConferenceData.playNum}}人</template>
               <!-- {{liveConferenceData.playNum <= 0 ? '1' : liveConferenceData.playNum }}人 -->
            </span>
          </el-col>
        </div>
      </div>
      <div class="live-content">
        <div v-if="isBeginLive">
          <video-player :options="videoOptions" :liveUrl="liveUrl"/>
        </div>

        <!-- vjs-fluid -->
        <!-- <video id="live-video" class="video-js vjs-default-skin vjs-big-play-centered videoStyle" controls autoplay preload="auto">
          <p class="vjs-no-js">不支持H5或FLASH</p>
        </video> -->
      </div>
    </el-card>

    <!-- 直播发倒计时 -->
    <el-dialog
      width="55%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      :center="true"
      :visible.sync="countDownModal">
      <div class="text-center" style="font-size:18px;">
        距离会议开始还有 <strong class="red"><span v-if="downTimerLong.days!='00'">{{downTimerLong.days}}天</span>{{downTimerLong.hours}}小时 {{downTimerLong.minutes}}分钟{{downTimerLong.seconds}}秒</strong>
      </div>
      <div slot="footer" class="dialog-footer">
        <!-- <el-button type="primary" @click="countDownModal=false">确 定</el-button> -->
      </div>
    </el-dialog>

  <!-- 直播密码 -->
    <el-dialog
    width="45%"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :center="true"
    :visible.sync="livePwdModal">
      <el-form :model="liveFrom" label-width="80px">
        <el-form-item label="直播密码">
          <el-input type="password" v-model="liveFrom.livePwd" autocomplete="true"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="checkLivePwdFn">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import {ucApi} from '@/server/ucapi'
import {common} from '@/util/common'
import VideoJs from 'video.js'
import VideoPlayer from '@/components/videoPlayer.vue';
import ElCol from "element-ui/packages/col/src/col";

export default {
  name: "watchlive",
  components: {
      ElCol,
      VideoPlayer
	},
  data() {
    return {
      appointmentId:'',
      liveConferenceData: {
        playNum: 0
      },
      videoSize: [],
      //密码框
      livePwdModal: false,
      liveFrom:{
        livePwd: ''
      },
      //倒计时
      downTimerInterval: null,
      downTimerLong: [],
      countDownModal: false,
      isBeginLive: false,
      videoOptions: {
        autoplay: true,
        controls: true,
        liveui: true,
				sources: null
      },
      liveUrl: '',
      liveEndInterval: null
    }
  },
  methods: {
    /**
     * 1. 初始化 获取直播相关数据，并判断直播状态
     */
    getLiveMeetingFn(id){
      const that = this;
      ucApi.getLiveInfoData(id)
      .then((result) => {
        let {code, data, msg} = result;
        switch (code) {
          case 200: // 正常
            that.liveConferenceData = data
            that.$nextTick(()=>{
              that.alertLiveDialog(data);
              that.intervalCheck()
            })
            break;
          case 33302: // 此会议室没有正在召开的会议
            that.status_noconference()
            break;
          case 33306:// 倒计时页面
            that.liveConferenceData = data
            that.status_countDown(data)
            break;
          case 33310://直播结束
            that.status_end()
            break;
          case 30416://未开启直播
            that.status_nolive()
            break;
          case 10404:
            break;
        }
      }).catch((err) => {
        console.log(err);
      });
    },
    // 初始化video播放器
    playerInfo(){
      // 提示"暂无参会者入会"
      if (this.liveConferenceData.isKeep === false){
        this.status_noKeep();
        return false;
      }
      // 正常加载播放器
      this.isBeginLive = true;
      const url = this.liveConferenceData.phoneAddress;
      this.liveUrl = url;
      this.videoOptions.sources = [{type: 'application/x-mpegURL', src: url}]

      /**
      let livePlayer = VideoJs('live-video', {
        width: 1280,
        height: 720,
        fluid: true,
        sources: [{type: 'video/rtmp', src: url}]
      },
      function(){
        console.log('videojs播放器初始化成功')
      });
      rtmp测试地址： rtmp://58.200.131.2:1935/livetv/hunantv
      VideoJs("live-video").ready(function(){
          let livePlayer = this;
          livePlayer.play();
          // play 放在pause 中每次要重新加载是为了解决：暂停后不能再播放问题
          livePlayer.on('pause', ()=>{
            livePlayer.on('play', ()=>{
              livePlayer.load();
              livePlayer.off('play')
            });
          })
        });
      */
    },

    // 弹出验证直播密码框
    alertLiveDialog(data){
      const that = this;
      if(data.setPass){
        that.livePwdModal = true;
      } else {
        that.playerInfo()
      }
    },

    // 接口验证密码是否正确
    checkLivePwdFn(){
      const that = this;
      if(!that.liveFrom.livePwd){
        that.$notification('直播密码不能为空', 'error')
        return false;
      }
      const postData = { 'livePwd': this.liveFrom.livePwd };
      ucApi.checkLivePwd(that.appointmentId ,postData)
      .then((result) => {
        let {code, data, msg} = result;
        if(code === 200){
          that.livePwdModal = false;
          that.playerInfo()
        }else{
          that.$notification(msg, 'error')
        }
      }).catch((err) => {
        console.error("验证直播密码 error....", err)
      });
    },

    /**
     * 直播状态消息提示 - 枚举
     * 此会议室没有正在召开的会议
     * 直播倒计时
     * 直播结束
     * 未开启直播
     * 暂无参会者入会
     */
    // 此会议室没有正在召开的会议
    status_noconference(){
      const that = this;
      this.$alert('此会议室没有正在召开的会议', '提示', {
        confirmButtonText: '确定',
        center: true,
        showClose: false,
        callback: action => {
          that.closeLiveWin()
        }
      });
    },
    // 倒计时
    status_countDown(data){
      let lag ={
        'days': '00',
        'hours': '00',
        'minutes': '00',
        'seconds': '00'
      };
      // let lag = data.serverTimeStamp - data.startTime
      let currentTime = data.serverTimeStamp;
      let startTime = data.startTime;
      this.downTimerInterval = setInterval(() => {
        if(startTime <= new Date().getTime()) {
          this.countDownModal = false;
          this.playerInfo()
          // 直播时间到，开始直播
          clearInterval(this.downTimerInterval);
        }
        currentTime += 1000;
        this.downTimerLong = common.getCountdown(currentTime, startTime);
      }, 1000);
      this.countDownModal = true;
    },
    // 直播结束
    status_end(){
      const that = this;
      this.$alert('直播已结束！', '提示', {
        confirmButtonText: '确定',
        center: true,
        showClose: false,
        callback: action => {
          that.closeLiveWin()

        }
      });
    },
    // 未开启直播
    status_nolive(){
      const that = this;
      this.$alert('未开启直播！', '提示', {
        confirmButtonText: '确定',
        center: true,
        showClose: false,
        callback: action => {
          that.closeLiveWin()
        }
      });
    },
    // 暂无参会者入会
    status_noKeep() {
      this.$alert('暂无参会者入会！', '提示', {
        confirmButtonText: '确定',
        center: true,
        showClose: false,
        callback: action => {
        // that.closeLiveWin()
        }
      });
    },
    /******************** 分割线 ************************/

    // 通知主进程 - 关闭观看直播主窗口
    closeLiveWin(){
      this.$electron.ipcRenderer.send('close-watchlivewin')
    },
    // 定时器 - 查询当前直播状态
    intervalCheck(){
      const that = this;
      that.liveEndInterval = setInterval(() => {
        that.checkLiveStatusFn(); //未登录 定时查询直播状态
      }, 180000);
    },
    // 请求查询直播是否结束
    checkLiveStatusFn(){
      const that = this;
      ucApi.checkLiveStatus(that.appointmentId)
      .then(() => {
        that.status_end()
        if (that.liveEndInterval) {
          clearInterval(that.liveEndInterval);
          that.liveEndInterval = null;
        }
      }).catch((err) => {
        console.error("查询直播是否结束 error....", err)
      });
    }

  },
  created() {

  },
  mounted() {
    const _this = this;
    const curwin = this.$electron.remote.getCurrentWindow()
    this.videoSize = curwin.getSize()


    this.appointmentId = this.$electron.remote.getGlobal('appointmentId');
    _this.getLiveMeetingFn(this.appointmentId)


    // 监听主进程中的值，改变独立窗口的状态
    _this.$electron.ipcRenderer.on('send-watchliveWin',(event, data) =>{
      console.log('获取到的是主进程中 watchliveWin 传过来的appointmentId====', data)
      _this.$nextTick(() =>{
        _this.appointmentId = data;
        // _this.getLiveMeetingFn(data)
      })
    })

  },
  destroyed() {
    if(this.liveEndInterval) {
      clearInterval(this.liveEndInterval)
      this.liveEndInterval = null
    }
  },
}
</script>

<style scoped>
.vjs-paused .vjs-big-play-button,
.vjs-paused.vjs-has-started .vjs-big-play-button {
    display: block;
}
.video-js .vjs-time-control{display:block;}
.video-js .vjs-remaining-time{display: none;}
.video-js.vjs-playing .vjs-tech {
    pointer-events: auto;
}

.live-header{
  margin: 10px;
  padding: 0 10px;
  min-height: 55px;
  color: #333;
}
.live-header .title{
  font-size: 16px
}

</style>
