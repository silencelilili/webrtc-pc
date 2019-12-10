<template>
  <div class="container">
    <div class="main-pip">
      <!--  && !presentationVideoSrc -->
        <img id="presentationImg" v-show="presentationImgSrc" class="presentation-image" :src='presentationImgSrc'/>
        <video v-show="presentationVideoSrc && presentationVideoSrc != {} && !presentationImgSrc" autoplay id="presentationVideo"></video>
        <div class="presentation-name">共享显示源：{{presentationName}}</div>
    </div>
  </div>
</template>

<script>

export default {
  name: "presentation",
  data () {
    return {
      presentationImgSrc: '',
      presentationVideoSrc: {},
      presentationName: ''
    }
  },
  computed: {

  },
  methods: {

  },
  watch: {

  },
  mounted() {
    const _this = this;
    const globalService = this.$electron.remote.getGlobal('presentationObj');
    const globalScreenService = this.$electron.remote.getGlobal('screenStreamObj');
    this.presentationImgSrc = globalService.src;
    this.presentationVideoSrc = globalService.videosrc;
    this.presentationName = globalService.name;
    // console.log(globalService)
    // if(this.presentationVideoSrc){
    //   const _screendom = document.querySelector("#presentationVideo")
    //   _screendom.srcObject = this.presentationVideoSrc;
    // }
    // if(globalScreenService){
    //   const _screendom = document.querySelector("#presentationVideo")
    //   _screendom.srcObject = globalScreenService;
    // }

    const ipc = this.$electron.ipcRenderer;
    ipc.on('presentationObj', function (event, data) {
      _this.$nextTick(()=>{
        // _this.globalService = data;
        console.log('presentationObj======', data)
        _this.presentationImgSrc = data.src;
        _this.presentationVideoSrc = data.videosrc;
        _this.presentationName = data.name;
        // if(_this.presentationVideoSrc){
        //   const _screendom = document.querySelector("#presentationVideo")
        //   _screendom.srcObject = _this.presentationVideoSrc;
        // }
      })
    })
    ipc.on('screenStreamObj', function (event, data) {
        _this.$nextTick(()=>{
          console.log('accept-share-screen=====', data)
          const _screendom = document.querySelector("#presentationVideo")
        _screendom.srcObject = data;
        })
    })
    // console.log(this.$electron)
  },
  destroyed() {

  },
}
</script>

<style scoped>
.main-pip{
  position: absolute;
  width: 100%;
  height: 100%;
  background: #000;
  text-align: center;
}
.main-pip video{
  width: 100%;
}
.presentation-name{
  position: absolute;
  bottom: 10px;
  left: 10px;
}
.presentation-image{
  max-width: 100%;
  max-height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto;
}
</style>

