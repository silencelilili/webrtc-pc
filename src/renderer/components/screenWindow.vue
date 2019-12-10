<template>
  <div class="container">
    <div class="screen-title">
      请选择您要共享的屏幕或窗口
    </div>
    <div class="main-pip"
    v-loading="screenLoading"
    element-loading-text="拼命加载中">
      <div class="screen-priew" v-for="screen in allScreenObj" :key="screen.id" @click="shareScreen(screen)">
        <img :src="screen.thumbnail.toDataURL()" alt="">
        <span class="screen-name">{{screen.name}}</span>
      </div>
      <!-- <video src="" autoplay></video> -->
    </div>

    <div>
      <!-- <button @click="gotScreen()">捕捉</button> -->
    </div>
  </div>
</template>

<script>
import { throws } from 'assert';
import rtc from '@/util/webrtc/lib/svocRTC';

export default {
  name: "screen",
  data () {
    return {
      screenLoading: true,
      allScreenObj: null,
      allWindowObj: null,
      desktopCapturer: this.$electron.desktopCapturer,
      electronScreen: this.$electron.screen
    }
  },
  computed: {

  },
  methods: {
    gotScreen() {
      let that = this;
      // const thumbSize = this.determineScreenShotSize()
      let options = { types: ['screen', 'window'] };
//      that.desktopCapturer.getSources(options, function (error, sources) {
//        if (error) return console.log(error)
//        that.allScreenObj = sources;
//        console.log('source===>', that.allScreenObj)
//        that.screenLoading = false;
//      })
       that.desktopCapturer.getSources(options)
       .then(async sources => {
         that.allScreenObj = sources;
//         sources.forEach(function (source) {
//           console.log('source===', source)
//         })
         console.log('source===>', sources)
         that.screenLoading = false;
       })
       .catch (err => {
         console.error(err)
       })
    },
    shareScreen(source) {
      rtc.startScreenShare(source.id)
      this.$emit('emitlistenScreenShareMode', 'screen'); // 向父组件传值
    },

    gotStream(stream) {
      document.querySelector('video').src = URL.createObjectURL(stream);
    },
    getUserMediaError() {
      console.log('getUserMediaError');
    },
    determineScreenShotSize() {
      const that = this;
      const { width, height } = that.electronScreen.getPrimaryDisplay().workAreaSize
      const maxDimension = Math.max(width, height)
      return {
        width: maxDimension * window.devicePixelRatio,
        height: maxDimension * window.devicePixelRatio
      }
    }
  },
  mounted() {
    this.gotScreen();
    // const desktopCapturer = this.$electron.desktopCapturer;
    // const electronScreen = this.$electron.screen;
    // const size = electronScreen.getPrimaryDisplay().size;
    // const alldisplays = electronScreen.getAllDisplays();
    // console.log('alldisplays=====', alldisplays)
    // this.allScreenObj = alldisplays;
    // console.log(`当前屏幕是: ${size.width}px x ${size.height}px`)
  },
  destroyed() {
    this.allScreenObj = null;
  },
}
</script>

<style scoped>
.container{
  color: #000;
}
.main-pip{
  min-height: 200px;
  text-align: center;
}
.screen-title{
  font-size: 22px;
  text-align: center;
  margin-bottom: 20px;
}
.screen-priew{
  cursor: pointer;
  position: relative;
  white-space: nowrap;
  display: inline-block;
  margin: 5px;
  width: 120px;
  /* height: 120px; */
}
.screen-priew img{
  max-width: 100%;
  max-height: 100%;
}
.screen-name{
  overflow: hidden;
  text-overflow: ellipsis;
  color: #000;
  display: block;
  text-align: center;
}
</style>

