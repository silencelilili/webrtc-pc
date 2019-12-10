<template>
  <div class="Sidebar">
    <Drawer width="26%" title="设置" placement="left" :closable="true" v-model="setting">
      <ul class="left_menu">
        <!-- <li @click="twoSidebarShow('login')">
          <template v-if="!$store.state.isLoggedIn">
            <i class="fa fa-user"></i>未登录
          </template>
          <template v-if="$store.state.isLoggedIn">
            <i class="fa fa-user"></i>{{loginData.realName}}
          </template>
        </li> -->
        <li @click="twoSidebarShow('video')">
          <i class="fa fa-video-camera"></i>摄像头
        </li>
        <li @click="twoSidebarShow('audio')">
          <i class="fa fa-microphone"></i>音频
        </li>
        <li @click="twoSidebarShow('definition')">
          <i class="fa fa-rss"></i>呼叫速率
        </li>
        <li @click="twoSidebarShow('fullpresentation')">
          <i class="fa fa-laptop"></i>观看全动态演示内容
        </li>
        <li @click="twoSidebarShow('server')">
          <i class="fa fa-cogs"></i>设置服务器
        </li>

        <li v-if="$store.state.isLoggedIn" class="logout-menu">
          <el-button type="text" @click="logoutFn()">退出登录</el-button>
        </li>
      </ul>
    </Drawer>
    <Drawer
      width="26%"
      :title="twoTitle"
      placement="left"
      :closable="true"
      v-model="twoShow"
      :mask-closable="true"
      @on-close="hideTwo()"
    >
      <!-- <Login ref="login" :loginShowAfter="loginShowAfter"/> -->
      <!-- <router-view name="helper" /> -->
      <VideoPage v-if="type==='video'"/>
      <AudioPage v-if="type==='audio'"/>
      <DefinitionPage v-if="type==='definition'"/>
      <ServerPage v-if="type==='server'"/>
      <PresentationPage v-if="type==='fullpresentation'"/>

      <!--<div class="back">-->
        <!--<i class="fa fa-arrow-left" @click="hideTwo()"></i>-->
      <!--</div>-->
    </Drawer>
  </div>
</template>

<script>
// import Login from "./Login.vue";
import VueCookies from "vue-cookies";
import { common } from "@/util/common.js";
import { xmpp } from '@/util/xmpp';
import ElCookie from '@/util/elcookie.js'
import { ucApi } from '@/server/ucapi'


import VideoPage from './sidebar/VideoPage.vue'
import AudioPage from './sidebar/AudioPage.vue';
import DefinitionPage from './sidebar/DefinitionPage.vue';
import ServerPage from './sidebar/ServerPage.vue';
import PresentationPage from './sidebar/PresentationPage.vue';



export default {
  name: "Sidebar",
  props: {},
  data() {
    return {
      setting: false,
      twoShow: false,
      loginData: common.getLoginMsg(),
      twoTitle: "",
      type: ''
    };
  },
  components: {
    VideoPage,
    AudioPage,
    DefinitionPage,
    ServerPage,
    PresentationPage
  },
  computed: {
    isLogined(){
      return this.$store.getters.getIsLoggedIn
    }
  },

  methods: {
    settingShow() {
      this.setting = true;
    },

    twoSidebarShow(name) {
      this.type = name;
      switch (name) {
        // case "login":
        //  !!this.isLogined ? (this.twoTitle = "个人信息") : (this.twoTitle = "登 录");
          // (this.loginData = common.getLoginMsg()),
          //   !this.loginData
          //     ? (this.twoTitle = "登陆")
          //     : (this.twoTitle = "个人信息");
          // break;
        case "video":
          this.twoTitle = "摄像头设置";
          break;
        case "audio":
          this.twoTitle = "音频设置";
          break;
        case "definition":
          this.twoTitle = "呼叫速率";
          break;
        case "server":
          this.twoTitle = "设置服务器";
          break;
        case "fullpresentation":
          this.twoTitle = "设置";
          break;
        default:
          break;
      }
      this.twoShow = true;
      // alert("/home/sidebar/" + name)
      // this.$router.push("/" + name);
    },

    //隐藏侧边栏的二级目录
    hideTwo() {
        this.type = '';
      // this.$router.replace("/home");
      // this.$router.go(-1)
    },

    /** 退出登录 */
    logoutFn() {
        const _this = this;
        // 通知主进程
        const ipc = this.$electron.ipcRenderer;
        ipc.send('logout-dialog')
        ipc.on('logout-dialog-selection', (event, index) => {
            console.log(index)
          // 选择的 确定
          if(index === 0) {
            _this.sureLogoutFn();
          }
        })
    },
    // 确定退出登录
    sureLogoutFn() {
      let loadingInstance = this.$loading({fullscreen: true,text: '正在退出登录...', spinner: 'el-icon-loading', background: 'rgba(0, 0, 0, 0.7)'})
      ucApi.logout()
        .then(res => {
          common.deletAllLoginData(); //清除所有保存的登录信息
          ElCookie.clearCookies()
          this.$notification('退出登录成功', 'success');
          this.$store.commit("setIsLoggedIn", false);
          this.$store.dispatch('asyncLoginData', {});
          // 退出登录成功后返回到index
          this.setting = false;
          this.$router.push('/home');

          // 退出登录成功后的用户 断开xmpp连接
          xmpp.disConnectXmpp();
          this.$nextTick(() => { // 以服务的方式调用的 Loading 需要异步关闭
            loadingInstance.close();
          });
          ElCookie.clearCookies()
        }).catch(error => {
          let { msg } = error.response.data;
          loadingInstance.close();
          console.log(msg);
        });
    },
  },
  watch: {
    $route(now, old) {
      //监控路由变换，控制二级目录的显示
      if (now.path == "/home") {
        this.twoShow = false;
        this.loginData = common.getLoginMsg();
      }
    }
  },
  created() {
    console.log("创建【sidebar】组件");
  },
  mounted() {
    console.log("【sidebar】组件加载完成");
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.left_menu li {
  font-size: 16px;
  line-height: 60px;
  padding-left: 20px;
}
.left_menu li:hover {
  cursor: pointer;
}
.left_menu li i {
  margin-right: 5px;
  font-size: 18px;
  width: 20px;
}
.back {
  position: absolute;
  bottom: 0;
  width: 100%;
  left: 0;
}
.back i {
  font-size: 20px;
  margin: 5px 5px 5px 15px;
  padding: 5px 8px;
  cursor: pointer;
}
.logout-menu{
  text-align: center;
  margin-left: -20px;
}
</style>
