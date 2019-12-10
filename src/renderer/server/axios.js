
import axios from 'axios';
import { environment } from '@/config/environment';
import { tokenService } from '@/util/tokenService';
import store from '@/store/index.js';
import {common} from "../util/common";

// 环境的切换

// (store.state.serverAddress || process.env.VUE_APP_BASE_URL)
axios.defaults.baseURL = environment.apiBase + environment.port;


// 请求超时
axios.defaults.timeout = 10000;

// 请求队列
let queue = [];

/****** request拦截器==>对请求参数做处理 ******/
axios.interceptors.request.use(config => {
  config.baseURL = store.getters.getServerAddress + environment.port;
  config.headers.terminalType = 'web';
  config.headers.language = 'zh-CN';
  config.headers.Authorization = tokenService.getToken();
  queue.push(config)
  return config;
}, error => {
  return Promise.reject(error);
});

/****** respone拦截器==>对响应做处理 ******/
axios.interceptors.response.use(
  response => { //成功请求到数据
    return response;
  },
  error => { //响应错误处理
    console.log('Axios Error =====', error);
    const _response = error.response;
    if(!_response) {
      // alert('网络异常')
      return;
    }
    if(_response) {
      switch (_response.status) {
        case 401:
          console.log('token无效');
          if(_response.data.code != 11014){
            console.log('token无效, 正在刷新token');
            tokenService.refreshToken() // 刷新token
            .then(()=>{
              axios.request(queue[queue.length-2])
            }).catch(()=>{
                common.deletAllLoginData()
                window.location.reload()
            })
          }
          break;
        case 413:
            console.log('token已过期');
            tokenService.refreshToken() // 刷新token
            .then(()=>{
              axios.request(queue[queue.length-2])
            })
          break;
        case 500:
          console.log('服务器错误');
          break;
        case 404:
          console.log('找不到api');
          break;
        case 402:
          console.log('服务器异常');
          break;
        default:
          break;
      }
      // 4016 - 服务器内部错误
      if(_response.data.code != 4016) {
        return Promise.reject(_response.data);
      }
    }
    // return Promise.reject(error)
  }
)

/**
 * 封装get方法
 * @param url
 * @param data
 * @returns {Promise}
 */

export function get(url,params={}){
  return new Promise((resolve,reject) => {
    axios.get(url, {
      params: params
    })
    .then(response => {
      resolve(response.data);
    })
    .catch(err => {
      reject(err)
    })
  })
}

/**
 * 封装post请求
 * @param url
 * @param data
 * @returns {Promise}
 */

export function post(url, data = {}) {
  return new Promise((resolve,reject) => {
    axios.post(url, data)
      .then(response => {
        resolve(response.data);
      },err => {
        reject(err)
      })
  })
}

 /**
 * 封装delete请求
 * @param url
 * @param data
 * @returns {Promise}
 */
export function _delete(url,params = {}) {
  return new Promise((resolve,reject) => {
    axios.delete(url, {
      params: params
    })
    .then(response => {
      resolve(response.data);
    })
    .catch(err => {
      reject(err)
    })
  })
}
 /**
 * 封装patch请求
 * @param url
 * @param data
 * @returns {Promise}
 */
export function patch(url, data = {}){
  return new Promise((resolve,reject) => {
    axios.patch(url, data)
      .then(response => {
        resolve(response.data);
      },err => {
        reject(err)
      })
  })
}

 /**
 * 封装put请求
 * @param url
 * @param data
 * @returns {Promise}
 */

export function put(url,data = {}){
  return new Promise((resolve,reject) => {
    axios.put(url,data)
      .then(response => {
        resolve(response.data);
      },err => {
        reject(err)
      })
  })
}
