import { common } from "../util/common.js";
import { baseConfig } from '../config/baseconfig'

// import Cookie from "../util/elcookie.js";
import { post, get, patch, put, _delete } from './axios';

const api_ver = baseConfig.api_version;
export const ucApi = {
  $post: post,
  $get: get,
  $patch: patch,
  $put: put,
  $_delete: _delete,

  /********************* 登录/退出登录 ***************************************************/
  // 登录
  login(datas) {
    return new Promise((resolve, reject) => {
      this.$post(`${api_ver}/login`, datas)
      .then(res => {
        let {code, data, msg} = res;
        if(code === 200) {
          resolve(data);
        }else{
          reject(res)
        }
      })
      .catch(error => {
        reject(error)
      })
    })
  },
  // 退出登录
  logout() {
    return new Promise((resolve, reject) => {
      this.$post(`${api_ver}/logout`, '')
      .then(res => {
        let {code, data, msg} = res;
        if(code === 200) {
          resolve(data);
        }
      })
      .catch(error => {
        reject(error)
      })
    })
  },
  // 获取已登录用户信息
  getUserData(userId){
    return new Promise((resolve, reject) => {
      this.$get(`${api_ver}/user/${userId}`)
      .then(res => {
        let {code, data, msg} = res;
        if(code === 200) {
          resolve(data);
        }
      })
      .catch(error => {
        reject(error)
      })
    })
  },

    /**
     * 查询 企业服务状态
     * @param entId
     * @returns {data, msg}
     * data:
     * { 0 - 正常
       * 2 - 已购买,已支付,服务到期  "服务已到期，请联系企业管理员！"
       * 3 - 已购买,待支付          "订单未支付，请联系管理员！"
       * 4 - 已购买,已支付,待开通    "服务已购买，请等待服务开通！"
       * 5 - 未购买                "未购买服务，请购买！"
       * 6 - 终止服务              "服务已到期，请购买！"
     * }
     *
     */
  getEntServiceStatus(entId) {
    return new Promise((resolve, reject) => {
      this.$get(`${api_ver}/baseresource/resource/ent/${entId}`)
          .then(res => {
              let {code, data, msg} = res;
              if(code === 200) {
                  resolve(res)
              }
          })
          .catch(error => {
              reject(error)
          })
    })
  },


    /********************* 视频列表 ***************************************************/
  // 获取视频列表数据
  getRecordsList(data){
    const getData = common.formObject(data)
    return new Promise((resolve, reject) => {
      this.$get(`${api_ver}/records${getData}`)
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
  // 查询企业公共录播文件列表
  getEntRecordsList(data) {
    const getData = common.formObject(data);
    return new Promise((resolve, reject) => {
      this.$get(`${api_ver}/records/public${getData}`)
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
  // 删除视频
  deleRecordItem(data) {
    return new Promise((resolve, reject) => {
      this.$_delete(`${api_ver}/records/delete?ids=${data}`)
      .then(res => {
        let {code, data} = res;
        if(code === 200) {
          resolve(data);
        }else{
          reject()
        }
      })
      .catch(error => {
        reject(error)
      })
    })
  },
  //修改视频状态
  updateRecordState(fileId, postData){
    return new Promise((resolve, reject) => {
      this.$post(`${api_ver}/records/${fileId}/state`, postData)
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
  //修改视频文件名称
  updateRecordFileName(id,postData){
    return new Promise((resolve, reject) => {
      this.$post(`${api_ver}/records/update/${id}/filename`, postData)
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

  /********************* 直播列表 ***************************************************/
  // 查询直播列表
  getLiveList(entId) {
    return new Promise((resolve, reject) => {
      this.$get(`${api_ver}/${entId}/lives`)
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


  /********************* 发起会议 ***************************************************/
  // 查询发起会议模板
  getConferenceTemplate(type, infoId) {
    return new Promise((resolve, reject) => {
      this.$get(`${api_ver}/conferences/template?type=${type}&infoId=${infoId}`)
      .then(res => {
        let {code, data, msg} = res;
        if(code === 200) {
          resolve(data);
        }else{
          reject(msg)
        }
      })
      .catch(error => {
        reject(error)
      })
    })
  },
  // 发起会议 （提交）
  submitConferenceForm(val){
    return new Promise((resolve, reject) => {
      this.$post(`${api_ver}/conferences/launch`, val)
      .then(res => {
        let {code, data, msg} = res;
        if(code === 200) {
          resolve(data);
        }else{
          reject(msg)
        }
      })
      .catch(error => {
        reject(error)
      })
    })
  },

  /********************* 会议日程 ***************************************************/
  // 表格列表数据初始化
  getScheduleList(data) {
    const getData = common.formObject(data);
    return new Promise((resolve, reject) => {
      this.$get(`${api_ver}/appointments${getData}`)
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
  // 获取重复会议
  judgeIsRepeat(appointmentId) {
    return new Promise((resolve, reject) => {
      this.$get(`${api_ver}/appointments/${appointmentId}/repeat`)
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
  // 确定删除已选择会议
  deleScheduleItem(data) {
    return new Promise((resolve, reject) => {
      this.$_delete(`${api_ver}/appointments/delete?appointmentIds=${data}`)
      .then(res => {
        let {code, data, msg} = res;
        if(code === 200) {
          resolve(data);
        }else{
          reject(msg)
        }
      })
      .catch(error => {
        reject(error)
      })
    })
  },

  /********************* 通讯录 ***************************************************/
  // 参会者公司人员数据
  loadUserListData(data) {
    const getData = common.formObject(data);
    return new Promise((resolve, reject) => {
      this.$get(`${api_ver}/user/tree/group/3${getData}`)
      .then(res => {
        let {code, data} = res;
        if(code === 200) {
          resolve(data)
        }
      })
      .catch(error => {
        reject(error)
      })
    })
  },
  // 参会者会议室数据
  loadRoomListData(entId, data) {
    const getData = common.formObject(data);
    return new Promise((resolve, reject) => {
      this.$get(`${api_ver}/userRoom/room-user/${entId}/find${getData}`)
      .then(res => {
        let {code, data} = res;
        if(code === 200) {
          resolve(data)
        }
      })
      .catch(error => {
        reject(error)
      })
    })
  },

  /********************* 观看直播  ***************************************************/
  // 获取当前直播的数据 判断直播状态
  getLiveInfoData(appointmentId){
    return new Promise((resolve, reject) => {
      this.$get(`${api_ver}/lives/${appointmentId}/live-date`)
      .then(res => {
        resolve(res)
      })
      .catch(error => {
        reject(error)
      })
    })
  },
  // 验证输入的直播密码
  checkLivePwd(appointmentId, data){
    return new Promise((resolve, reject) => {
      this.$post(`${api_ver}/lives/${appointmentId}/veri`, data)
      .then(res => {
        resolve(res)
      })
      .catch(error => {
        reject(error)
      })
    })
  },
   // 获取观看人数
  getLivePlayNumFn(appointmentId){
    return new Promise((resolve, reject) => {
      this.$get(`${api_ver}/lives/${appointmentId}/live-date`)
      .then(res => {
        let {code, data} = res;
        if(code === 200) {
          resolve(data)
        }
      })
      .catch(error => {
        reject(error)
      })
    })
  },
   //请求临时token
   getLiveRequestToken() {
    return new Promise((resolve, reject) => {
      this.$get(`${api_ver}/requestToken`)
      .then(res => {
        let {code, data} = res;
        if(code === 200) {
          resolve(data)
        }
      })
      .catch(error => {
        reject(error)
      })
    })
  },
  //直播中申请入会
  sureLiveApplyFn(cid, data) {
    return new Promise((resolve, reject) => {
      this.$post(`${api_ver}/conferences/${cid}/apply`, data)
      .then(res => {
        let {code, data} = res;
        if(code === 200) {
          resolve(data)
        }
      })
      .catch(error => {
        reject(error)
      })
    })
  },

  // 查询直播是否结束
  checkLiveStatus(appointmentId) {
    return new Promise((resolve, reject) => {
      this.$get(`${api_ver}/conferences/${appointmentId}/live-status`)
      .then(res => {
        let {code, data, msg} = res;
        if(code === 200 && data) {
          resolve();
        }
      })
      .catch(error => {
        reject()
      })
    })
  },

  /******************** 云会议室 userRoom ***************************************/
  getRoomListTableFn(userId) {
    return new Promise((resolve, reject) => {
      this.$get(`${api_ver}/${userId}/rooms`)
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
  updateRoomFn(vmrNumber, data) {
    return new Promise((resolve, reject) => {
      this.$post(`${api_ver}/rooms/${vmrNumber}`, data)
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
  }

}
