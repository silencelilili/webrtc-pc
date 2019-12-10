<template>
<!-- 观看全动态演示内容 -->
  <div class="definitionPage">
    <div class="sidebar-left line-form">
      <span>观看全动态演示内容： </span>
      <el-switch
        v-model="isEnable"
        @change="changeStatus">
      </el-switch>
    </div>
    
  </div>
</template>

<script>
import { common } from '@/util/common';
import setting from '@/util/webrtc/RTCSettings'

export default {
  name: "presentationPage",
  data() {
    return {
      isEnable: common.getLocstorage('enableFullMotion') || setting.enableFullMotionPresentation
    }
  },
  methods: {
    changeStatus() {
      console.log('enableFullMotionPresentation====>', this.isEnable)
      this.$store.commit("setFullMotion", this.isEnable);
      common.setLocstorage('enableFullMotion', this.isEnable)
      this.$router.push("/home");
    }
  }
};
</script>

<style scoped>
  
</style>