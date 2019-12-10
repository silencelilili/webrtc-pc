<template>
  <div class="side-bar">
    <el-card class="box-card">
      <div slot="header" class="clearfix participant-header">
        <span>参会者（{{participantsList.OnlineNum}} / {{participantsList.allMemberLength}}）</span>
        <div class="participant-header-update">
          <el-dropdown trigger="click" @command="handleMeeting">
            <a href="javascript:;" title="操作" style=""><i class="fa fa-bars"></i></a>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="refresh">
                <i class="el-icon-refresh"></i>刷新参会者
              </el-dropdown-item>
              <el-dropdown-item command="add" v-show="havePermission">
                <i class="fa fa-user-plus"></i>增加参会者
              </el-dropdown-item>
              <el-dropdown-item command="mute" v-show="havePermission">
                <span :class="{true : 'red', false : ''}[!!isMuteAll]">
                  <i class="icon-mdi-moff"></i>{{ !!isMuteAll ? '解除静音所有参会者' : '静音所有参会者'}}
                </span>

              </el-dropdown-item>
              <!--<el-dropdown-item command="lock">-->
                <!--<i class="fa fa-lock"></i>会议锁定-->
              <!--</el-dropdown-item>-->
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>

      <div class="participants-list">
        <div v-for="(participant, index) in participantsList.list" :key="participant.userId + '_' + index" class="list-item">
          <div :class="{'1' : 'active', '0' : 'inactive'}[participant.isOnline]">
            <div class="avatar head-avatar">
              <span class="avatar-color" :class="participant.colors">{{ participant.displayName | limitTo }}</span>
            </div>
            <p class="participant-list">
              <span class="list-name">
                {{participant.displayName}}
                <span v-show="participant.role === 4001 && participant.isOnline === 1">[主讲人]</span>
                <span v-show="participant.flowFlag === 1 && participant.isOnline === 1" class="green">[共享中]</span>
                <span v-show="participant.isHandsUp === 1 && participant.isOnline === 1" class="green">[举手中]</span>
              </span>
              <span class="list-detail">
                <i class="participant-state green icon-mdi-mic" v-if="participant.isMuted==0"></i>
                <i class="participant-state red icon-mdi-moff" v-if="participant.isMuted==1"></i>
                <!-- <i class="participant-state green icon-conference-collected" v-if="participant.isCollected==1"></i>
                <i class="participant-state red icon-conference-unCollected" v-if="participant.isCollected==0"></i> -->
              </span>
            </p>
            <div class="participant-update">
              <el-dropdown trigger="click" @command="handleParticipant($event, participant)">
                <i class="icon-conference-more list-dot"></i>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item v-if="participant.isOnline == 1 && havePermission" command="mute">{{participant.isMuted==0 ? '静音' : '解除静音'}}</el-dropdown-item>

                  <el-dropdown-item v-if="participant.isOnline == 1 && havePermission" command="role" >{{ participant.role==4001 ? '取消主讲人': '设为主讲人'}}</el-dropdown-item>

                  <el-dropdown-item v-if="participant.isOnline == 1 && havePermission" command="disconnect"><span class="red">挂断</span></el-dropdown-item>

                  <el-dropdown-item v-if="participant.isOnline == 0 && havePermission" command="call">呼叫</el-dropdown-item>

                  <el-dropdown-item v-else-if="!havePermission" disabled command="none">无操作权限</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>

            <!--<el-popover-->
              <!--placement="left"-->
              <!--trigger="click">-->
              <!--<i slot="reference" class="pull-right icon-conference-more list-dot"></i>-->
              <!--<div class="operation">-->
                <!--<ul v-if="participant.isOnline == 1">-->
                  <!--<li v-if="havePermission" @click="participantMute(participant)"> {{participant.isMuted==0 ? '静音' : '解除静音'}}</li>-->
                  <!--<li v-if="havePermission" @click="setRole(participant)"> {{ participant.role==4001 ? '取消主讲人': '设为主讲人'}}</li>-->
                  <!--<li v-if="havePermission" class="red" @click="participantDisconnect(participant)">挂断</li>-->
                  <!--<li class="disabled" v-else-if="!havePermission">无操作权限</li>-->
                <!--</ul>-->
                <!--<ul v-if="participant.isOnline == 0">-->
                  <!--<li v-if="havePermission" @click="callParticipant(participant)">呼叫</li>-->
                  <!--<li class="disabled" v-else-if="!havePermission">无操作权限</li>-->
                <!--</ul>-->
              <!--</div>-->
            <!--</el-popover>-->

          </div>

        </div>
      </div>
    </el-card>

    <!--增加参会者-->
    <addAttend ref="attendChild"
               v-on:emitSubmitData="showSubmitData"
               v-bind:usedType="2"></addAttend>

  </div>
