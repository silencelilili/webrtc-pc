<template>
<!-- 登录 -->
  <div class="loginPage">
    <Drawer width="26%" :title="pageTitle" placement="left" :closable="true" v-model="setting">

    <div v-if="!isLogin" class="loginForm">
      <form action="" class="line-form" @keyup.enter="loginSubmit()">
        <p>
          <el-input v-model="loginForm.username" placeholder="请输入邮箱或手机号"></el-input>
        </p>
        <p>
          <el-input v-model="loginForm.password" show-password placeholder="请输入密码"></el-input>
        </p>
        <!-- <p>
          <el-checkbox v-model="loginForm.isKeepLogin" style="color:#f2f2f2;">自动登录</el-checkbox>
        </p> -->
        <label class="red">{{loginMsg}}</label>
        <p style="text-align: center;">
          <el-button class="login-btn" @click="loginSubmit()" type="primary" round :loading="loginLoading">登 录</el-button>
        </p>
      </form>
    </div>
    <div v-if="isLogin" class="userInfo">
      <div class="textItem">
        <label>姓 名:</label>
        <span>{{userInformation.realName}}</span>
      </div>
      <div class="textItem">
        <label>公司/单位:</label>
        <span>{{userInformation.company}}</span>
      </div>
      <div class="textItem">
        <label>邮 箱:</label>
        <span>{{userInformation.email}}</span>
      </div>
      <div class="textItem">
        <label>手机号:</label>
        <span>{{userInformation.mobilePhone}}</span>
      </div>
      <div class="textItem">
        <label>工 号:</label>
        <span>{{loginData.empno}}</span>
      </div>
      <div class="textItem">
        <label>一级部门:</label>
        <span>{{loginData.deptName}}</span>
      </div>
      <div class="textItem">
        <label>二级部门:</label>
        <span>{{loginData.subdeptName}}</span>
      </div>
      <div class="textItem">
        <label>三级部门:</label>
        <span>{{loginData.threedeptName}}</span>
      </div>
      <div class="textItem">
        <label>职 务:</label>
        <span>{{loginData.position}}</span>
      </div>

    </div>
    <!-- <div v-if="loginData" class="logout">
      <el-button type="danger" plain @click="logoutFn()">退出</el-button>
    </div> -->
    </Drawer>
  </div>
</template>

<script>
import { common } from "@/util/common.js";
import ElCookie from '@/util/elcookie.js'
import { ucApi } from '@/server/ucapi'
import {mapState, mapGetters, mapMutations, mapActions} from 'vuex'

export default {
  name: "loginPage",
  props: {},
  data() {
    return {
      setting: false,
      pageTitle: '登录',
      loginForm: {
        captcha: "",
        username: "",
        password: "",
        clientSecret:
        "MIICXQIBAAKBgQCxwfRs7dncpWJ27OQ9rIjHeBbkaigRY4in+DEKBsbmT3lpb2C6JQyqgxl9C+l5zSbONp0OIibaAVsLPSbUPVwIDAQABAoGAK76VmKIuiI2fZJQbdq6oDQ",
        isKeepLogin: true
      },
      loginMsg: "",
      // 用户信息
      userInformation: {},

      // 登录按钮状态
      loginLoading: false
    };
  },
  computed: {
    isLogin(){
      const _isLogin = this.$store.getters.getIsLoggedIn && !!this.$store.getters.getLoginData
      this.pageTitle = _isLogin ? '个人信息' : '登录'
      return _isLogin
    },
    loginData(){
    return this.$store.getters.getLoginData
    }
  },
  methods: {
    settingShow(){
      this.setting = true;
    },
    /** 登录 */
    loginSubmit() {
      const that = this;
      that.loginLoading = true;
      ucApi.login(that.loginForm)
        .then(res => {
          //保存user信息
          common.loginSetData(res);
          that.$notification('登录成功', 'success');
          that.$store.dispatch('asyncLoginData', res);
          that.$store.commit("setIsLoggedIn", true);
          that.loginLoading = false;
          that.loginMsg = "";
          // 登录成功后返回到index
          that.setting = false;
          that.$nextTick(()=>{
            that.$router.push("/conference");
            // location.reload();
          })
          // window.location.reload();

          if(that.loginForm.isKeepLogin) {
            that.saveNameAndPwd();
          }
          // 登录成功后的用户 连接xmpp
          setTimeout(() => {
            that.$store.getters.xmppPcInit;
          });
        })
        .then(()=>{
            that.getUserMessage();
//            that.asyncSetLogined().then(res=>{
//                alert(res)
//            })
        })
        .catch(error=>{
          let { msg } = error;
          that.loginMsg = msg;
          that.loginLoading = false;
        })
    },
    /** 记住密码 */
    saveNameAndPwd() {
      const that = this;
//      ElCookie.setCookie('el_name', that.loginForm.username)
//      ElCookie.setCookie('el_password', that.loginForm.password)
      ElCookie.setCookie('el_islogin', 'true')
    },

    /** 获取已登录用户信息 */
    getUserMessage() {
      ucApi.getUserData(this.loginData.userId)
        .then(res => {
          this.userInformation = res;
          // this.loginData = common.getLoginMsg();
        })
        .catch(error => {

        })
    },
  },
  watch: {
     isLogin(curVal) {
      console.log("登录状态变化", curVal);
      // if(this.isLogin) {
      //   this.getUserMessage();
      // }
    },
    setting(curVal) {
     if(curVal && this.isLogin) {
       this.getUserMessage();
     }
    }
  },
  mounted() {
    console.log("loginPage加载完成");
    if(this.isLogin){
      this.getUserMessage();
    }
  },
  destroyed() {
    // 重置form表单
    this.loginForm = {
        captcha: "",
        username: "",
        password: "",
        clientSecret:
        "MIICXQIBAAKBgQCxwfRs7dncpWJ27OQ9rIjHeBbkaigRY4in+DEKBsbmT3lpb2C6JQyqgxl9C+l5zSbONp0OIibaAVsLPSbUPVwIDAQABAoGAK76VmKIuiI2fZJQbdq6oDQ",
        isKeepLogin: true
      }
  },
};
</script>

<style scoped>
.loginForm {
  margin: 0 auto;
  margin-top: 50px;
  width: 80%;
  position: relative;
}
.loginForm p {
  margin: 30px 0 5px;
  color: #f2f2f2;
  /* text-align: center; */
}
.login-btn{
  width: 70%;
}

.userInfo {
  margin-left: 20px;
}
.userInfo .textItem {
  font-size: 12px;
  line-height: 7vh;
}
.userInfo .textItem label {
    padding-right: 15px;
    min-width: 80px;
    text-align: right;
    display: inline-block;
}
.logout {
  padding-top: 20px;
  text-align: center;
}
</style>
