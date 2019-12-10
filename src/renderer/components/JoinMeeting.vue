<template>
  <div class="joinMeeting">
    <div class="joinForm">
      <h2>加入会议</h2>
      <form action="" class="line-form" @keyup.enter="handleJoinMeetingFn()">
        <p>
          <el-input v-model="meetingInfoData.conference" placeholder="请输入会议号" autocomplete="off"></el-input>
        </p>
        <p>
          <el-input v-model="meetingInfoData.pin" show-password placeholder="请输入会议密码" autocomplete="off" ></el-input>
        </p>
        <p v-if="!$store.state.isLoggedIn">
          <el-input v-model="meetingInfoData.realName"></el-input>
        </p>
        <p>
          <el-button @click="handleJoinMeetingFn()" type="primary">加入会议</el-button>
        </p>
      </form>
    </div>


    <div class="help-center">
      <p @click="joinSupportRoomFn()">
        <img src="../assets/img/vcs/help_center.png" alt="客服支持中心">
        <span>客服支持中心</span>
      </p>
    </div>

  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import { common } from '@/util/common.js';
import rtc from '@/util/webrtc/lib/svocRTC';
import { xmpp } from '@/util/xmpp.js';
import { conferenceApi } from '@/server/api.js';
import { tokenService } from '@/util/tokenService';
import { environment } from '@/config/environment';
import { eventBus } from '@/config/eventbus'



