<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>

//import { tokenService } from '@/util/tokenService';

export default {
  name:'app',
  data() {
    return {

    }
  },
  computed: {

//    isLogined(){
//      return !!this.$store.getters.getIsLoggedIn && !!this.$store.getters.getLoginData
//    }
  },
  methods: {

  },
  created() {

  },
  mounted () {
      const ipcRenderer = this.$electron.ipcRenderer;
      const remote = this.$electron.remote;
      window.quitAndInstall = function () {
          remote.autoUpdater.quitAndInstall()
      }
      ipcRenderer.on('console', (event, consoleMsg) => {
          console.log(consoleMsg)
      })

      ipcRenderer.on('message', (event, data) => {
          console.log(data)
//          showMessage(data.msg, data.hide, data.replaceAll)
      })

  },
  destroyed() {

  }
};
</script>
<style>
#app {
  color: #fff;
}
div.ivu-drawer-content {
  /* background-color: #3f4a5d; */
  color: #fff;
}
div.ivu-drawer-header-inner {
  color: #fff;
}
div.ivu-drawer-header {
  border-bottom: 1px solid #535c65;
}
.line-form input[type="text"],
.line-form input[type="password"] {
  background-color: transparent;
  color: #fff;
  border: none;
  border-radius: 0;
  border-bottom: 1px solid #949898;
}
.line-form input[type="text"]:hover,
.line-form input[type="text"]:focus,
.line-form input[type="password"]:hover,
.line-form input[type="password"]:focus {
  border-bottom: 1px solid #949898;
}
a.ivu-drawer-close .ivu-icon-ios-close{
  top: 0px;
}
i.ivu-icon-ios-close:before{
  background-color: #fff;
  border-radius: 50%;
}

.dialog-form input[type="text"],
.dialog-form input[type="password"]{
  color: #606266;
}
.dialog-form .el-select{
  width: 70%;
}
.tool-item{
  display: inline-block;
  /* width: 50px; */
  height: 50px;
  color: #fff;
  /* border: 1px solid #fff; */
  /* border-radius: 50%; */
  margin: 0px 16px;
}
.tool-item .tool-icon{
    display: block;
    font-size: 22px;
    padding: 5px;
  }

  .fixed{
    position: fixed;
    height: 100%;
  }
  .el-menu{
    border-right: none !important;
  }
  .full-height{
    min-height: 100vh;
  }
  .menu-bgcolor{
    background: #303847
  }
  .menu-two-bgcolor{
    background: #dfe4ec;
  }

</style>
