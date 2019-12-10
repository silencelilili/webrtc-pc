<template>
  <div class="tool-bar-center">
      <!-- 设置 -->
      <!-- <a href="javascript:;" class="tool-item pull-left toggle-sidebar" title="设置">
        <i class="tool-icon icon-mdi-setup-video"></i>
      </a> -->

      <!-- 摄像头开关 -->
      <a href="javascript:;" class="tool-item" @click="handleCamera()" title="摄像头">
        <i class="tool-icon" :class="[cameraMuted ? 'red icon-mdi-videocam-off' : 'icon-mdi-videocam']"></i>
        <span>摄像头</span>
      </a>
      <!-- 麦克风开关 -->
      <a href="javascript:;" class="tool-item" @click="handleMicrophone()" title="麦克风">
        <i class="tool-icon" :class="[microphoneMuted ? 'red icon-mdi-moff' : 'icon-mdi-mic']"></i>
        <span>麦克风</span>
      </a>
      <!-- 扬声器开关  v-show="!!isRemoteScreen"-->
      <a href="javascript:;" class="tool-item" @click="handleMute()" title="扬声器">
        <i class="tool-icon" :class="[volumeMute ? 'red icon-mdi-volume-down' : 'icon-mdi-volume-up']"></i>
        <span>扬声器</span>
      </a>

      <!-- 共享 -->
      <a href="javascript:;" class="tool-item" title="共享应用程序" v-show="!screenShareMode" @click="startScreenShare()">
        <i class="tool-icon icon-share-screen"></i>
        <span>共享桌面</span>
      </a>
      <a href="javascript:;" class="tool-item" title="共享pdf文件/图片" v-show="!screenShareMode" @click="addFileDialog=true">
        <i class="tool-icon icon-share-files"></i>
        <span>共享文件</span>
      </a>
      <a href="javascript:;" class="tool-item red" title="停止共享" v-show="screenShareMode" @click="stopScreenShare()">
        <i class="tool-icon icon-share-stop red"></i>
        <span>停止共享</span>
      </a>
      <a href="javascript:;" class="tool-item" title="共享窗口" v-show="(prentAcceptScreen || screenShareMode) && !presentationWindow" @click="popOutPresentation()">
        <i class="tool-icon icon-share-popout"></i>
        <span>共享窗口</span>
      </a>

      <!-- 全屏 -->
      <a href="javascript:;" class="tool-item" @click="handleFullScreen()" title="全屏">
        <i class="tool-icon" :class="[fullScreen ? 'icon-mdi-fullscreen-exit' : 'icon-mdi-fullscreen']"></i>
        <span>全屏</span>
      </a>
      <!-- 显示/隐藏 参会者列表 -->
      <a href="javascript:;" class="tool-item pull-right toggle-sidebar" @click="toggleSideBar()">
        <i class="tool-icon" :class="[sideBarState ? 'icon-arrow-right' : 'icon-arrow-left']"></i>
      </a>

      <!-- 发起共享选择 展示内容 -->
      <el-dialog
        title="选择展示内容"
        :visible.sync="addFileDialog"
        append-to-body
        width="45%">
        <!-- <div v-if="addFileDialog"> -->
          <fileshare
          ref="fileShareChild"
          v-on:emitlistenFileShareDialog="updateFileShareDialog"
          v-on:emitlistenFileShareMode="showFileShareMode"
          v-on:emitlistenScreenShareMode="showScreenShareMode"
          v-on:emitSlideShareObj="showSlideShareObj">
          </fileshare>
        <!-- </div> -->
      </el-dialog>

      <el-dialog
        title="共享屏幕"
        :visible.sync="screenDialog"
        append-to-body
        width="60%">
        <div v-if="screenDialog">
          <Screen v-on:emitlistenScreenShareMode="showScreenShareMode" />
        </div>
      </el-dialog>

    </div>
</template>

<script>
import rtc from '@/util/webrtc/lib/svocRTC';
import slideShare from '@/util/webrtc/lib/slideShare';
import {common} from '@/util/common';
import Screen from "@/components/screenWindow.vue";
import FileShare from '@/components/fileShare.vue';

