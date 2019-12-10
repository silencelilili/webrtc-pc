<template>
  <el-container v-loading="joinProgress"
  element-loading-text="正在入会..."
  element-loading-spinner="el-icon-loading"
  element-loading-background="rgba(0, 0, 0, 0.7)"
  element-loading-customClass="loading-style">
    <el-aside class="full-height fixed" width="80px">
      <el-menu
        class="side-menu"
        background-color="#303847"
        text-color="#fff"
        active-text-color="#ffd04b" >
          <el-menu-item>
            <router-link :to="{ path: '/conference' }">
              <i class="el-icon-menu"></i>
              <span class="menu-title">会议</span>
            </router-link>
          </el-menu-item>
          <el-menu-item>
            <router-link :to="{ path: '/index' }">
              <i class="el-icon-service"></i>
              <span class="menu-title">入会</span>
            </router-link>
          </el-menu-item>
          <el-menu-item @click="handleSetting()">
            <i class="el-icon-setting" title="设置"></i>
            <span class="menu-title">设置</span>
          </el-menu-item>
        </el-menu>
        <div class="setup">
          <i class="fa fa-user" @click="handleUserInfo()"></i>
        </div>
    </el-aside>

    <el-main class="container full-height">
      <!-- <Index /> -->
      <router-view></router-view>
    </el-main>


    <Sidebar ref="sidebar"/>
    <LoginPage ref="login"/>

    <!-- <template v-if="joinProgress">
      <div class="join-progress">
        <el-progress type="circle" :percentage="percentageVal"></el-progress>
      </div>
    </template> -->
    <template>
      <component v-show="false" :is="currentComponent"></component>
    </template>

    <!-- 收到呼叫邀请 入会 -->
    <el-dialog
      title="呼叫信息"
      :visible.sync="callModal"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :modal-append-to-body="true"
      :append-to-body="true"
      width="30%"
      top="5vh"
      custom-class="call-modal"
      center>
      <h4 class="text-center called-name">{{callModalData.conferenceName}}</h4>
      <p class="text-center">邀请您加入会议......</p>
      <div v-if="callModal">
        <audio autoplay loop>
          <!--type="audio/mpeg"-->
          <source src="../assets/sources/incoming.wav">
        </audio>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="danger" @click="callModal = false">拒绝</el-button>
        <el-button type="primary" @click="acceptCallFn()">同意</el-button>
      </span>
    </el-dialog>



    <el-dialog
      title="检测更新"
      :visible.sync="updateDialogVisible"
      width="30%"
      center>
      <span>{{updateContent.msg}}</span>
      <p>最新版本：V{{updateContent.version}}</p>
      <p v-show="downloadPercent>0">
        <span>{{updateStatusTxt}}</span>
        <el-progress :text-inside="true" :stroke-width="18" :percentage="downloadPercent"></el-progress>
      </p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelUpdate()">取 消</el-button>
        <el-button type="primary" @click="updateExe()">更 新</el-button>
      </span>
    </el-dialog>
    <!--<Update ref="update" :show.sync="updateDialogVisible" :percent="downloadPercent" :updateMsg="updateContent"/>-->
  </el-container>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import { common } from '@/util/common'
import { tokenService } from '@/util/tokenService'
import { eventBus } from '@/config/eventbus'

import Sidebar from '@/components/Sidebar.vue'
import LoginPage from '@/components/LoginPage.vue'


