<template>
  <div>
    <div class="page-header">发起会议</div>

    <div class="white-bg"
         v-loading="loading"
         element-loading-text="拼命加载中"
         element-loading-spinner="el-icon-loading">
      <!-- 发起会议内容 -->
      <div class="appointment">
        <el-form :model="appointmentForm" :rules="rulesForm" ref="appointmentForm" label-width="120px">

          <!-- 会议名称 -->
          <el-form-item label="会议名称" prop="appointmentName">
            <el-col :span="8">
              <el-input v-model="appointmentForm.appointmentName"></el-input>
            </el-col>
          </el-form-item>

          <!-- 会议类型 -->
          <el-form-item label="会议类型" prop="appointmentType">
            <el-radio-group v-model="appointmentForm.appointmentType">
              <el-radio label="2">实时</el-radio>
              <el-radio label="0">预约</el-radio>
            </el-radio-group>
          </el-form-item>

          <!-- 清晰度 -->
          <el-form-item label="清晰度" prop="speed">
            <el-select v-model="appointmentForm.speedName" placeholder="请选择清晰度">
              <el-option v-for="item in speedArr" :key="item.id" :value="item.id" :label="item.name">{{item.name}}</el-option>
            </el-select>
          </el-form-item>

          <!-- ================== 预约会议显示项 begin============== -->
          <template v-if="appointmentForm.appointmentType == '0'">
            <div>
              <!-- 会议密码 -->
              <el-form-item label="会议密码" prop="hostPwd">
                <el-col :span="6">
                  <el-input v-model="appointmentForm.hostPwd" maxlength="4"></el-input>
                </el-col>
              </el-form-item>
              <!-- 会议开始时间 -->
              <el-form-item label="会议开始时间">
                <el-col :span="8">
                  <el-form-item>
                    <el-date-picker
                    type="date"
                    placeholder="选择日期"
                    v-model="appointmentForm.selectedDate"
                    format="yyyy-MM-dd"
                    value-format="timestamp"
                    style="width: 100%;"></el-date-picker>
                  </el-form-item>
                </el-col>
                <el-col class="text-center" :span="1">-</el-col>
                <el-col :span="4">
                  <el-form-item>
                    <el-time-select
                    placeholder="选择时间"
                    v-model="appointmentForm.selectedHour"
                    :picker-options="{
                      start: '00:00',
                      step: '00:10',
                      end: '23:50'
                    }">
                    </el-time-select>
                  </el-form-item>
                </el-col>
              </el-form-item>

              <!-- 会议时长 -->
              <el-form-item label="会议时长" prop="appointmentPeriod">
                <el-col :md="8" :lg="6">
                  <!-- <el-input v-model="appointmentForm.appointmentPeriod"></el-input> -->
                  <el-input-number v-model="appointmentForm.appointmentPeriod" controls-position="right" :min="0.5" :step="0.5"></el-input-number>
                </el-col>
                <el-col :md="8" :lg="10">
                  <span class="gray"> 最小单位0.5小时</span>
                </el-col>
              </el-form-item>

              <!-- 周期会议 -->
              <el-form-item>
                <el-checkbox v-model="appointmentForm.isRepeat">周期会议</el-checkbox>
              </el-form-item>
              <!-- 周期会议 - 起止日期 -->
              <template v-if="appointmentForm.isRepeat === true">
                <el-form-item label="起止日期">
                  <el-date-picker
                    v-model="appointmentForm.repeatDate"
                    type="daterange"
                    start-placeholder="周期开始"
                    end-placeholder="周期结束"
                    :picker-options="pickerOptions"
                    :default-time="['00:00:00', '23:59:59']">
                  </el-date-picker>
                </el-form-item>
                 <!-- 周期会议 - 周期选择 -->
                <el-form-item label="周期选择" prop="cycleMode">
                  <el-radio-group v-model="appointmentForm.cycleMode">
                    <el-radio label="0">周</el-radio>
                    <el-radio label="1">月</el-radio>
                  </el-radio-group>
                </el-form-item>
                <!-- 周期会议 - 重复周期 -->
                <el-form-item label="重复周期" prop="cycleMode">
                  <!-- 按周重复 -->
                  <template v-if="appointmentForm.cycleMode == 0">
                    <el-checkbox-group v-model="weekDayArr" @change="chooseWeekFn">
                      <el-checkbox v-for="(week, index) in repeatWeeks" :label="index+1" :key="week">{{week}}</el-checkbox>
                      <el-button type="primary" class="" @click="workDayFn">{{isWorkDayText}}</el-button>
                      <el-button type="primary" class="" @click="allWeekFn">{{weektext}}</el-button>
                    </el-checkbox-group>

                  </template>
                  <!-- 按月重复 -->
                  <template v-else-if="appointmentForm.cycleMode == 1">
                    <div>
                      <span>每月</span>
                      <ul class="select-result">
                        <li v-for="item in selectMonthDate" :key="item">
                          <a href="javascript:;" class="svoc-bg-color" @click="deleteThisDay(item)">{{item}}</a>
                        </li>
                      </ul>
                      <span>号</span>

                      <el-popover
                        placement="bottom"
                        width="400"
                        trigger="click">
                        <el-button type="text" slot="reference" @click="isshowbox=!isshowbox">{{ isshowbox?'收起选择面板':'展开选择面板' }}</el-button>
                        <ul class="updown_box">
                          <li v-for="list in oneMonthDate" :key="list.day" @click="selectMonth(list)" :class="list.type?'selected':''">
                            <a href="javascript:">{{list.day}}</a></li>
                        </ul>
                      </el-popover>
                    </div>
                  </template>
                </el-form-item>


              </template>
             <div class="line"></div>
            </div>
          </template>
          <!-- ================== 预约会议显示项 end============== -->
          <!-- 参会者 -->
          <el-form-item label="参会者">
            <el-tag
              :key="tag.userId"
              v-for="tag in hiddenUserListData"
              closable
              :disable-transitions="false"
              @close="handleRemoveUser(tag)">
              {{tag.realName}}
            </el-tag>
            <el-tag
              :key="tag.userId"
              v-for="tag in showCheckedUserListData"
              closable
              :disable-transitions="false"
              @close="handleRemoveUser(tag)">
              <i v-if="tag.isHost" class="fa fa-user-secret"></i> {{tag.realName}}
            </el-tag>
            <el-button class="button-new-tag" size="small" @click="chooseUserFn"> + </el-button>
          </el-form-item>

          <!-- 参会者进入时静音 -->
          <el-form-item>
            <el-checkbox v-model="appointmentForm.isMute">参会者进入时静音</el-checkbox>
          </el-form-item>

          <!-- 会议开始开启直播 -->
          <el-form-item>
            <el-col :span="6">
              <el-checkbox v-model="appointmentForm.isLive" :disabled="!appointmentForm.isCanLive">会议开始开启直播</el-checkbox>
            </el-col>
            <!-- 直播密码 -->
            <el-col :span="12" v-if="appointmentForm.isLive === true">
              <el-form-item label="直播密码" prop="livePwd">
                <el-input v-model="appointmentForm.livePwd" maxlength="4" style="width:120px;"></el-input>
              </el-form-item>
            </el-col>
          </el-form-item>
          <el-form-item>
            <el-checkbox v-model="appointmentForm.isRecord" :disabled="!appointmentForm.isCanRecord">会议开始开启录制</el-checkbox>
          </el-form-item>
          <!-- 会议描述 -->
          <el-form-item label="会议描述" prop="appointmentDesc">
            <el-input type="textarea" v-model="appointmentForm.appointmentDesc"></el-input>
          </el-form-item>


          <div class="text-center">
            <el-button type="primary" @click="submitForm('appointmentForm')" :loading="submitLoading" style="width:160px;">提 交</el-button>
          </div>

        </el-form>

      </div>

    </div>

    <AddAttend ref="attendChild"
    v-on:emitSubmitData="showSubmitData"
    v-bind:usedType="1" />

    <template>
      <component v-show="false" :is="currentComponent"></component>
    </template>
    <!-- 发起会议 成功 实时会议 -->
    <el-dialog
          title=""
          :visible.sync="submitDialogVisible"
          width="40%"
          center>
        <div>
          <div class="text-center submit-dialog-title">
            <i class="el-icon-success red succ-icon"></i>
            <h3>发起会议成功</h3>
          </div>
          <div class="submit-dialog-content">
            <el-row>
              <el-col :span="6" :offset="4">会议名称:</el-col>
              <el-col :span="14">{{joinMeetingData.appointmentName}}</el-col>
            </el-row>
            <el-row>
              <el-col :span="6" :offset="4">会 议 号:</el-col>
              <el-col :span="6">{{joinMeetingData.vmrNumber}}</el-col>
            </el-row>
            <el-row>
              <el-col :span="6" :offset="4">会议密码:</el-col>
              <el-col :span="6">{{joinMeetingData.participantPin}}</el-col>
            </el-row>
          </div>
        </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelJoinFn">取 消</el-button>
        <el-button type="primary" @click="joinMeetingFn">立即入会</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { common } from "@/util/common.js";
