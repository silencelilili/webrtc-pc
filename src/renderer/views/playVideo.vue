<template>
  <div class="play-video">
    <h4 class="conferenceName"></h4>
    <video id="videoCon" :width="videoSize[0]-100" :height="videoSize[1]-50" controls autoplay>
        <source :src="address" type="video/mp4" >
    </video>
  </div>
</template>
<script>
export default {
  name: 'playvideo',
  data() {
    return {
      address: '',
      videoSize: [1080,720]
    }
  },
  watch: {
    
  },
  mounted() {
    const _this = this;
    const curwin = _this.$electron.remote.getCurrentWindow()
    _this.videoSize = curwin.getSize();

    _this.address = _this.$electron.remote.getGlobal('videoPlayPath');

    // 监听主进程中的值，改变独立窗口的状态
    _this.$electron.ipcRenderer.on('send-playVideoWin',(event, data) =>{
      console.log('获取到的是主进程中 playVideoWin 传过来的videoPath====', data)
      _this.$nextTick(() =>{
        _this.address = data;
      })
    })
  },
}
</script>

<style scoped>
  .play-video{
    width: 100%;
    background: #000;
    text-align: center;
    height: 100%;
    position: absolute;
  }
</style>