</template>

<script>
  import { conferenceApi } from '@/server/api.js';
  import AddAttend from './AddAttend.vue';

  export default {
    name: 'ParticipantList',
    data() {
      return {
        cid: '',
        vmrNumber: '',
        conferenceRole: {},
        // 是否有权限操作参会者
        havePermission: false,
        isCanCollect: 0, // 是否可以被收藏  0否；1是
        isMuteAll: false  // 静音-true；取消静音-false
      }
    },
    components: {
        addAttend: AddAttend
    },
    computed: {
      //  会议信息
      conferenceData: function () {
          const _conferenceData = this.$store.getters.getConferenceData;
          this.isMuteAll = _conferenceData.participant.muteAll;
          this.vmrNumber = _conferenceData.conference.vmrNumber;
          return _conferenceData;
      },
      //  会议角色权限
      conferenceRoleData: function() {
          const _conferenceDetail = this.$store.getters.getConferenceRoleData;
          this.conferenceRole =  _conferenceDetail;
          this.cid = _conferenceDetail.cid;
          if (_conferenceDetail.conferenceRole === 0) {
              this.havePermission = false;
          }else{
              this.havePermission = true;
          }
          return _conferenceDetail
      },
      participantsList: function () { // 获取getters
        let _participantsList = {
          OnlineNum: 0, // 在线人数
          allMemberLength: 0, // 总人数
          list: []
        };

        // 参会者
        const allParticipants = this.$store.getters.getParticipantsData || [];
        _participantsList.allMemberLength = allParticipants.length;
        allParticipants.forEach(user => {
          if(user.isOnline == 1){
            user["colors"]="avatar-color"+Math.ceil(parseInt(user.userId)%10/2);
            _participantsList.OnlineNum += 1
          }
          _participantsList.list.push(user);
        });

        return _participantsList;
      },

    },
    methods: {
    /******************** 会控 ******************/
    handleMeeting(command) {
        const _this = this;
        switch (command) {
            case 'refresh':
                _this.connectXmppFn()
                break;
            case 'add':
                _this.addAttendFn()
                break;
            case 'mute':
                _this.toggleMuteAllFn()
                break;
            case 'lock':
                _this.toggleIsLockFn()
                break;
        }
    },
      // 刷新参会者列表
      connectXmppFn(){
        // 获取参会者列表
        conferenceApi.getParticipants(this.cid, this.vmrNumber)
        .then(reslist => {
          this.$store.dispatch('asyncParticipantsData', reslist.list);
        })
      },
      // 增加新的参会者
      addAttendFn() {
          this.$refs.attendChild.showDialog()
      },
      // 静音/取消静音全部参会者
      toggleMuteAllFn() {
          const that = this;
          const _isMute = that.isMuteAll;
          const _data = { 'mute': !_isMute };
          conferenceApi.muteAllUser(that.cid, _data)
              .then(res => {
                  that.isMuteAll = !that.isMuteAll;
              })
              .catch(err => {
                  console.error(err)
              })
      },
      // 锁定/解锁会议
      toggleIsLockFn(){},
      /******************************************* 呼叫参会者 *********************************************/
      // 获取从子组件传来的数据
      showSubmitData(data) {
          console.log('收到来自子组件的attend值: ', data)
          const _this = this;
          const _checked = data;
          let ids = [];
          _checked.forEach(item => {
              ids.push(item.userId)
          });
          _this.$nextTick(() => {
              _this.dialMoreUserFn(ids);
          });
      },
      dialMoreUserFn(ids) {
          const _data = { 'ids': ids};
          conferenceApi.callMoreUsers(this.cid, _data)
              .then(res => {
                  this.$notification( '呼叫成功', 'success');
              })
              .catch(err => {
                  this.$notification( '呼叫失败', 'error');
              })
      },


     /********************** 操作参会者 ************************/
      handleParticipant(command, participant) {
         const that = this;
         switch (command){
           case 'mute':
             that.participantMute(participant)
             break;
           case 'role':
             that.setRole(participant)
             break;
           case 'disconnect':
             that.participantDisconnect(participant);
             break;
           case 'call':
             that.callParticipant(participant)
             break;
         }

       },
      // 静音/解除静音
      participantMute(participant) {
        let _list = Object.assign({}, participant);
        let _type = null;
        if (_list.isMuted === 0) {
          _type = true;
            _list.isMuted = 1;
        } else if (_list.isMuted == 1) {
          _type = false;
            _list.isMuted = 0;
        }
        conferenceApi.setParticipantMute(this.cid, _list.puuid, _type)
        .then(res => {
          this.$notification( _type ? '静音成功' : '解除静音成功', 'success');
        })
        .catch(error => {
          this.$notification('设置失败', 'error');
        })
      },
      // 设置主讲人/取消主讲人
      setRole(participant){
        let _list = Object.assign({}, participant);
        let _role = participant.role;

        conferenceApi.setRole(this.cid, _list)
        .then(res => {
          if (_role === 4001) {
              _list.role = 4002
          } else if (_role === 4002) {
              _list.role = 4001
          }
          this.$notification( _role === 4002 ? '设置主讲人成功' : '取消主讲人成功', 'success');
        })
        .catch(error => {
          this.$notification('设置失败', 'error');
        })
      },
      // 呼叫参会者
      callParticipant(participant) {
        let _list = Object.assign({}, participant);
        const _userId = _list.userId;
        conferenceApi.dialUsers(this.cid, _userId)
        .then(res => {
          this.$notification('呼叫成功', 'success');
        })
        .catch(error => {
          this.$notification('呼叫失败', 'error');
        })
      },
      // 挂断参会者
      participantDisconnect(participant) {
        let _list = Object.assign({}, participant);
        let _puuid = _list.puuid;
        conferenceApi.participantDisconnect(this.cid, _puuid)
        .then(res => {
          this.$notification('挂断成功', 'success');
        })
        .catch(error => {
          this.$notification('挂断失败', 'error');
        })
      }
    },
    created() {
      console.log("进入ParticipantList");
    },
    mounted() {
      // this.getParticipants()
        const data= this.conferenceData;
        const roledata= this.conferenceRoleData;
      console.log("ParticipantList加载完成" )


    },
  }
