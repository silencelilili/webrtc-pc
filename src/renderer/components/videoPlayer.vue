<template>
    <div>
        <video ref="videoPlayer" class="video-js videoStyle">
            <source :src="liveUrl" type="application/x-mpegURL">
        </video>
    </div>
</template>

<script>
import videojs from 'video.js';
import { CaptionParser } from 'mux.js/lib/mp4';

const captionParser = new CaptionParser();

// initalize the CaptionParser to ensure that it is ready for data
if (!captionParser.isInitialized()) {
  captionParser.init();
}
export default {
  name: "VideoPlayer",
  props: {
      options: {
          type: Object,
          default() {
              return {};
          }
      },
      liveUrl: {
          type: String,
          default() {
              return '';
          }
      }
  },
  data() {
      return {
          player: null
      }
  },
  mounted() {
    this.player = videojs(this.$refs.videoPlayer, this.options, function onPlayerReady() {
        console.log('onPlayerReady', this);
        this.on('play', function () {
            console.log('正在播放');
        });
        //暂停--播放完毕后也会暂停
        this.on('pause', function() {
            console.log("暂停中")
        });
        // 结束
        this.on('ended', function() {
            console.log('结束');
        })
        this.on('error', function () {
            console.log('错误');
        })
      })
  },
  beforeDestroy() {
      if (this.player) {
          this.player.dispose()
      }
  }
}
</script>

<style>
 .videoStyle{
    width: 100%;
    height: 600px;
  }
</style>