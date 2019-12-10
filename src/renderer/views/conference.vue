<template>
    <div class="">
      <el-row>
        <el-col class="full-height fixed menu-two-bgcolor" :span='4'>
          <el-menu
          background-color="#dfe4ec"
          text-color="#0000"
          active-text-color="#2d8cf0">
            <el-menu-item>
              <router-link class="menu-two-item" :to="{ path: '/conference/book' }">
                <i class="svoc-color fa icon-book menu-two-icon"></i>
                <span class="menu-two-title">发起会议</span>
              </router-link>
            </el-menu-item>
            <el-menu-item>
              <router-link class="menu-two-item" :to="{ path: '/conference/schedule' }">
                <i class="svoc-color fa icon-schedule menu-two-icon"></i>
                <span class="menu-two-title">会议日程</span>
              </router-link>
            </el-menu-item>
            <el-menu-item>
              <router-link class="menu-two-item" :to="{ path: '/conference/live' }">
                <i class="svoc-color fa icon-live menu-two-icon"></i>
                <span class="menu-two-title">观看直播</span>
              </router-link>
            </el-menu-item>
            <el-menu-item>
              <router-link class="menu-two-item" :to="{ path: '/conference/video' }">
                <i class="fa icon-video menu-two-icon svoc-color"></i>
                <span class="menu-two-title">视频列表</span>
              </router-link>
            </el-menu-item>
            <el-menu-item>
              <router-link class="menu-two-item" :to="{ path: '/conference/room' }">
                <i class="fa icon-room menu-two-icon svoc-color"></i>
                <span class="menu-two-title">云会议室</span>
              </router-link>
            </el-menu-item>
          </el-menu>
        </el-col>

        <el-col :span='20' class="conference-box">
          <div v-if="entStatus===2" style="margin-top: 10px">
            <el-alert title="服务已到期，请联系企业管理员！" type="error" close-text="知道了"> </el-alert>
          </div>

          <router-view> </router-view>
        </el-col>
      </el-row>

      <!-- <div class="join-fixed">
        <el-button type="primary" plain @click="showJoinBox">加入会议</el-button>
      </div> -->

      <!-- <Drawer width="26%" placement="right" :closable="true" v-model="joinMeetingDrawer">
        <template v-if="joinMeetingDrawer" >
          <JoinMeeting ref="joinMeeting"/>
        </template>
      </Drawer> -->
    </div>
</template>

<script>
    import {ucApi} from '@/server/ucapi';
    import { common } from "@/util/common.js";
    import JoinMeeting from '@/components/JoinMeeting.vue'

export default {
  name: 'conference',
  data() {
    return {
      loginUserData: common.getLoginMsg(),
      entStatus: 0,
      joinMeetingDrawer: false,
    }
  },
  components: {
    JoinMeeting
  },
  computed: {

  },
  methods: {
    showJoinBox(){
      this.joinMeetingDrawer = true
    },
     getEntServiceFn() {
         const that = this;
         ucApi.getEntServiceStatus(that.loginUserData.entId)
             .then(res => {
                 let {code, data, msg} = res;
                 that.entStatus = data;
             })
             .catch(err => {
                 console.log('获取企业服务状态失败: ', err)
             })
     }
  },
  watch: {

  },
  created() {

  },
  mounted() {
      this.getEntServiceFn()
    // location.reload()
  },
  destroyed() {
  },
}
</script>

<style scoped>
  .container{
    /* margin-left: 100px; */
  }
  .conference-box{
    position: absolute;
    padding: 0 15px 15px 30px; /* 2% */
    right: 0;
  }
  .menu-two-item{
    display: block;
  }
  .menu-two-title{
    color: #464646;
  }
  .menu-two-icon{
    font-size: 18px;
    /* color: #07a2e8; */
  }
  .join-fixed{
    position: fixed;
    top: 7px;
    right: 15px;
  }
  .join-fixed button{
    width: 140px;
    padding: 15px 0;
  }

</style>