</script>

<style scoped>
  .side-bar {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    transition-property: left;
    transition-duration: 0.5s;
    background: #3f4a5d !important;
    color: #fff;
    width: 300px;
  }
  .side-bar .el-card.box-card{
    background: transparent;
    color: #fff;
    border: none;
  }
  .side-bar .el-card.box-card .el-card__header{
    padding: 29px 20px;
  }
  .list-item{
    padding: 10px 0;
    position: relative;
  }
  .participant-header{
    position: fixed;
    top: 0;
    z-index: 2;
    border-bottom: 1px solid #EBEEF5;
    display: block;
    width: 100%;
    padding: 20px 10px;
    /*margin-left: -20px;*/
    background: #3f4a5d;
  }
  .participant-header-update{
    position: absolute;
    left: 250px;
    top: 19px;
  }
  /* 姓名 */
  .participant-list{
    display: inline-block;
    vertical-align: middle;

  }
  .participant-list .list-detail{
    display: block;

  }
  .participant-list .list-detail i.participant-state{
    display: inline-block;
    width: 20px;
    height: 16px;
  }


  /* // 更多操作 */
  .list-dot{
    line-height: 45px;
    cursor: pointer;
    color: #fff;
  }
  .participant-update{
    position: absolute;
    right: 0;
    bottom: 25%;
  }
  /* // 头像 */
  /* // 未在线 */
  .inactive .list-name{
    color:#ccc;
  }
  .inactive i.participant-state{
    color: #ccc;
  }
  .inactive .head-avatar span{
    background:#ccc;
    width:40px;
    height:40px;
    border-radius:50%;
    /* float:left; */
    text-align:center;
    line-height: 40px;
    margin-right:16px;
    color:#fff;
    pointer-events: none;
  }

  .avatar{
    display: inline-block;
  }
  .avatar-color {
    display: inline-block;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    text-align: center;
    line-height: 40px;
    margin: 0 10px;
    color: #fff;
    position: relative;
    font-size: 12px;
  }
  .avatar-color0{
    background:#a9d2f2;
  }
  .avatar-color1{
    background:#a9d2f2;
  }
  .avatar-color2{
    background:#c5b3eb;
  }
  .avatar-color3{
    background:#f3b2b2;
  }
  .avatar-color4{
    background:#a7dbc2;
  }
  .avatar-color5{
    background:#f7d4a3;
  }
  .operation ul{
    margin: 0;
  }
  .operation ul li{
    /* // border-top:1px solid #939393; */
    list-style: none;
    text-align:center;
    /* // color:#000; */
    padding: 0;
    line-height: 28px;
    cursor: pointer;
  }
  .operation ul li:hover{
    background: #f0f0f0;
  }
  .operation ul li.disabled{
    cursor: default;
  }
  .operation ul li.disabled:hover{
    background-color: transparent;
  }

</style>
