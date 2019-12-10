<template>
    <div class="container">
        <div style="text-align: right">
            <input v-if="isShowFile" id="input-slide-files" ref="filElem" type="file" multiple style="width:0; height: 0; overflow: hidden" accept="application/pdf, .pdf, image/*" @change="addSlides" />
            <label for="input-slide-files" class='btn btn-success'>
                <el-button type="primary" v-show="slideShareObj.slides.length" @click="deleteAllSlides">清除所有文件</el-button>
                <el-button type="primary" @click="choiceImg">增加文件</el-button>
            </label>
        </div>
        <!-- 预览已选择的图片/文件 -->
        <div style="text-align:center;" >
            <div class="slide-thumbnail" v-for="(slide,index) in slideShareObj.slides" :key="index" :style="{backgroundImage: 'url('+slide.objectURL+')'}">
                <div class="slide-delete" @click="deleteSlide(index)">
                    <i class="tool-icon icon-tool-delete"></i>
                </div>
                <div class="badge-container">
                    <div class="badge blue">
                        {{index + 1}}
                    </div>
                </div>
            </div>
            <!-- 未选择文件时 -->
            <div v-show="!slideShareObj.slides.length && slideShareObj.loadingSlideCount < 1 && !spinner">
                无PDF文件/图片
            </div>
            <div class="slide-thumbnail" v-if="spinner && !slideShareObj.slides.length > 0">
                <img src="../assets/img/spinner-black.svg" style="opacity: .5; margin: 20px auto" class="spinner" />
            </div>
        </div>
        <div slot="footer" style="text-align: right" class="dialog-footer">
            <el-button @click="cancelUpload()">取 消</el-button>
            <el-button type="primary" v-show="slideShareObj.slides.length" @click="slideShareStart()">启动展示</el-button>
        </div>
    </div>
</template>

<script>
import rtc from '@/util/webrtc/lib/svocRTC';
import slideShare from '@/util/webrtc/lib/slideShare';
export default {
  name: 'FileShare',
  data() {
    return {
      spinner: false,
      slideShareObj: {
        slides: slideShare.slides,
        loadingSlideCount: slideShare.loadingSlideCount(),
        currentSlide: 0,
      },
      isShowFile: true
    }
  },
  methods: {
    // 共享
    // 选择共享文件
    choiceImg() {
        const that = this;
        that.isShowFile = true;
        that.$nextTick(() => {
            that.$refs.filElem.dispatchEvent(new MouseEvent('click'))
        })
    },
    addSlides() {
        let that = this;
        const inputFile = this.$refs.filElem.files;
        slideShare.addSlidesFromFiles(inputFile);
        that.spinner = true;
    },
    // 移除某个共享文件
    deleteSlide(index){
        slideShare.deleteSlide(index);
        this.isShowFile = false
        this.spinner = false;
    },
    // 清空已选择的文件
    deleteAllSlides(){
        this.spinner = false;
        slideShare.resetSlideCount();
        // const _data = new Set(slideShare.slides)
        // _data.clear()
        // const newSlide = [...slideShare.slides];
        // newSlide = new Set();
        // 深拷贝
        // slideShare.slides = [...[]]
        this.slideShareObj.slides = slideShare.slides;
        this.isShowFile = false
    },
    // 开始共享
    slideShareStart(){
        let that = this;
        if(slideShare.slides){
            that.currentSlide = 0;
            rtc.imageShareStart(function () {
                setTimeout(() => {
                    that.screenShareMode = 'screen_http';
                    // that.$emit('emitlistenScreenShareMode', 'screen_http'); // 向父组件传值
                    rtc.presentationImgSrc = slideShare.slides[that.currentSlide].dataURL; // that.presentationImgSrc =
                    rtc.imageShareSetImage(slideShare.slides[that.currentSlide].blob)
                    // that.addFileDialog = false;
                    that.$emit('emitlistenFileShareMode', 'screen_http');

                });
            })
        }
    },
    // 下一页
    nextSlide() {
        this.currentSlide = this.slideShareObj.currentSlide = (this.currentSlide + 1) % slideShare.slides.length;
        rtc.presentationImgSrc = slideShare.slides[this.currentSlide].dataURL;
        rtc.imageShareSetImage(slideShare.slides[this.currentSlide].blob);
    },
    // 上一页
    previousSlide() {
        this.currentSlide = this.slideShareObj.currentSlide = (this.currentSlide - 1) % slideShare.slides.length;
        if (this.currentSlide < 0) {
            this.currentSlide = this.slideShareObj.currentSlide = slideShare.slides.length - 1;
        }
        rtc.presentationImgSrc = slideShare.slides[this.currentSlide].dataURL;
        rtc.imageShareSetImage(slideShare.slides[this.currentSlide].blob);
    },
    // 取消共享
    cancelUpload(){
      this.$emit('emitlistenFileShareDialog', false);
      slideShare.resetSlideCount();
    },
  },
  watch: {
    // watch 深度监听
    slideShareObj: {
      handler(curval) {
        // console.log(curval)
        this.slideShareObj = curval;
        this.loadingCount += 1;
        this.$emit('emitSlideShareObj', curval);
        console.log('深度监听 slideShareObj-----', curval)
      },
      deep:true,
      immediate: true
    },
    /*
    slideShare: {
      handler(curval) {
        console.log('深度监听 slideShare-----',curval)
        this.slideShareObj.slides = curval.slides
      },
      deep:true
    },
    'slideShare.loadingSlideCount': {
        handler(curval) {
        console.log('深度监听 loadingSlideCount-----',curval)
      },
      deep:true
    }
    */
  },
  created() {

  },
  mounted() {

  }
}
</script>

<style scoped>

.slide-thumbnail{
  position: relative;
  display: inline-block;
  width: 160px;
  height: 90px;
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
  margin: 4px;
  border-radius: 2px;
}

.slide-delete {
  display: none;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #212121;
  opacity: .87;
  line-height: 90px;
  font-size: 32px;
  text-align: center;
  text-shadow: 1px 1px 1px black;
  color: white;
  cursor: pointer;
  border-radius: 2px;
}
.slide-thumbnail:hover .slide-delete {
  display: block;
}
.badge-container {
  position: absolute;
  right: -4px;
  bottom: -4px;
  font-weight: bolder;
  text-align: center;
  white-space: nowrap;
  font-size: 10px;
  line-height: 10px;
  overflow: hidden;
}
.badge {
  display: inline-block;
  height: 17px;
  width: 17px;
  line-height: 17px;
  color: #f2f2f2;
  /* padding: 3px; */
  border-radius: 50%;
  -webkit-box-shadow: inherit;
  box-shadow: inherit;
  background-color: #069cf5;
}
</style>
