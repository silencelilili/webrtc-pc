/**
 * 自定义指令
 */
import Vue from 'vue'
import store from './store/index';
import { mapState, mapGetters, mapActions } from 'vuex';

Vue.directive('autoFocus', {
  bind: function (el, binding) {
    el.focus();
    // console.log( 'bind',binding.value );
  },
  inserted:function (el, binding) {
    el.value = binding.value;
    // console.log('inserted',el.value)
  },
  update:function (el, binding) {
    // console.log('update', binding.value)
  },
  componentUpdated:function (el, binding) {
    // console.log('componentUpdated',binding.value)
  },
  unbind:function (el, binding) {
    // console.log('unbind',binding.value)
  }
});

Vue.directive('rtcVolume', {
  bind: function (el, binding) {
    // el.focus();
    // console.log( 'bind',binding.value );
  },
  inserted:function (el, binding) {
    el.value = binding.value;
    // console.log('inserted',el.value)
  },
  update:function (el, binding) {
    // console.log("update===", binding.value+ "--"+binding.oldValue)
    if(binding.value != binding.oldValue){
      // const _devices =  store.getters.getDevices;
      let domElement = el;
      domElement.volume = binding.value;

      let setOutputDevice = function() {
        const audioOutput = localStorage.getItem('audioOutputId') || '';
  
        
        let src = domElement.src;
        // domElement.src = '';
        domElement.setSinkId(audioOutput)
        .then(function () {
          console.log('Audio output sat to', audioOutput);
        })
        .catch(function (error) {
          console.error('Unable to set audio output', error);
        })
        .then(function() {
          // Workaround for nwjs (bis): resume playing the video
          domElement.src = src;
        });
      };
      if(domElement.setSinkId) {
        domElement.onplay = setOutputDevice;
      }
      
    }
    
  },
  componentUpdated:function (el, binding) {
    // console.log('componentUpdated',binding.value)
  },
  unbind:function (el, binding) {
    console.log('unbind',binding.value)
  }
})

/***
 * 自定义指令
 * v-idleTimer="{class:'xxx'}"
 * 实现页面中底部操作栏的显示隐藏
 */
Vue.directive('idleTimer', {
  bind: function (el, binding) {
    // console.log( 'bind', binding.value );
    let interval = 500;
    let idleAfter = 5000;
    let idleTime = 0;
    let state;
   
    el.onmousemove = () =>{
      idleTime = 0;
      state = 'active';
      el.classList.remove(binding.value.class)
    }
   setInterval(() => {
    idleTime += interval;
    if (state !== 'idle' && idleTime >= idleAfter) {
      state = 'idle';
      el.classList.add(binding.value.class);
    }
   }, interval);
  },
  inserted:function (el, binding) {
    // console.log('inserted',el.value)
  },
  update:function (el, binding) {
    // console.log('update', binding.value)
  },
  componentUpdated:function (el, binding) {
    // console.log('componentUpdated',binding.value)
  },
  unbind:function (el, binding) {
    // console.log('unbind',binding.value)
  }
})