export default {
  name: 'Toolbar',
  props: ['parentScreenShareMode','prentAcceptScreen','hasRemoteScreen'],
  data() {
    return {
      screenDialog: false,
      cameraMuted: false,
      microphoneMuted: false,
      volumeMute: false,
      volumeValue: 1,
      fullScreen: false,
      sideBarState: true,

      addFileDialog: false,
      currentSlide: 0,
      screenShareMode: '',
      presentationImgSrc: '',
      presentationWindow: false, // 是否打开了独立的共享窗口
      isRemoteScreen: null
    }
  },
  components: {
    Screen,
    fileshare: FileShare
  },
  methods: {
    // 摄像头
    handleCamera() {
      rtc.toggleCamera();
      this.cameraMuted = !this.cameraMuted;
      this.$emit('emitCameraIsMuted', this.cameraMuted); // 向父组件传值
    },
    // 麦克风
    handleMicrophone() {
      rtc.toggleMicrophone();
      this.microphoneMuted = !this.microphoneMuted;
    },
    // 扬声器
    handleMute() {
      if(this.volumeValue === 1) {
        this.volumeValue = 0
        this.volumeMute = true;
      }else{
        this.volumeValue = 1;
        this.volumeMute = false;
      }
      this.$store.commit('setLocalVolume', this.volumeValue);
      // this.volumeMute = !this.volumeMute;
    },
    // 全屏
    handleFullScreen() {
      let element = document.documentElement;
      common.fullScreen(element);
      this.fullScreen = !this.fullScreen;

      this.$electron.ipcRenderer.send('handle-fullScreen', this.fullScreen)
    },
    // 显示/隐藏 右侧参会者列表
    toggleSideBar() {
      this.sideBarState = !this.sideBarState;
      this.$store.commit('setSideBarState', this.sideBarState);
    },

    // 共享
    showFileShareMode(data) {
      this.screenShareMode = data;
      this.$emit('emitlistenScreenShareMode', 'screen_http');
      this.addFileDialog = false;
    },
    updateFileShareDialog(data){
      this.addFileDialog = data;
    },
    showSlideShareObj(data) {
      this.$emit('emitSlideShareObj', data);
    },
    previousSlide(){
      this.$refs.fileShareChild.previousSlide()
    },
    nextSlide() {
      this.$refs.fileShareChild.nextSlide()
    },

    // 停止共享
    stopScreenShare() {
      rtc.stopScreenShare();
      this.screenShareMode = '';
      this.$emit('emitlistenScreenShareMode', ''); // 向父组件传值
      this.presentationImgSrc = '';
      // 通知主进程关闭独立的共享窗口
      if(this.presentationWindow){
        this.presentationWindow = false;
        this.$electron.ipcRenderer.send('presentation-window', 'close')
      }


    },
    // 共享桌面应用程序
    startScreenShare() {
      this.screenDialog = true;
    },
    // sureScreenShare(id) {
    //   this.screenShareMode = 'screen';
    //   this.$emit('emitlistenScreenShareMode', 'screen'); // 向父组件传值
    // },
    showScreenShareMode(data) {
      this.screenShareMode = data;
      this.$emit('emitlistenScreenShareMode', 'screen'); // 向父组件传值
      this.screenDialog = false;
    },

    // 共享窗口 打开一个新的独立窗口
    popOutPresentation() {
      this.presentationWindow = true;
      const icp = this.$electron.ipcRenderer;
      icp.send('presentation-window', 'open')
      // this.$emit('emitPresentationWindow', this.presentationWindow);
      console.log('popOutPresentation')
    },

    /******************** 测试代码 *************************/
    startScreenShare_() {
      // const icp = this.$electron.ipcRenderer;
      // icp.send('screen-window')
      this.screenDialog = true;
    },
  /***************************测试代码 *************************/

  },
  watch: {


    presentationWindow(curVal) {
      this.$emit('emitPresentationWindow', curVal)
    },
    parentScreenShareMode(curVal) {
      console.log('深度监听 parentScreenShareMode-----', curVal)
      this.screenShareMode = curVal;
    },
    hasRemoteScreen(curVal) {
      console.log('深度监听 hasRemoteScreen-----', curVal)
      setTimeout(() => {
        this.isRemoteScreen = curVal;
      },2000);
    }
  },
  mounted() {
    let _this = this;
    // 监听主进程中的值，改变独立窗口的状态
    this.$electron.ipcRenderer.on('ipcPresentationWin', function (event, data) {
      console.log('获取到的是主进程中 presentationWin 的状态====', data)
      _this.$nextTick(() =>{
        _this.presentationWindow = data;
      })
    }),
    this.$electron.ipcRenderer.on('ipcFullScreen', function (event, data) {
      console.log('获取到的是主进程中 是否全屏 的状态====', data)
      _this.$nextTick(() =>{
        _this.fullScreen = data;
      })
    })
  }

}
</script>

<style scoped>
/* 工具操作部分 */
.tool-bar-center{
  /* position: absolute;
  text-align: center;
  transition: bottom 0.2s;
  bottom: 0;
  left: 0; */
  position: relative;
  background: #30384780;
  text-align: center;
  bottom: 0;
  padding-top: 5px;
  height: 60px;
  transition: bottom 0.3s;
}
.toggle-sidebar{
  margin: 14px 5px;
}

</style>
