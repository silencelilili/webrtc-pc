import store from '../store/index.js';

import {common} from './common.js';
import { environment } from '../config/environment';
import { conferenceApi } from '../server/api'
import { request } from 'https';


// let apiBase = (sessionStorage.getItem('baseUrl') || environment.apiBase) + '/appapi';
// let apiBase = common.getLocstorage('serverAddress') || environment.apiBase + environment.port;

let isRefreshing = true; // 防止重复请求
let subscribers = [];
export const tokenService = {
    //获得token
    getToken() {
        const locAccessToken = common.getLocstorage('uc_access_token');
        return 'Bearer ' + locAccessToken;
    },

    checkStatus() {
        if(isRefreshing) {
            this.refreshToken()
        }
        isRefreshing = false;
        const retryOriginalRequest = new Promise((resolve) => {
            this.addSubscriber(() => {
                resolve(request(url, options))
            })
        })
        return retryOriginalRequest;
    },

    refreshToken() {
        return new Promise((resolve, rejects) => {
            conferenceApi.refreshTokenFn()
            .then((data) =>{
                const _data = [
                    {'name': 'uc_access_token', 'value': data.access_token},
                    {'name': 'uc_refresh_token', 'value': data.refresh_token},
                    {'name': 'uc_expires_in', 'value': data.expires_in},
                    {'name': 'uc_isLogin', 'value': true},
                ]
                _data.forEach((item)=>{
                    store.dispatch('userCookies/asynSetCookies', item)
                })
                common.setLocstorage('uc_expires_in', data.expires_in)
                common.setLocstorage('uc_access_token', data.access_token)
                common.setLocstorage('uc_refresh_token', data.refresh_token)


                isRefreshing = true;
                this.onAccessTokenFetched()
                resolve()
            }).catch((err)=>{
                const errData = err;
                if (+err.status === 401) {
                    // 清除cookies，localStorage，并返回登录
                    common.deletAllLoginData();
                    this.$router.push('/home');
                }
                rejects()
            })
        })
    },
    // 刷新token的请求函数
    _refreshToken() {
        // const _refreshToken = common.getLocstorage('uc_refresh_token');
        // const tokenData = 'grant_type=refresh_token&scope=web&client_id=2513608755203&client_secret=32b42c8d694d520d3e321&refresh_token=' + _refreshToken; //$cookies.get('uc_refresh_token');
        conferenceApi.refreshTokenFn()
        .then((data) =>{
            const _data = [
                {'name': 'uc_access_token', 'value': data.access_token},
                {'name': 'uc_refresh_token', 'value': data.refresh_token},
                {'name': 'uc_expires_in', 'value': data.expires_in},
                {'name': 'uc_isLogin', 'value': true},
            ]
            _data.forEach((item)=>{
                store.dispatch('userCookies/asynSetCookies', item)
            })
            common.setLocstorage('uc_expires_in', data.expires_in)
            common.setLocstorage('uc_access_token', data.access_token)
            common.setLocstorage('uc_refresh_token', data.refresh_token)


            isRefreshing = true;
            this.onAccessTokenFetched()
        }).catch((err)=>{
            const errData = err;
            if (+err.status === 401) {
                // 清除cookies，localStorage，并返回登录
            }
        })
    },

    onAccessTokenFetched() {
        subscribers.forEach((callback)=>{
            callback();
        })
        subscribers = [];
    },
    addSubscriber(callback) {
        subscribers.push(callback)
        console.log(subscribers)
    }
}
