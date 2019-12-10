<template>
<!-- 设置服务器 -->
  <div class="serverPage">
    <div class="sidebar-left">
      <el-form class="line-form" :model="serverForm" :rules="rulesFrom" ref="serverForm">
        <el-form-item label="" prop="serverAddr">
          <el-input
          placeholder="请输入服务器地址"
          v-model="serverForm.serverAddr"
          clearable>
        </el-input>
        <span v-show="false">{{serverAddr}}</span>
        <span class="red" v-show="isDisabled">当前处于已登录状态，无法修改服务器地址</span>
        </el-form-item>
        <el-form-item>
          <div class="save-server">
            <el-button type="primary" round :disabled="isDisabled" @click="setServerAddr('serverForm')">保 存</el-button>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { common } from '@/util/common';
import ElCookie from '@/util/elcookie'

export default {
  name: "serverPage",
  data() {
    const validateUrl = (rule, value, callback) => {
      if(value === '') {
        callback(new Error('请输入服务器地址'));
      }else{
        const reg= /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?/;
        if(!reg.test(value)) {
          callback(new Error('请输入正确的服务器地址'));
        }else{
          callback();
        }
      }
    }

    return {
      // isDisabled: false,
      serverForm: {
        serverAddr: ''
      },
      rulesFrom: {
        serverAddr: [
          { validator: validateUrl, trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    serverAddr() {
      const _serverAddr = this.$store.getters.getServerAddress;
      this.serverForm.serverAddr = _serverAddr
      return _serverAddr
    },
    isDisabled() {
      return !!this.$store.getters.getIsLoggedIn;
    }
  },
  methods: {
    setServerAddr(formName) {
      const _this = this;
      // todo 判断当前是否已经登录，已登录用户不可更改服务器地址，需要先退出登录
       _this.$refs[formName].validate((valid) => {
        if(valid) {
          _this.$notification('服务器地址修改成功', 'success')
          console.log('setServerAddr====>', _this.serverForm.serverAddr)
          _this.$store.commit("setServerAddress",_this.serverForm.serverAddr);
          common.setLocstorage('serverAddress', _this.serverForm.serverAddr)

          // 设置成功后返回到index
          // this.$nextTick(()=>{
          //   _this.$router.push("/index");
          // })
        }else{
          _this.$notification('服务器地址设置失败, 不是一个有效的地', 'error');
        }
      })
    }
  },
  mounted(){
    // this.isDisabled = !!this.$store.getters.getIsLoggedIn;
  }
};
</script>

<style scoped>
  .serverPage{
    margin-top: 20px;
  }
  .sidebar-left{
    margin-left: 1rem;
  }
  .save-server{
    text-align: center;
    margin-top: 3rem;
  }
  .save-server button{
    width: 160px;
  }
</style>
