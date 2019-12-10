
import Vue from 'vue'
import Vuex from 'vuex'
import { xmpp } from '@/util/xmpp.js'
// import { common } from '@/util/common.js'
import { environment } from '@/config/environment'
import settings  from '@/util/webrtc/RTCSettings'

import devicesInfo from './modules/devicesInfo'
import userCookies from './modules/userCookies'
import ElCookie from '@/util/elcookie'

Vue.use(Vuex);


//要设置的全局访问的state对象
const state={
  /**
   * 登录状态
   * 根据storage中的'uc_isLogin'和'uc_access_token'来判断是否登录
   */
  isLoggedIn: JSON.parse(localStorage.getItem('uc_isLogin')) && JSON.parse(localStorage.getItem('uc_access_token')), //$cookies.isKey('uc_isLogin') && $cookies.isKey('uc_access_token'),
  loginState: 'false',
  /**
   * 登录用户的信息
   * 保存用户信息
   */
  loginData: JSON.parse(localStorage.getItem('uc_loginData')),
  /**
   * xmpp账号信息
   * 当前用户的xmpp连接所需要的信息
   * 已登录用户/匿名用户
   */
  xmppCookieData: JSON.parse(localStorage.getItem('xmppCookieData')),//$cookies.get('xmppCookieData'),
  /**
   * 服务地址
   * 通过页面可修改服务器地址
   */
  serverAddress: environment.apiBase, //process.env.VUE_APP_BASE_URL, // 'https://pre.svocloud.com',
  /**
   * 呼叫速率
   * 用户选择的呼叫速率（带宽）
   */
  resolution: parseInt(localStorage.getItem('defaultBandwidth')) || settings.defaultBandwidth,
  /**
   * 是否观看全动态演示内容
   */
  fullMotion: parseInt(localStorage.getItem('enableFullMotion')) || settings.enableFullMotionPresentation,
  /**
   * 本地扬声器音量
   * 0: 无声音；1:有声音
   */
  localVolume: 1,
  /**
   * 会议信息
   * 当前所加入的会议相关信息
   */
  conferences: {},
  /**
   * 会议权限
   * 当前登录用户对当前会议所拥有的操作权限
   */
  conferenceRole: {},
  /**
   * 参会者列表
   * 当前会议所有参会者（在线/离线）
   */
  participants: [],
  /**
   * 右侧侧边栏是否显示
   * 默认：true
  */
  sideBarState: true,
  /**
   * 收到呼叫消息
   * 默认：null
   */
  incommingCalled: {},
  /**
   * 加入会议进度条
   * 默认：false
   */
  joinProgress: false,

  /**
   * 当前是否已经入会
   * 默认：false
   */
  isJoined: false,
};
//实时监听state值的变化(最新状态)
const getters = {
  xmppInit(state){
    if(state.loginData){
      xmpp.createData(state.xmppCookieData, state.conferences.conference.vmrNumber, true);
    }else{
      xmpp.disConnectXmpp();
    }
  },
  xmppPcInit(state){
    if(state.loginData){
      xmpp.createData(state.xmppCookieData);
    }else{
      xmpp.disConnectXmpp();
    }
  },
  getIsLoggedIn(state) {  //承载变化的isLoggedIn的值
    return state.isLoggedIn
  },
  getLoginData(state) {
      return state.loginData;
  },
  getServerAddress(state) {
    return state.serverAddress;
  },
  getConferenceData(state) {
    return state.conferences;
  },
  getConferenceRoleData(state) {
    return state.conferenceRole;
  },
  getParticipantsData(state) {
    return state.participants;
  },
  getLocalVolume(state) {
    return state.localVolume;
  },
  getResolution(state) {
    return state.resolution;
  },
  getFullMotion(state) {
    return state.fullMotion;
  },
  getSideBarState(state) {
    return state.sideBarState;
  },
  getIncommingCalled(state) {
    return state.incommingCalled;
  },
  getJoinProgress(state) {
    return state.joinProgress;
  },
  getIsJoined(state) {
      return state.isJoined;
  }
};
// 同步事务
//改变state初始值的方法，这里面的参数除了state之外还可以再传额外的参数(变量或对象);
const mutations = {
  setIsLoggedIn(state,status) {
    state.isLoggedIn = status;
  },
  setLoginData(state,userData){
    state.loginData = userData;
    // console.log('loginData ======',state.loginData)
  },
  // 监听设置xmpp账号信息
  setXmppData(state, data){
    state.xmppCookieData = data;
  },
  // 监听设置服务地址
  setServerAddress(state, value) {
    state.serverAddress = value;
  },
  // 监听设置呼叫速率
  setResolution(state, value) {
    state.resolution = value;
  },
  // 监听是否全帧速率显示双流
  setFullMotion(state, value) {
    state.fullMotion = value;
  },
  setLocalVolume(state, value) {
    state.localVolume = value;
  },
  // 监听设置会议信息
  setConferencesData(state, data) {
    state.conferences = data;
  },
  setConferenceRoleData(state, data) {
    state.conferenceRole = data;
  },
  setParticipantsData(state, data) {
    state.participants = data;
  },
  setSideBarState(state, value) {
    state.sideBarState = value;
  },
  setIncommingCalled(state, value) {
    state.incommingCalled = value;
  },
  setJoinProgress(state, value) {
   state.joinProgress = value;
  },
  setIsJoined(state, value) {
    state.isJoined = value;
  }
};
// 异步事务
// 自定义触发mutations里函数的方法，context与store 实例具有相同方法和属性
const actions = {
  asyncSetLogined(context, data) {
    return new Promise((resolve, reject) => {
        ElCookie.getCookies('el_islogin').then(res=>{
            console.log(res)
            context.commit('loginState', res);
            resolve(res)
        })
        .catch(err => {
            reject(err)
        })
    })
  },
  // 异步更改登录数据
  asyncLoginData(context, userData) {
    context.commit('setLoginData', userData);
  },
  asyncXmppData(context, data) {
    context.commit('setXmppData', data);
  },

  asyncConferenceData(context, data) {
    context.commit('setConferencesData', data);
  },
  asyncConferenceRoleData(context, data) {
    context.commit('setConferenceRoleData', data);
  },
  asyncParticipantsData(context, data) {
    context.commit('setParticipantsData', data);
  },
  asyncIncommingCalled(context, data) {
    context.commit('setIncommingCalled', data)
  }
};


const store = new Vuex.Store({
    strict: process.env.NODE_ENV !== 'production', // 关闭 Vuex 的『严格模式』
    modules: {
      devicesInfo,
      userCookies
    },
    state,
    getters,
    mutations,
    actions
 });

export default store;
