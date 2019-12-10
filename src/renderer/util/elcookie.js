// cookie.js
import { remote, ipcRenderer } from 'electron';
import { baseConfig } from '@/config/baseconfig';
import { eventBus } from '@/config/eventbus'

// 通过remote模块取的原本在主进程中才能使用的session模块

/**
 * 获得
 */
const ElCookie = {}
const Session = remote.session
const hostUrl = baseConfig.host;
// const hostUrl = location.origin
ElCookie.getCookies = (name) => {
    let cookieVal = '';
    return new Promise(function (resolve, reject) {
       Session.defaultSession.cookies.get({url: hostUrl, name: name}, function (error, cookies) {
            if(cookies.length > 0){
                cookieVal = cookies[0].value;
            }
            // console.log('cookies===>', cookieVal);
            resolve(cookieVal)
        })
    })
};
ElCookie.getAllCookies = (url) => {
    return new Promise(function (resolve, reject) {
        Session.defaultSession.cookies.get({ url: url || hostUrl }, function (error, cookies) {
            // console.log('allCookies===>',cookies);
            resolve(cookies)
        });
    })
};
ElCookie.getCookie = () => {
    // try {
    //     return async.ElCookie.getAllCookies()
    // } catch (error) {
    //     console.log(error)
    // }
    Session.defaultSession.cookies.get({ url: url || hostUrl }, function (error, cookies) {
        console.log(cookies);
        if (cookies.length > 0) {
            // let name = document.getElementById('name');
            // name.value = cookies[0].value;
            // let password = document.getElementById('password');
            // password.value = cookies[1].value;
        }
    })
};
/**
 * 清空缓存
 */
ElCookie.clearCookies = (url) => {
    Session.defaultSession.clearStorageData({
        origin: url || hostUrl,
        storages: ['cookies']
    }, function (error) {
        if (error) console.error(error);
    })
};

/**
 * 保存cookie
 * @param name  cookie名称
 * @param value cookie值
 */
ElCookie.setCookie = (name, value, date) => {
    let Days = 30;
    let exp = new Date();
    let _date = Math.round(exp.getTime() / 1000) + Days * 24 * 60 * 60;
    const cookie = {
        url: hostUrl,
        name: name,
        value: value,
        expirationDate: date || _date
    };
    Session.defaultSession.cookies.set(cookie, (error) => {
        if (error) console.error(error);
    });
};

export default ElCookie
// module.exports = Cookie
