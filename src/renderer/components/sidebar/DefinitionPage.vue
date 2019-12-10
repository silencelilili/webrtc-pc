<template>
<!-- 呼叫速率 -->
  <div class="definitionPage">
    <div class="sidebar-left line-form">
      <span>选择呼叫速率</span>
      <el-select v-model="resolution" placeholder="请选择呼叫速率" @change="setResolution">
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
    </div>
    
  </div>
</template>

<script>
import { common } from '@/util/common';
import setting from '@/util/webrtc/RTCSettings'

export default {
  name: "definitionPage",
  data() {
    return {
      options: setting.bandwidths,
      resolution: (common.getLocstorage('defaultBandwidth') || setting.defaultBandwidth) + '' // 默认带宽
    }
  },
  methods: {
    setResolution() {
      console.log('setResolution====>', this.resolution)
      this.$store.commit("setResolution", this.resolution);
      common.setLocstorage('defaultBandwidth', parseInt(this.resolution))
      this.$router.push("/home");
    }
  }
};
</script>

<style scoped>
  
</style>