import { ucApi } from '@/server/ucapi'
import AddAttend from '@/components/AddAttend'
import { eventBus } from '@/config/eventbus'


export default {
  name: 'book',
  components: {
      AddAttend,
      JoinMeeting: () => import('../components/JoinMeeting')
  },
  data() {
    const validatePeriod = (rule, value, callback ) => {
      if(!value){
          callback(new Error('请输入会议时长'))
      }else{
        if(value % 0.5 != 0) {
          callback(new Error('最少时长0.5小时'))
        }else{
          callback()
        }
      }
    }
    return {
      loading: true,
      loginUserData: common.getLoginMsg(),
      submitLoading: false,
      templateData: {
        type: 0, //类型：0新增，1修改，2历史，3群组
        infoId: 0  //对应类型：0默认‘0’，1为‘appointmentId’，2为‘cid’，3为‘groupId’
      },
      // 表单
      appointmentForm: {
        appointmentName: '',//会议名称
        appointmentType: '2',//会议类型
        speedName: '',
        speed: '', //清晰度
        hostPwd: '',//会议密码
        cycleMode: '0',//周期会议重复方式
        startTime: '',//会议开始时间
        selectedDate: new Date().getTime(),//会议开始时间
        selectedHour: '',
        // selectedMinute: '30',
        appointmentPeriod: '1',//会议时长
        isRepeat: false,//是否周期会议
        repeatDate: [],
        repeatStartTime: '', //周期会议开始时间
        repeatEndTime: '',//周期会议结束时间
        // cycleMode: '0',//周期会议重复类型
        repeatRule: '',//重复周期
        isMute: false,//是否静音
        isLive: false,//是否直播
        livePwd: '',//直播密码
        isRecord: false,//是否录制
        isCanLive: false,//是否允许直播
        isCanRecord: false,//是否允许录制
        appointmentDesc: '',//会议描述
        appointmentUserList: []
      },
      // 表单规则验证
      rulesForm: {
        // 验证会议名称
        appointmentName: [
          { required: true, message: '请输入会议名称', trigger: 'blur' },
          { min: 3, max: 20, message: '请输入不超过20个字符的会议名称', trigger: 'blur' }
        ],
        // 验证清晰度
        speed: [
          { required: true, message: '请选择清晰度', trigger: 'change' }
        ],
        // 验证会议时长
        appointmentPeriod: [
          { trigger: 'change', validator: validatePeriod }
        ]
      },
      // 清晰度
      speedArr: null,
      // 参会者
      hiddenUserListData: [],
      showUserListData: [],
      showCheckedUserListData: [],
      // 选择周期会议日期
      pickerOptions: {
        disabledDate(time) {
          return (time.getTime() + 3600 * 1000 * 24) < Date.now();
        },
      },
      // 按周重复
      repeatWeeks: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      weekDayArr: [],
      isWorkDay: false,
      isWorkDayText: '工作日',
      isAllWeek: false,
      weektext: '全选',
      // 按月重复
      // oneMonthDate: [],
      selectMonthDate: [],
      monthDateArr: [],
      isshowbox: false,

      // 发起会议成功/失败
      currentComponent: '',
      joinMeetingData: {appointmentName: '',vmrNumber: '', participantPin:''},
      submitDialogVisible: false


    }
  },

  computed: {
    oneMonthDate: function () {
      let arr = [...Array(31).keys()];
      arr.forEach(item => {
        let obj = { day: item + 1, type: false };
        arr[item] = obj
      });
      // let temp = arr.map((item, index, arr) => {
      //     return  {day: item + 1, type: false}
      // });

      return arr
    }
  },
  methods: {
    //查询发起会议模板
    getTemplate() {
      ucApi.getConferenceTemplate(this.templateData.type, this.templateData.infoId)
      .then((res) => {
        this.loading = false;
        const resData = res;
        // this.appointmentForm = resData;
        resData.appointmentType = resData.appointmentType + '';
        resData.cycleMode = resData.cycleMode + '';

        resData.selectedDate = resData.startTime;
        resData.selectedHour = common.formatDateTime(resData.startTime);

        resData.repeatDate = [resData.repeatStartTime, resData.repeatEndTime];

        resData.speed = resData.speedName = resData.speed+'';
        this.speedArr = common.objToArr(resData.speedMap);

        const hiddenUser = [];
        const visibleUser = [];
        if (resData.users) {
          resData.users.forEach((item) => {
            if (item.isHost) {
              item.isHost = false;
            }
            if (item.isShow === 0) {
              hiddenUser.push(item);
            } else {
              visibleUser.push(item);
            }
          });
        }

        this.hiddenUserListData = hiddenUser;
        this.showUserListData = visibleUser;
        if (resData.repeatRule) {
          var repeatRuleArr = resData.repeatRule.split(',');
        } else {
          var repeatRuleArr = resData.repeatWeekRule.split(',');
        }

        if (resData.cycleMode == 0) {
          repeatRuleArr.forEach(item => {
            this.weekDayArr.push(parseInt(item, 10));
          });
        } else {
          repeatRuleArr.forEach(item => {
            this.selectMonthDate.push(parseInt(item, 10));
          });
        }

      this.appointmentForm = resData
//      console.log('appointmentForm------',this.appointmentForm)

      }).catch((err) => {

      });
    },

    submitForm(formName){
      this.submitLoading = true;
      this.$refs[formName].validate((valid) => {
        if(valid){
          //  console.log(this.appointmentForm)
          let postData = this.appointmentForm;
          // 清晰度
          postData.speed = parseInt(postData.speedName) //字符串转int

          //会议开始时间
          let stringTime = common.formatDate(postData.selectedDate) + ' ' + postData.selectedHour + ':00';
          postData.startTime = new Date(stringTime).getTime();
          //参会人员
          postData.appointmentUserList = this.hiddenUserListData.concat(this.showCheckedUserListData);

          //周期
          if (postData.cycleMode == '0') {
            postData.cycleMode = 0;
            postData.repeatRule = this.weekDayArr.join(',');
          } else {
            postData.cycleMode = 1;
            postData.repeatRule = this.selectMonthDate.join(',');
          }
          //历史会议再次发起 不传appointmentId
          if (this.appointType == 2) {
            postData.appointmentId = '0';
          }

          this.submitFormDataFn(postData)
        }else{
          return false;
        }
      })


    },
    submitFormDataFn(val) {
      ucApi.submitConferenceForm(val)
      .then(res => {
        const _res = res;
        if (_res.appointmentType == 2) {
            this.submitDialogVisible = true;
            this.joinMeetingData = {
                appointmentName: _res.appointmentName,
                vmrNumber: _res.appointmentNumber,
                participantPin: _res.hostPwd
            }
        } else {
            this.$notification('发起会议成功', 'success');
            this.$router.push('/conference/schedule')
        }
        this.submitLoading = false;
      })
      .then(()=>{
//        this.$router.push('/conference/schedule')
      })
      .catch(error => {
        this.$notification(error, 'error');
        this.submitLoading = false;
      })
    },
    // 实时会议 加入会议
    joinMeetingFn(){
        const that = this;
        that.submitDialogVisible = false;
        that.currentComponent = 'JoinMeeting';
        const meetingData = {
            conference: that.joinMeetingData.vmrNumber,
            pin: that.joinMeetingData.participantPin || "",
            host: that.loginUserData.webrtcAddress
        }
        that.$store.commit("setJoinProgress", true);
        setTimeout(() => {
            // 触发 eventbus 的 requestJoinMeeting 事件，传递参数 meetingData。
            eventBus.$emit('requestJoinMeeting', meetingData)
        }, 800);
    },
    // 不立即入会 跳转到会议日程
    cancelJoinFn() {
      this.submitDialogVisible = false;
      this.$router.push('/conference/schedule')
    },
    chooseHour(value){
      // console.log(value)
    },
    /******************************************* 参会者 *********************************************/
    // 编辑参会者
    chooseUserFn(){
      // this.AddAttendDialog = true;
       this.$refs.attendChild.showDialog()
       this.$refs.attendChild.checkedUserList = this.showCheckedUserListData;
    },
    // 获取从子组件传来的数据
    showSubmitData(data) {
      this.showCheckedUserListData = [];
      console.log('收到来自子组件的attend值: ', data)
      this.showCheckedUserListData = data;
    },
    // 移除已选择的参会者
    handleRemoveUser(user) {
      this.showCheckedUserListData.splice(this.showCheckedUserListData.indexOf(user), 1);
    },
    /******************************************* 周期会议 *********************************************/
    chooseWeekFn(value){
      let checkedWeekCount = value;
      // console.log(this.weekDayArr)
    },
    // 选择/取消 工作日
    workDayFn() {
      this.isWorkDay = !this.isWorkDay;
      this.isWorkDayText = this.isWorkDay ? '取消' : '工作日';
      if (this.isWorkDay) {
        this.weekDayArr = [1, 2, 3, 4, 5];
      } else {
        this.weekDayArr = [];
      }
    },
    // 全选/全不选
    allWeekFn() {
      this.isAllWeek = !this.isAllWeek;
      this.weektext = this.isAllWeek ? '全不选' : '全选';
      if (this.isAllWeek) {
        this.weekDayArr = [1, 2, 3, 4, 5, 6, 7];
      } else {
        this.weekDayArr = [];
      }
    },
    // 删除已经选择的日期
    deleteThisDay(day) {
      this.oneMonthDate[day - 1].type = false;
      let updateArr = this.monthDateArr;
      for (var i = 0; i < updateArr.length; i++) {
        if (updateArr[i] == day) {
          this.monthDateArr.splice(i, 1);
        }
      }
      this.selectMonthDate = this.monthDateArr;
    },
    selectMonth(days){
      let {day, type} = days;
      if(!type){
        days.type = true;
        this.monthDateArr.push(day)
      }else{
        days.type = false;
        let oldindex = this.monthDateArr.indexOf(day);
        this.monthDateArr.splice(oldindex, 1);
      }
      this.selectMonthDate = this.monthDateArr;
    },

    /*******************************************  *********************************************/
    checkPeriod(val){
      if(!val){
        return false
      }else{
        if(val % 0.5 != 0) {
          return false
        }else{
          return true
        }
      }
    }

  },
  created() {
    this.getTemplate()
  },
  mounted() {

  },
  destroyed() {

  },
}
</script>

<style scoped>
ul.select-result,
ul.select-result li{
  display: inline-block;
  vertical-align: middle;
}
 ul.select-result li a{
	height:25px;
	padding: 0 10px 0 10px;
    border-radius: 3px;
	line-height:25px;
	display:block;
	position:relative;
	float:left;
	margin:0 10px 10px 0;
	color:#fff;
	font-size:14px;
}
/* ul.updown_box{
	float: left;
  padding: 15px;
  width:280px;
  -webkit-box-sizing: content-box;
  -moz-bo··x-sizing: content-box;
  box-sizing: content-box;
  box-shadow: 1px 1px 3px #ccc;
} */
ul.updown_box li{
	float:left;
	min-width: 28px;
  height: 25px;
  margin: 5px;
  text-align: center;
}
ul.updown_box li a{
	display:block;
	font-size:14px;
	padding:6px;
	line-height:10px;
}
 ul.updown_box li.selected{
	border-bottom: 3px solid #07a2e8;
}
  .submit-dialog-title .succ-icon{
    font-size: 40px;
    color: #08a908;
    margin-bottom: 20px;
  }

  .submit-dialog-content{
    margin: 20px 0;
  }

</style>
