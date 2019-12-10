import Vue from 'vue'
import Router from 'vue-router'
import Index from './views/Index.vue'
import Meeting from './views/Meeting.vue'
import Presentation from './components/presentationWindow.vue'
import Screen from './components/screenWindow.vue'
import LoginPage from './components/LoginPage.vue'
import Home from './views/home.vue'
import Conference from './views/conference.vue'
import Schedule from './views/schedule.vue'
import VideoList from './views/videolist.vue'
import LiveList from './views/livelist.vue'
import Book from './views/book.vue'
import WatchLive from './views/watchLive.vue'
import PlayVideo from './views/playVideo.vue'
import UserRoom from './views/userRoom.vue'

import { Hint, boxNotification, HintMsg } from './config/messagebox';

let $notification = HintMsg;
// if(process.platform === 'darwin'){
//   $notification = boxNotification;
// }else{
//   $notification = Hint;
// }

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/', name:'home', component: Home, redirect: 'index',
      children: [
        {path: '/index', name:'index', component: Index},
        {path: '/meeting', name:'meeting', component: Meeting, meta: {keepalive: false}},
        {path: '/screen', name: 'screen', component: Screen },
        {path: '/conference', name: 'conference', component: Conference, meta: { requiresAuth: true },
          children: [
            {path: '', name:'book', component: Book, meta: { requiresAuth: true }},
            {path: 'book', name:'book', component: Book, meta: { requiresAuth: true, keepalive:false }},
            {path: 'schedule', name:'schedule', component: Schedule, meta: { requiresAuth: true, keepalive:false }},
            {path: 'video', name:'video', component: VideoList, meta: { requiresAuth: true, keepalive:false}},
            {path: 'live', name:'live', component: LiveList, meta: { requiresAuth: true, keepalive:false }},
            {path: 'room', name: 'room', component: UserRoom, meta: { requiresAuth: true, keepalive:false }},
          ]
        }
      ]
    },
    {path: '/presentation', name: 'presentation', component: Presentation },
    {path: '/watchlive', name: 'watchlive', component: WatchLive },
    {path: '/play', name: 'play', component: PlayVideo},

    {path: '*', redirect:'/'}
  ]
})

// 全局路由守卫
// router.beforeEach((to, from, next) => {
//   const nextRoute = ['conference', 'book', 'schedule', 'video', 'live'] // 需要登录的页面
//   let isLogin =  JSON.parse(localStorage.getItem('uc_isLogin')) && JSON.parse(localStorage.getItem('uc_access_token'));//store.getters.getIsLoggedIn && !!store.getters.getLoginData;  // 判断是否登录，本地存储有用户数据则视为已经登录
//   if(nextRoute.indexOf(to.name) >= 0) { // 检测是否登录的页面
//     if(!isLogin){ // 如果未登录（本地存储无用户数据），并且要跳到登录页面
//       if(from.name === 'conference'){
//         next('/')
//         return
//       }
//       // 登录后，跳到到当前页面
//       router.push({
//         name: 'conference',
//         params: {redirect: to.fullPath}
//       })
//     }
//   }
//   // 已登录状态；当路由到 login 时，跳转至 home
//   if(to.name === 'login'){
//     if(isLogin) {
//       next('/')
//       return
//     }
//   }
//   next()
// })

router.beforeEach((to, from, next) => {
  let isLogin =  JSON.parse(localStorage.getItem('uc_isLogin')) && JSON.parse(localStorage.getItem('uc_access_token'));
  if(to.matched.some(record => record.meta.requiresAuth)) {
    if(!isLogin){
      router.push('/home');
      $notification('当前未登录或登录已过期，请先登录！', 'warning')
    }else{
      next()
    }
  }else{
    next()
  }
})


/**
 * 重写路由的push方法
 * @type {Router.push|*}
 */

 const routerPush = Router.prototype.push;
Router.prototype.push = function push (location) {
    return routerPush.call(this, location).catch(error => error)
}

export default router


