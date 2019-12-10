// import axios from 'axios';
import store from '../store/index.js';
import { common } from "../util/common.js";
import { baseConfig } from '../config/baseconfig'
import { post, get, patch, put, _delete } from './axios';

const api_ver = baseConfig.api_version;

export const conferenceApi = {
   $post: post,
   $get: get,
   $patch: patch,
   $put: put,
   $_delete: _delete,
  /**
     * 匿名用户入会逻辑处理
     * 1. 接口获取gwtoken {/uc/toWebRTCIndex/noAuthorized}
     *  返回创建的匿名账号信息，保存到cookie中
     * 2. 登录获取token
     * 3. 加入会议
    */
   getJwtTokenNo(realName) {
     return new Promise((resolve, reject) => {
      const postdata = {realName: realName};
      this.$post(`${api_ver}/toWebRTCIndex/noAuthorized`, postdata)
      .then(res => {
        let {code, data } = res;
        if(code === 200) {
          // 存cookie
          // common.loginSetData(data);
          // $cookies.set('webRtcAddress', data.webRtcAddress, data.expires_in);
          // $cookies.set('JwtToken', data.jwtToken, data.expires_in);
          // $cookies.set('uc_access_token', data.access_token, data.expires_in);
          // $cookies.set('uc_refresh_token', data.refresh_token, data.expires_in);
          // $cookies.set('uc_expires_in', data.expires_in, data.expires_in);

          const _data = [
            {'name': 'webRtcAddress', 'value': data.webRtcAddress},
            {'name': 'JwtToken', 'value': data.jwtToken},
            {'name': 'uc_access_token', 'value': data.access_token},
            {'name': 'uc_refresh_token', 'value': data.refresh_token},
            {'name': 'uc_expires_in', 'value': data.expires_in}
          ]
          _data.forEach((item)=>{
            store.dispatch('userCookies/asynSetCookies', item)
          })

          common.setLocstorage('uc_access_token', data.access_token);
          common.setLocstorage('uc_refresh_token', data.refresh_token);
          common.setLocstorage('uc_expires_in', data.expires_in);

          common.setLocstorage('uc_loginData', data);

          // localStorage.setItem("uc_loginData", JSON.stringify(data));
          resolve(data)
        }
      })
      .catch(error => {
        reject(error)
      })
     })

  },
  // 匿名用户 登录获取token
  anonymousToken() {
    this.$get(`${api_ver}/requestToken`)
    .then(res => {
      let {code, data} = res;
      if(code === 200) {
        // $cookies.set('uc_access_token', data.access_token, data.expires_in);

        common.setLocstorage('uc_access_token', data.access_token)

        store.dispatch('userCookies/asynSetCookies', {name: 'uc_access_token',value: data.access_token})
      }
    })
  },
  //匿名登录加入会议
  anonymousLogin(roomNum, pin, realName) {
    return new Promise((resolve, reject) => {
      const postData = {"roomNumber": roomNum, "password": pin, "realName": realName};
      this.$post(`${api_ver}/conferences/join/anonymous`, postData)
      .then(res => {
        let {code, data} = res;
        if(code === 200) {
          resolve(data);
        }
      })
      .catch(error => {
        reject(error)
      })
    })
  },
/*************************** /匿名用户 登录／入会 **********************/

/*************************** 正常入会接口 **********************/
  //获取turn_server
  getTurnServer() {
    return new Promise((resolve, reject) =>{
      this.$get(`${api_ver}/turnServer`)
      .then(res => {
        let {code, data} = res;
        if(code === 200) {
          // $cookies.set('turnServer', data);
          common.setLocstorage('turnServer', data)

          store.dispatch('userCookies/asynSetCookies', {name: 'turnServer',value: data})
        }
      })
      .catch(error => {
        reject(error)
      })
    })
  },
  getJwtToken() {
    return new Promise((resolve, reject) => {
      this.$get(`${api_ver}/toWebRTCIndex`)
      .then(res => {
        let {data} = res;
        // $cookies.set('webRtcAddress', data.webRtcAddress);
        // $cookies.set('JwtToken', data.JwtToken);
        store.dispatch('userCookies/asynSetCookies', {name: 'webRtcAddress', value: data.webRtcAddress})
        store.dispatch('userCookies/asynSetCookies', {name: 'JwtToken', value: data.JwtToken})
        resolve(data)
      })
      .catch(error => {
        reject(error)
      })
    })
  },

    // 已经登录的用户加入会议
  join(roomNumber, password, entId, source) {
    return new Promise((resolve, reject)=>{
      const postdata = {'roomNumber':roomNumber, 'password':password, source: source, entId: entId};
      this.$post(`${api_ver}/conferences/join`, postdata)
      .then(res => {
        // cb(res);
        let {code, data} = res;
        if(code === 200){
          resolve(data)
        }else{
          reject(error)
        }
      })
      .catch(error => {
        reject(error)
      })
    })

  },

  // 判读会议是否有密码
  existPassword(roomNumber) {
    return new Promise((resolve, reject) => {
      this.$get(`${api_ver}/rooms/${roomNumber}/existPassword`)
      .then(res => {
        let {code, data } = res;
        if(code === 200) {
          resolve(data);
        }
      })
      .catch(error => {
        reject(error)
      })
    })

  },

  // 获取会议信息
  conferenceInfo(cid) {
    return new Promise((resolve, reject)=>{
      this.$get(`${api_ver}/conferences/starting/${cid}`)
      .then(res => {
        const {code, data} = res;
        if(code === 200) {
          resolve(data)
        }
      })
      .catch(error => {
        reject(error)
      })
    })
  },
  // 获取参会者
  getParticipants(cid, roomNum) {
    return new Promise((resolve, reject) => {
      this.$get(`${api_ver}/conferences/${cid}/participant/${roomNum}`)
      .then(res => {
        const {code, data} = res;
        if(code === 200) {
          resolve(data)
        }
      })
      .catch(error => {
        reject(error)
      })
    })
  },
  // 静音/解除静音单个参会者
  setParticipantMute(cid, userId, type) {
    return new Promise((resolve, reject) => {
      const postdata = {"mute": type};
      this.$post(`${api_ver}/conferences/${cid}/mute/${userId}`, postdata)
      .then(res => {
        const {code, data, msg} = res;
        if(code === 200) {
          resolve(data)
        }else{
          reject(msg)
        }
      })
      .catch(error => {
        reject(error)
      })
    })
  },

  // 参会者身份切换
  setRole(cid, user) {
    return new Promise((resolve, reject) => {
      let puuid = user.puuid;
      let postdata; //身份类型：host-4001,visitor-4002
      if(user.role == 4001){
        postdata = {"hostrole": "4002"};
      }else{
        postdata = {"hostrole": "4001"};
      }
      this.$post(`${api_ver}/conferences/${cid}/convert/${puuid}`, postdata)
      .then(res => {
        const {code, data, msg} = res;
        if(code === 200) {
          resolve(data)
        }else{
          reject(msg)
        }
      })
      .catch(error => {
        reject(error)
      })
    })
  },
  // 呼叫单个参会者
  dialUsers(cid, userId){
    return new Promise((resolve, reject) => {
      this.$post(`${api_ver}/conferences/${cid}/dial/${userId}`, '')
      .then(res => {
        const {code, data, msg} = res;
        if(code === 200) {
          resolve(data)
        }else{
          reject(msg)
        }
      })
      .catch(error => {
        reject(error)
      })
    })
  },
  // 挂断单个参会者
  participantDisconnect(cid, puuid) {
    return new Promise((resolve, reject) => {
      this.$post(`${api_ver}/conferences/${cid}/disconnect/${puuid}`, '')
      .then(res => {
        const {code, data, msg} = res;
        if(code === 200) {
          resolve(data)
        }else{
          reject(msg)
        }
      })
      .catch(error => {
        reject(error)
      })
    })
  },

  // 结束会议
  closeConference(cid) {
    return new Promise((resolve, reject) => {
      this.$post(`${api_ver}/conferences/${cid}/stop`, '')
      .then(res =>{
        let {code, data, msg} = res;
        if(code === 200){
          resolve(data)
        }else{
          reject(msg);
        }
      })
      .catch(error => {
        reject(error)
      })
    })
  },
   // 静音/解除静音全部参会者
  muteAllUser(cid, data) {
    return new Promise((resolve, reject) => {
      this.$post(`${api_ver}/conferences/${cid}/mute-all`, data)
        .then(res =>{
          let {code, data, msg} = res;
          if(code === 200){
              resolve(data)
          }else{
              reject(msg);
          }
        })
        .catch(error => {
          reject(error)
        })
    })
  },
  // 呼叫多个已选择的参会者
  callMoreUsers(cid, data) {
   return new Promise((resolve, reject) => {
    this.$post(`${api_ver}/conferences/${cid}/dial-more`, data)
        .then(res => {
          let {code, data, msg} = res;
          if(code === 200) {
            resolve(data)
          }else{
            reject(msg)
          }
        })
        .catch(error => {
          reject(error)
        })
   })
  },


  /*******************************************/
  // 定时刷新uc token
  refreshTokenFn() {
    // console.log('refreshTokenFn ===> ', ElCookie.getCookies('uc_refresh_token'))
    const _refreshToken = common.getLocstorage('uc_refresh_token');
    const tokenData = 'grant_type=refresh_token&scope=web&client_id=2513608755203&client_secret=32b42c8d694d520d3e321&refresh_token=' + _refreshToken;
    return new Promise((resolve, reject) => {
      this.$post(`/oauth/token`, tokenData)
      .then(res =>{
        let resdata = res;
        resolve(resdata)
      })
      .catch(error => {
        reject(error)
      })
    })
  },


  /**
   * 通过puuid查询与会者信息
   * @param cid  会议id
   * @param puuid  与会者Id
   * @returns {Promise}
   */
  getUserInfoByPuuid(cid, puuid) {
      return new Promise((resolve, reject) => {
          this.$get(`${api_ver}/conferences/${cid}/participant/puuid/${puuid}`)
              .then(res => {
                  let {code, data, msg} = res;
                  if(code === 200 && data) {
                      resolve(data);
                  }
              })
              .catch(error => {
                  reject(error)
              })
      })
  },
  /**
   * getSupportRoom
   * 获取云起云服务支持中心
   * 服务端配置会议室及密码
   * @returns {Promise}
   */
  getSupportRoom() {
      return new Promise((resolve, reject) => {
          this.$get(`${api_ver}/support/room`)
              .then(res => {
                  let {code, data, msg} = res;
                  if(code === 200) {
                      resolve(data)
                  }else{
                      reject(msg)
                  }
              })
              .catch(error => {
                  reject(error)
              })
      })
  }
}