export default {
  name: "joinMeeting",
  data() {
    return {
      userInfoData: this.$store.state.loginData, //用户信息
      divecesIds: {},
      pinRequired: null,
      // 会议信息
      meetingInfoData: {
        realName: '', // 用户姓名
        name: '', // apiuserId
        conference: '',// 会议号 this.meetingInfoData.uri
        host: '', // 请求pex的接口地址  webRtcAddress
        pin: '', // pin
        call_type: 'video',
        bw: 576
      }
    };
  },
  computed: {
    ...mapGetters('devicesInfo', {
      _divecesIds: 'getDevices'
    }),
    ...mapGetters('userCookies', {
      getcookies: 'getAllCookies'
    }),
    isAnonymous(){
      return !!this.$store.getters.getIsLoggedIn && !!this.$store.getters.getLoginData
    }
  },
  watch: {

  },
  methods: {
    // 判断检测是否为匿名入会
    _checkAnonymous() {
      let that = this;
      // 从sessionStorage中 检查是否存在历史呼叫记录
      // this.meetingInfoData.conference = sessionStorage.getItem('prevConferenceNum');
      // 根据状态管理器里的数据判断是否匿名登录
      // let isAnonymous = this.$store.state.isLoggedIn && this.$store.state.loginData;
      // 匿名用户 调用接口获取getJwtToken
      if(!this.isAnonymous) {
        conferenceApi.getJwtTokenNo(this.meetingInfoData.realName)
        .then(res => {
          // 保存xmpp信息
          const _xmppdata = {
            userId: res.userId,
            webRtcAddress: res.webRtcAddress,
            xmppUsername: res.xmppUsername,
            xmppPassword: res.xmppPassword,
            webrtcXmppIp: res.webrtcXmppIp,
            xmppServer: res.xmppServer
          };
          this.$store.dispatch('asyncXmppData', _xmppdata);
          common.setLocstorage('xmppCookieData', _xmppdata);
          this.meetingInfoData.host = res.webRtcAddress;
          this.meetingInfoData.name = res.apiUserId.toString();
          console.log("---- 匿名用户 ----")
        }).then(() =>{
          // 接口获取 turn_server
          conferenceApi.getTurnServer();
        })
      } else {
        // 已登录用户 调用接口获取getJwtToken
        conferenceApi.getJwtToken()
        .then(data => {
          this.meetingInfoData.host = data.webRtcAddress;
          this.meetingInfoData.realName = data.realName;
          this.meetingInfoData.name = data.apiUserId.toString();
        }).then(() =>{
          // 接口获取 turn_server
          conferenceApi.getTurnServer();
        })
        console.log("---- 已登录用户 ----")
      }
    },

    _anonymousJwtToken() {
        return new Promise((resolve, reject) => {
            conferenceApi.getJwtTokenNo(this.meetingInfoData.realName)
                .then(res => {
                    // 保存xmpp信息
                    const _xmppdata = {
                        userId: res.userId,
                        webRtcAddress: res.webRtcAddress,
                        xmppUsername: res.xmppUsername,
                        xmppPassword: res.xmppPassword,
                        webrtcXmppIp: res.webrtcXmppIp,
                        xmppServer: res.xmppServer
                    };
                    this.$store.dispatch('asyncXmppData', _xmppdata);
                    common.setLocstorage('xmppCookieData', _xmppdata);
                    this.meetingInfoData.host = res.webRtcAddress;
                    this.meetingInfoData.name = res.apiUserId.toString();
                    console.log("---- 匿名用户 ----")
                    resolve()
                })
                .catch(err=>{
                    reject()
                })
        })

    },
    _getJwtToken() {
        // 已登录用户 调用接口获取getJwtToken
        return new Promise((resolve, reject) => {
            conferenceApi.getJwtToken()
                .then(data => {
                    this.meetingInfoData.host = data.webRtcAddress;
                    this.meetingInfoData.realName = data.realName;
                    this.meetingInfoData.name = data.apiUserId.toString();
                    resolve()
                })
                .catch(err => {
                    reject()
                })
            console.log("---- 已登录用户 ----")
        })

    },
    /**
     * 加入会议
     * 外部调用加入会议操作
     */
    refHandleJoin(data){
      const _this = this;
      _this.$nextTick(()=>{
        _this.meetingInfoData.conference = data.conference;
        _this.meetingInfoData.pin = data.pin;
        _this.meetingInfoData.host = data.host || _this.meetingInfoData.host;
        console.log('请求加入会议=====>', _this.meetingInfoData.conference)
        _this.handleJoinMeetingFn();
      })
    },

    // 主动加入会议 按钮操作
    handleJoinMeetingFn() {
      const _this = this;
      if(_this.meetingInfoData.conference){
          //  匿名
          if(!_this.isAnonymous) {
              _this._anonymousJwtToken().then(() => {
                  // 接口获取 turn_server
                  conferenceApi.getTurnServer();
                  _this._handleJoinMeetingFn()
              });
          } else {
              _this._getJwtToken().then(() => {
                  // 接口获取 turn_server
                  conferenceApi.getTurnServer();
                  _this._handleJoinMeetingFn()
              });
          }
      }else{
          _this.$notification('会议号不能为空', 'error')
      }
    },

    // 加入会议事件
    _handleJoinMeetingFn() {
      // 当前选择到带宽值
      this.meetingInfoData.bw = this.$store.getters.getResolution;
      if(this.meetingInfoData.conference){
        this.checkJoin();
        this.$store.commit("setJoinProgress", true);
      }else{
        this.$notification('会议号不能为空', 'error')
      }
    },

    // 判断入会方式 并获取会议信息
    checkJoin() {
      let _this = this;
      let joinPromise;
      // 1.加入会议接口请求（匿名 or 已登录）
      if(_this.isAnonymous){
        joinPromise = conferenceApi.join(_this.meetingInfoData.conference, _this.meetingInfoData.pin, _this.userInfoData.entId, 0);
      }else{
        joinPromise = conferenceApi.anonymousLogin(_this.meetingInfoData.conference, _this.meetingInfoData.pin, _this.meetingInfoData.realName);
      }
      // 接口返回200
      joinPromise.then(res => {
        // 2.将加入会议返回的数据 异步保存到状态管理器
        _this.$store.dispatch('asyncConferenceRoleData', res);
        // todo
        // 赋值设备id
        _this.meetingInfoData.audioSourceId = _this._divecesIds.audioSource;
        _this.meetingInfoData.videoSourceId = _this._divecesIds.videoSource;
        // 将设备id传到rtc api中
        // rtc.startCall('video', this._divecesIds.videoSource, this._divecesIds.audioSource);
        // 3.获取当前会议到详细数据
        conferenceApi.conferenceInfo(res.cid)
        .then((res)=>{
          // 成功后 将会议信息异步保存到状态管理器中
          _this.$store.dispatch('asyncConferenceData', res);
          // 初始化rtc api请求，request_token;
          rtc.init(_this.meetingInfoData.host, _this.meetingInfoData.conference, _this.meetingInfoData.name, _this.meetingInfoData.pin, _this.meetingInfoData.bw );
          // 将设备id传到rtc api中
          rtc.startCall('video', _this.meetingInfoData.videoSourceId, _this.meetingInfoData.audioSourceId);
        })
        .then((resdata) => {
          // 匿名用户在加入会议时先连接xmpp
          if(!_this.isAnonymous) {
            // 从状态管理器中获取xmpp连接信息 并初始化连接
            _this.$store.getters.xmppPcInit;
            console.log('匿名用户正在初始化连接xmpp......')
          }
          // 页面路由跳转
          _this.$router.push('/meeting');
          // 加入会议loading状态取消
           _this.$store.commit("setJoinProgress", false);
        }).then((res) => {
          // 加入xmpp房间
          xmpp.joinXmppRoom(_this.meetingInfoData.conference)
          console.log(`xmpp - 我加入了【${_this.meetingInfoData.conference}】房间`)

          // 4.将当前呼叫的会议室加入历史记录，并保存到cookie，便于下次呼叫自动填充
          sessionStorage.setItem('prevConferenceNum', _this.meetingInfoData.conference);
          // 通知主进程 加入会议成功
          _this.$electron.ipcRenderer.send('joined-message', true);
          _this.$store.commit("setIsJoined", true);
        })
        .catch(err => {
            // error处理
            _this.$store.commit("setJoinProgress", false);
            _this.$notification('加入会议失败', 'error')
        });

        // 5.获取参会者列表数据
        conferenceApi.getParticipants(res.cid, _this.meetingInfoData.conference)
        .then(reslist => {
          // 将参会者列表返回的数据 异步保存到状态管理器
          _this.$store.dispatch('asyncParticipantsData', reslist.list);
        })
      }).catch((err) => {
        // error处理
        _this.$store.commit("setJoinProgress", false);
        _this.$notification(err.msg, 'error')
        console.log(err.msg);
      })
    },

    // 定时刷新token
    IntervalRefreshToken() {
      // let _logindata = common.getLocstorage('uc_loginData');
      let expires = common.getLocstorage('uc_expires_in') || 5400;
      setInterval(() =>{
          tokenService.refreshToken();
      }, (expires * 1000) / 3)
    },

    // 获取服务支持中心 配置
    joinSupportRoomFn() {
      const _this = this;
      conferenceApi.getSupportRoom()
          .then(res => {
              const _data = res;
              _this.$nextTick(()=>{
                  _this.meetingInfoData.conference = _data.roomNumber;
                  _this.meetingInfoData.pin = _data.password;
                  _this.meetingInfoData.host = _this.meetingInfoData.host;
                  console.log('请求加入服务支持中心=====>', _data.roomNumber)
                  _this.handleJoinMeetingFn();
              })
          })
          .catch(err => {

          })
    },
  },
  created() {
    console.log("进入【joinMeeting】组件");

    /**
     * 监听 eventBus 的 requestJoinMeeting 方法
     * 参数：data: {会议号，会议密码，请求服务器地址}
     */
    eventBus.$on('requestJoinMeeting', (data)=>{
      // 调用提供给外部使用的加入会议方法
      this.refHandleJoin(data)
    })
  },
  beforeMount(){

  },
  mounted() {
    console.log("【joinMeeting】组件加载完成");
    if(this.isAnonymous){
      this.meetingInfoData.realName = this.userInfoData.realName;
      tokenService.refreshToken().then(()=>{
//        this.checkAnonymous();
      })
    }else{
      this.meetingInfoData.realName = common.createAnonymousName();
//      this.checkAnonymous();
    }

    this.IntervalRefreshToken();
  },
  beforeDestroy() {
    console.log("【joinMeeting】即将销毁");
    eventBus.$off('requestJoinMeeting')
  },
  destroyed() {
    console.log("【joinMeeting】已经销毁");
  },
};
</script>

<style scoped>
.joinMeeting{
  height: 100%;
  /* background: linear-gradient(to bottom, #23384e, #373737); */
  background: #3f4a5d;
  position: relative;
}
.joinForm {
  margin: 0 auto;
  padding-top: 50px;
  width: 90%;
}
.joinForm h2 {
  text-align: center;
  color: #eee;
}
.joinForm p {
  margin: 20px 0;
  text-align: center;
}
.call-modal{
  z-index: 9999;
}
.text-center{
  text-align: center;
}
.called-name{
  font-size: 18px;
  margin: 15px 0;
}
  /*客服支心*/
  .help-center{
    position: absolute;
    bottom: 0;
    /* right: 25%; */
    width: 100%;
    background: #00000063;
    padding: 5px 0;
    text-align: center;
  }
  .help-center p{
    cursor: pointer;
    height: 46px;
    line-height: 46px;
  }
  .help-center p>span{
    color: #f2f2f2;
  }
  .help-center p>img{
    height: 90%;
    vertical-align: middle;
  }
</style>
