import store from '../store/index.js';
// import { tokenService } from '../util/tokenService';
import ElCookie from './elcookie.js'

export const common = {
    /* 登录时设置需要本地存储的数据 */
    loginSetData(resData) {
        const expires = resData.expires_in;
        // 登录成功保存 token数据 cookie
        // $cookies.set('uc_access_token', resData.access_token); // 请求token
        // $cookies.set('uc_expires_in', resData.expires_in, expires); // token有效期
        // $cookies.set('uc_token_type', resData.token_type, expires); // token类型
        // $cookies.set('uc_refresh_token', resData.refresh_token); // 刷新token
        // $cookies.set('uc_realName', resData.realName, expires); // 登录者名称
        // $cookies.set('uc_isLogin', 'true', expires); // uc已登陆
        const xmppCookieData = {
            'realName': resData.realName,
            'userId': resData.userId,
            'entId': resData.entId,
            // 'access_token': resData.access_token,
            // 'refresh_token': resData.refresh_token,
            'webrtcAddress': resData.webrtcAddress,
            'webrtcXmppIp': resData.webrtcXmppIp,
            'xmppPassword': resData.xmppPassword,
            'xmppServer': resData.xmppServer,
            'xmppUsername': resData.xmppUsername
        };
        this.setLocstorage('xmppCookieData', xmppCookieData);

        store.dispatch("asyncXmppData", xmppCookieData);

        const _data = [
            {'name': 'uc_realName', 'value': resData.realName},
            {'name': 'uc_token_type', 'value': resData.token_type},
            {'name': 'uc_access_token', 'value': resData.access_token},
            {'name': 'uc_refresh_token', 'value': resData.refresh_token},
            {'name': 'uc_expires_in', 'value': resData.expires_in},
            {'name': 'uc_isLogin', 'value': true},
        ]
        _data.forEach((item)=>{
            store.dispatch('userCookies/asynSetCookies', item)
        })
        this.setLocstorage('uc_access_token', resData.access_token)
        this.setLocstorage('uc_refresh_token', resData.refresh_token)
        this.setLocstorage('uc_expires_in', resData.expires_in);
        this.setLocstorage('uc_isLogin', true)
        this.setLocstorage('uc_loginData', resData);
        // localStorage.setItem('uc_loginData', JSON.stringify(resData)); // 保存返回信息

        store.commit("setLoginData", resData);


    },

    /* 从localstorage中获取登录的用户信息 */
    getLoginMsg() {
        if (this.getLocstorage('uc_loginData')) {
            return this.getLocstorage('uc_loginData') //JSON.parse(localStorage.getItem('uc_loginData'));
        }
    },
    //  删除所有cookie
    deleAllCookie(){
       const allCookies = $cookies.keys();
       allCookies.forEach(cookie => {
        $cookies.remove(cookie);
       });
    },
    /*
    * 退出登录
    * 删除当前用户登录时所存储的cookie以及localstorage
    * 并返回到登录页面
    */
    deletAllLoginData() {
      this.deleAllCookie(); // 清除cookies
      this.deleAllLocstorage(); // 清除localStorage
      // this.deleAllSessionStorage(); // 清除sessionStorage
      // sessionStorage.clear();//sessionStorage
      // store.commit("setLoginData",'');
    },

    /**
     * 生成匿名用户的displayName
     * */
    createAnonymousName() {
        let Num = '';
        for(let i=0;i<4;i++){
            Num += Math.floor(Math.random()*10);
        }
        return `访客${Num}`
    },
    /**
     * 不足两位数 补零
     * */
    addZero(n) {
        return n >= 10 ? n : "0" + n;
    },

    /**
     * 全屏
     * */
    fullScreen(el) {
        let isFullscreen = document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen;
        if(!isFullscreen){//进入全屏,多重短路表达式
            (el.requestFullscreen&&el.requestFullscreen())||
            (el.mozRequestFullScreen&&el.mozRequestFullScreen())||
            (el.webkitRequestFullscreen&&el.webkitRequestFullscreen())||(el.msRequestFullscreen&&el.msRequestFullscreen());

        }else{ //退出全屏,三目运算符
            document.exitFullscreen?document.exitFullscreen():
            document.mozCancelFullScreen?document.mozCancelFullScreen():
            document.webkitExitFullscreen?document.webkitExitFullscreen():'';
        }
    },

    /**
     * 封装操作localstorage本地存储的方法
     */
    //存储
    setLocstorage(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },
    // 取出数据
    getLocstorage(key) {
        return JSON.parse(localStorage.getItem(key));
    },
    // 删除数据
    removeLocstorage(key) {
        localStorage.removeItem(key);
    },
    // 清空
    deleAllLocstorage(){
        localStorage.clear()
    },

    /**
     * 封装操作sessionStorage本地存储的方法
     */
    //存储
    setSessionStorage(key, value) {
        sessionStorage.setItem(key, JSON.stringify(value));
    },
     // 取出数据
    getSessionStorage(key){
        return JSON.parse(sessionStorage.getItem(key));
    },
    // 删除数据
    removeSessionStorage(key) {
        sessionStorage.removeItem(key);
    },
    // 清空
    deleAllSessionStorage(){
        sessionStorage.clear()
    },
    /*
    * json对象转get请求参数格式
    */
  formObject(arr) {
    let str = '?';
    for (const i in arr) {
      if (arr) {
        str += i + '=' + arr[i] + '&';
      }
    }
    const formStr = str.substring(0, str.lastIndexOf('&'));
    return formStr;
  },
  /**
   * object转数组
   */
  objToArr(obj){
    let arr = [];
    Object.keys(obj).map(key=>{
      let newobj = { id: key, name: obj[key] };
      arr.push(newobj)
    })
    return arr
  },
  /*
    日期格式转换
    yyyy-MM-dd
  */
 formatDate(date, line) {
    if (date) {
      date = new Date(date);
      const y = date.getFullYear();
      let m = date.getMonth() + 1;
      m = m < 10 ? '0' + m : m;
      let d = date.getDate();
      d = d < 10 ? ('0' + d) : d;
      if (line) {
        return y + line + m + line + d;
      } else {
        return y + '-' + m + '-' + d;
      }

    } else {
      return '';
    }
  },
  /*
    日期格式转换
    HH:mm
  */
 formatDateTime(date) {
    if (date) {
      date = new Date(date);
      let h = date.getHours();
      h = h < 10 ? ('0' + h) : h;
      let mi = date.getMinutes();
      mi = mi < 10 ? ('0' + mi) : mi;

      return h + ':' + mi;
    } else {
      return '';
    }
  },
  /** 计算传入的两个时间的时间差
   * 参数为时间戳
   */
  getCountdown(curTime, date) {
    var obj = {};
    var current_date = curTime;
    var seconds_left = (date - current_date) / 1000;

    var days = this.addZero(parseInt('' + seconds_left / 86400));
    seconds_left = seconds_left % 86400;

    var hours = this.addZero(parseInt('' + seconds_left / 3600));
    seconds_left = seconds_left % 3600;

    var minutes = this.addZero(parseInt('' + seconds_left / 60));
    var seconds = this.addZero(parseInt('' + seconds_left % 60));
    obj = {
      'days': days,
      'hours': hours,
      'minutes': minutes,
      'seconds': seconds
    };
    return obj;
  },

  /**
   * 数组对象根据关键字去重
   */
  unique(arr, key) {
    let obj = {};
    let returnArr = [];
    arr.reduce((cur, next) => {
      obj[next[key]] ? '' : obj[next[key]] = true && returnArr.push(next)
    }, [])
    return returnArr
  }

}