export default {
  name: 'home',
  data() {
    return {
      currentComponent: '',

      // 被叫入会modal
      callModal: false,
      callModalData: {},
      refreshInterval: null,
      percentageVal: 0, // 加入会议进度
      // 更新应用程序
      updateDialogVisible: false,
      updateContent: {
          version: '0.0.0',
          msg: ''
      },
      downloadPercent: 0,
      updateStatusTxt: '',

    }
  },
  components: {
    Sidebar,
    LoginPage,
    JoinMeeting: () => import('../components/JoinMeeting')
  },
  computed: {

    isIncommingCall() {
      return this.$store.getters.getIncommingCalled;
    },
    isAnonymous(){
      return this.$store.getters.getIsLoggedIn && this.$store.getters.getLoginData
    },
    joinProgress: {
      get(){
        return this.$store.getters.getJoinProgress;
      },
      set(){
      }
    },
  },
  methods: {
    // 设置 控制子组件
    handleSetting() {
      // this.$router.push('/sidebar')
      this.$refs.sidebar.settingShow();
    },
    handleUserInfo() {
      this.$refs.login.settingShow();
    },


    // 被呼入会 - 同意邀请入会
    acceptCallFn() {
      this.currentComponent = 'JoinMeeting';
      const meetingData = {
        conference: this.callModalData.roomNumber,
        pin: this.callModalData.password || ''
      }
      setTimeout(() => {
        // 触发 eventbus 的 requestJoinMeeting 事件，传递参数 meetingData。
        eventBus.$emit('requestJoinMeeting', meetingData)
      }, 800);
      this.callModal = false;
    },
    // 自动更新应用程序
    autoUpdate() {
      const that = this;
      that.$electron.ipcRenderer.send('update-app');
    },
    // 确认更新
    updateExe() {
      this.$electron.ipcRenderer.send('updateNow');
    },
    //  取消更新
    cancelUpdate() {
        this.updateStatusTxt = '';
        this.downloadPercent = 0;
        this.updateDialogVisible = false
    }
  },
  watch: {
    isIncommingCall: {
      handler(curval) {
        const _value = curval;
        if(!this.$store.getters.getIsJoined) {
          this.callModal = true;
          this.callModalData = _value;
          // 30s后关闭提示框
          setTimeout(()=>{
              this.callModal = false;
              this.callModalData = {}
          }, 30000)
        }

      },
      deep:true
    },
    joinProgress(val){
      const that = this;
      if(!val){
        // that.percentageVal = 0;
        that.$store.commit("setJoinProgress", false);
        that.joinProgress = false;
      }
      // if(val === true){
      //   const percentageInterval = setInterval(() => {
      //     that.percentageVal ++
      //     if(that.percentageVal == 100) {
      //       that.percentageVal = 0;
      //       that.$store.commit("setJoinProgress", false);
      //       that.joinProgress = false;
      //       clearInterval(percentageInterval)
      //     }
      //   }, 55);
      //   that.$once('hook:beforeDestroy', () => {
      //     clearInterval(percentageInterval);
      //   })
      // }else{
      //   that.percentageVal = 0;
      //   that.$store.commit("setJoinProgress", false);
      //   that.joinProgress = false;
      // }
    }
  },
  created() {

    console.log("进入【home】组件");
  },
  mounted() {
    const that = this;
    const ipcRenderer = this.$electron.ipcRenderer;
    // 已登录用户 连接xmpp，并开始定时刷新token
    if(!!this.isAnonymous){
        ipcRenderer.on("check-token", (event, data)=> {
        console.log('从主进程====>检查 refreshToken');
        tokenService.refreshToken()
      });
      // 连接xmpp
      this.$store.getters.xmppPcInit;
      //  定时刷新token
      const expires = common.getLocstorage('uc_expires_in');
      const interTime = parseInt((expires * 1000 / 3).toFixed());
      this.refreshInterval = setInterval(() =>{
        tokenService.refreshToken()
        console.log('定时刷新 refreshToken');
      }, interTime)
    };

    // 监听主进程的更新应用程序message
    ipcRenderer.on('update-message', (event, data) => {
        that.$nextTick(() => {
            console.log('update-message====>', data);
            switch (data.status) {
              case -1: // 当前版本为最新版本
                  that.$alert( data.msg, '检查更新', {
                      confirmButtonText: '知道了',
                      center: true,
                      showClose: false,
                      callback: action => {
                      }
                  });
                  break;
              case 0: // 正在检查应用程序更新
                  break;
              case 1:  // 检测到新版本，是否现在更新
                  that.updateDialogVisible = true;
                  that.updateContent = data;
                  break;
              case 3:
                  that.updateStatusTxt = data.msg;
                  that.downloadPercent = parseInt(data.progress.percent) || 0;
                  break;
              case 4:
                  that.updateStatusTxt = data.msg;
                  break;
            }
        })
    })

    // 清除缓存
    ipcRenderer.on('clear-cache', (event, data) => {
      if(that.refreshInterval) {
        clearInterval(that.refreshInterval)
        that.refreshInterval = null
      }
      common.deletAllLoginData();

      that.$store.commit("setIsLoggedIn", false);
      that.$store.dispatch('asyncLoginData', {});
      that.$router.push('/home');
    });

    console.log("【home】组件加载完成");

  },
  beforeDestroy() {
    //组件销毁前移除所有事件监听channel
    // remove只能移除单个事件，单独封装removeAll移除所有事件
    this.$electron.ipcRenderer.remove("update-message");
    this.$electron.ipcRenderer.remove("clear-cache");
  },
  destroyed() {
    // 组件注销清楚定时器
    if(this.refreshInterval) {
      clearInterval(this.refreshInterval)
      this.refreshInterval = null
    }
    console.log("【home】组件销毁");

  }

}
</script>

<style scoped>
  .el-aside{
    /* position: fixed; */
    /* height: 100%; */
    background: #303847;
    padding: 22px 0;
  }
  .el-main{
    width: 100%;
    background: #303847;
    padding: 0;
  }
  .container{
    background: #edf4f5;
    color: #272727;
    /* height: 100%; */
    /* position: fixed; */
    margin-left: 80px;
  }

.setup {
  height: 50px;
  width: 50px;
  position: absolute;
  bottom: 10px;
  left: 15px;
  line-height: 50px;
  background-color: #303847;
}
.setup i{
  font-size: 32px;
  /* position: absolute; */
  /* top: 15px; */
  /* bottom: 15px;
  left: 27px; */
  width: 100%;
  height: 100%;
  text-align: center;
  color: #b9b9b7;
  cursor: pointer;
  border: 1px solid #b9b9b7;
  border-radius: 50%;
  padding: 8px;

}

.side-menu .el-menu-item{
  padding: 5px !important;
  text-align: center;
  line-height: 20px;
}
.side-menu .menu-title{
  display: block;
  color: #fff;
}


.join-progress{
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translateY(-50%) translateX(-50%);
}
.loading-style{
  font-size: 20px;
}
</style>


