<template>
    <div>
      <div class="page-header">直播列表</div>

      <div id="live" class="white-bg" v-if="liveListData && liveListData.length>0">
        <div class="">
          <div class="media live-list" v-for="list in liveListData" :key="list.id"> 
            <el-row>
              <el-col :span='6'>
                <div class="media-left media-middle">
                  <b v-if="list.pwd" class="red fa fa-lock"></b>
                  <a href="javascript:;"><img class="media-object" src="../assets/img/vcs/live_media.png"></a>
                </div>
              </el-col>
              <el-col :span='5'>
                <h4 class="media-heading">{{list.name}}</h4>
                <p class="gray">{{list.startTime | date('yyyy-MM-dd HH:mm')}}</p>
              </el-col>
              <el-col :span='5'>
                <h4 v-if="list.type==1" class="color-svoc">未开始</h4>
                <h4 v-if="list.type==0" class="red">直播中</h4>
                <p class="gray">发起人：{{list.user}}</p>
              </el-col>
              <el-col :span='5'>
                <p class="gray"> <span class="gray" v-if="list.type==1"> 距离直播开始：{{list.startTime | getLongTimes }}</span></p>
              </el-col>
              <el-col :span='3'>
                <a target="_blank" @click="openWtchLive(list.vmrNumberCry)" class="btn btn-svoc radius20">观看直播</a>
              </el-col>
            </el-row>
          </div>
        </div>
      </div>
      <template v-else>
        <div class="text-center no-data" style="margin-top:15%;">
          <img src="../assets/img/vcs/no_live_data.png"/>
          <p>无直播记录</p>
        </div>
      </template>

    </div>
</template>

<script>
import { common } from "@/util/common.js";
import {ucApi} from '@/server/ucapi'

export default {
  name: 'livelist',
  data() {
    return {
      liveListData: [],
      loginData: common.getLoginMsg(),
    }
  },
  
  methods: {
    // 查询企业直播列表
    getLiveListFn() {
      ucApi.getLiveList(this.loginData.entId)
      .then(res => {
        this.liveListData = res;
      })
      .catch(err => {
        console.log('获取数据失败: ', err)
      })
    },
    // 打开观看直播窗口
    openWtchLive(vmrNum){
      this.$electron.ipcRenderer.send('watchlive-window', vmrNum)
    }
  },
  created() {
    
  },
  mounted() {
    this.getLiveListFn()
  },
  destroyed() {
    
  },
}
</script>

<style scoped>
.live-list{
	background:#fff;
	padding:20px;
}
.live-list h4{
	/* margin:20px 0; */
	font-size:14px;
}
.live-list p.gray{
	margin-top:20px;
}
.live-list .media-left{
	position: relative;
}
.live-list .media-left>b{
	position: absolute;
	margin:5px;
	font-size:16px;
}
</style>
