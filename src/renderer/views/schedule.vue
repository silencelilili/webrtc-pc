<template>
  <div>
    <div class="page-header">会议日程</div>
    <div v-loading="loading"
         element-loading-text="拼命加载中"
         element-loading-spinner="el-icon-loading">
      <!-- 查询 -->
      <div class="clearfix" style="overflow:hidden;">
        会议类型：<el-select v-model="searchData.type" placeholder="请选择" style="width:100px;" @change="dataSearchFn">
          <el-option value="" label="全部会议"> 全部会议</el-option>
          <el-option value="0" label="预约会议"> 预约会议</el-option>
          <!-- <el-option value="1" label="周期会议"> 周期会议</el-option> -->
          <el-option value="2" label="实时会议"> 实时会议</el-option>
        </el-select>
        <div class="pull-right">
          <el-input type="text" v-model="searchData.keywords" placeholder="会议名称、发起人" @keyup.native="dataSearchFn"></el-input>
        </div>
      </div>
      <!-- 列表 -->
      <div v-if="tableData.list && tableData.list.length>0">
        <div>
          <el-row class="schedule-list" v-for="list in tableData.list" :key="list.appointmentId">
            <!-- 会议日程 日期  ------------>
            <el-col class="schedule-date" :span='4'>
              <p>{{list.startTime | date('yyyy-MM-dd')}}</p>
              <p>{{list.startTime | date('HH:mm')}}</p>
            </el-col>
            <!--  会议日程 内容 ------------->
            <el-col class="schedule-content" :span='14'>
              <h3>
                <!-- <router-link to="{path:'/schedule-detail'}" class="operation-meeting font16">{{list.appointmentName}}</router-link> -->
                {{list.appointmentName}}
                <span v-if="list.isRepeat==true" class='icon-refresh'></span>
              </h3>
              <p class="schedule-content-list">
                <span>会议号：{{list.appointmentNumber}}</span>
                <span>密 码：{{list.hostPwd}}</span>
                <span>发起人：{{list.realName}}</span>
                <span>时 长：{{list.appointmentPeriod}} 小时</span>
                <span>会议类型：
                  <span v-if="list.appointmentType!=2">
                    <span v-if="list.isAppoint==true">预约会议</span>
                    <span v-if="list.isAppoint==false">被邀请会议</span>
                  </span>
                  <span v-if="list.appointmentType==2">实时会议</span>
                </span>
                <span>状态：
                  <span v-if="list.appointmentStatus==0">正常</span>
                  <span v-else-if="list.appointmentStatus==1 || list.appointmentStatus==3">无法召开</span>
                  <span v-else-if="list.appointmentStatus==2">配置成功</span>
                  <span v-else-if="list.appointmentStatus==4">启动中</span>
                  <span v-else-if="list.appointmentStatus==5">进行中</span>
                </span>
              </p>
            </el-col>
            <!-- 会议日程 操作 ------------->
            <el-col class="schedule-update" :span='6'>
              <!-- 预约会议 -->
              <div v-if="list.appointmentType!=2">
                <!-- 预约会议 -->
                <div v-if="list.isAppoint==true">
                  <div class="text-left" v-if="list.appointmentStatus==0"><!-- 正常 -->
                    <button class="btn btn-svoc radius20 delete-meeting"
                            @click="deleteMeetingFn(list)">删除
                    </button>
                    <button class="btn btn-svoc radius20 liveSrc" v-if="list.isLive==true"
                            @click="liveSrcFn(list)">直播链接
                    </button>
                  </div>
                  <div class="text-left" v-if="list.appointmentStatus==1 || list.appointmentStatus==3"><!-- 无法召开 -->
                    <button class="btn btn-svoc radius20 cancel-meeting" @click="cancelMeetingFn(list)">取消预约</button>
                    <button class="btn btn-svoc radius20 liveSrc" v-if="list.isLive==true"
                            @click="liveSrcFn(list)">直播链接
                    </button>
                  </div>
                  <div class="text-left" v-if="list.appointmentStatus==2 || list.appointmentStatus==4"><!-- 配置成功或启动中 -->
                    <button class="btn btn-svoc radius20 liveSrc" v-if="list.isLive==true" @click="liveSrcFn(list)">直播链接
                    </button>
                  </div>
                  <div class="text-left" v-if="list.appointmentStatus==5">
                    <!-- <button class="btn btn-svoc radius20 contorl-btn" data="list" @click="controlMeetingFn(list)">会议控制</button> -->
                    <!-- <a [routerLink]="['/page/meeting/meeting-control',list.controlId]" class="btn btn-svoc radius20 contorl-btn">会议控制</a> -->
                    <!-- <meeting-control-btn class="radius20" [meetingData]="list.controlId"
                                      ></meeting-control-btn> -->
                    <button class="btn btn-svoc radius20 liveSrc" v-if="list.isLive==true" @click="liveSrcFn(list)">直播链接
                    </button>
                    <a href="javascript:;" class="btn btn-svoc radius20" @click="joinMeetingFn(list)">入会</a>
                  </div>
                </div>
                <!-- 被邀请的，进行中的会议 -->
                <div class="text-left" v-if="list.isAppoint==false&&list.appointmentStatus==5">
                  <a href="javascript:;" class="btn btn-svoc radius20" @click="joinMeetingFn(list)">入会</a>
                </div>
              </div>
              <!-- 实时会议 -->
              <div v-if="list.appointmentType==2" class="text-left">
                <span v-if="list.isAppoint==true">
                  <!-- <button v-if="list.appointmentStatus==5" class="btn btn-svoc radius20 contorl-btn" data="list" @click="controlMeetingFn(list)">会议控制</button> -->
                  <!-- <a v-if="list.appointmentStatus==5" [routerLink]="['/page/meeting/meeting-control',list.controlId]" class="btn btn-svoc radius20 contorl-btn">会议控制</a> -->
                  <!-- <span v-if="list.appointmentStatus==5"><meeting-control-btn class="radius20" -->
                                                                              <!-- [meetingData]="list.controlId"
                                                                            ></meeting-control-btn></span> -->

                  <button class="btn btn-svoc radius20 liveSrc" v-if="list.isLive==true"
                          data="list.appointmentNumber"
                          @click="liveSrcFn(list)">直播链接</button>
                </span>
                <a href="javascript:;" class="btn btn-svoc radius20" @click="joinMeetingFn(list)">入会</a>
              </div>
            </el-col>
          </el-row>
        </div>
        <!-- 分页 -->
        <div class="text-right">
          <el-pagination
            background
            layout="total, prev, pager, next"
            :page-size="5"
            :total="tableData.totalPages"
            :current-page.sync="tableData.currentPage"
            @current-change="handleCurrentChange">
          </el-pagination>
        </div>
      </div>
      <!-- 无数据 -->
      <template v-else>
      <div class="text-center no-data" style="margin-top:15%;">
        <img src="../assets/img/vcs/no_schedule_data.png"/>
        <p>无会议记录</p>
      </div>
    </template>
    </div>
    <template>
      <component v-show="false" :is="currentComponent"></component>
    </template>

  <!-- 删除会议 -->
    <el-dialog title="删除会议" :visible.sync="dialogDeleteModal">
      <div class="">
        <p class="text-center font16">您删除的会议是有重复有效期的会议，是否要删除掉？</p>
        <div class="del-time-box">
          <label class="font16">
            <input type="checkbox" name="checkedAll" :checked="isSelectedAll" @click="_allchecked($event)">
            会议有效时间</label>
          <form id="deleteIdForm">
            <div class="del-time-item">
              <div class="" v-for="(repeatlist, index) in repeatListData" :key="repeatlist.appointmentId">
                <label>
                  <input type="checkbox" name="appointmentId" :checked="isSelected(repeatlist)" @click="updateSelection($event,repeatlist)"/>
                  {{index+1}}、{{repeatlist.startTime | date('yyyy-MM-dd')}}
                </label>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogDeleteModal = false">取 消</el-button>
        <el-button type="primary" @click="deleteRepeatFn()">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 复制直播链接 -->
    <el-dialog
    title="直播链接"
    width="40%"
    :visible.sync="liveSrcModal">
      <div class="marginTB10">
        直播地址：<a href="javascript:;" class="srcContentShow">{{srcContent}}</a>
      </div>
      <div class="marginTB10">
        直播密码：{{liveSrcModalData.livePwd}}
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="copyLiveSrcFn()">复制链接</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { common } from "@/util/common.js";
import {ucApi} from '@/server/ucapi'
import { eventBus } from '@/config/eventbus'
import { environment } from '@/config/environment';
// import JoinMeeting from '@/components/JoinMeeting.vue'
import { setInterval, clearInterval } from 'timers';


export default {
  name: 'schedule',
  components: {
     JoinMeeting: () => import('../components/JoinMeeting')
  },
  data() {
    return {
      loading: true,
      loginUserData: common.getLoginMsg(),
      webRtcUrl: '',
      searchData: {
        startTime: '', //查询开始时间
        endTime: '', //查询结束时间
        type: '', //会议类型
        pageNum: '1', //第几页
        pageSize: '5',  //每页多少条
        appointmentName: ''//会议名称
      },
      tableData: {
        list: [],
        totalPages: 0,
        currentPage: 1
      },
      selectedData: [],
      dialogDeleteModal: false,
      repeatListData: [],

      // 直播链接
      liveSrcModal: false,
      liveSrcModalData: {
          livePwd: ''
      },
      srcContent: '',
      srcCopyContent: '',
      currentComponent: ''
    }
  },
  computed: {

  },
  methods: {
    // 获取数据列表
    getTableDataFn() {
      const that = this;
      ucApi.getScheduleList(that.searchData)
      .then(res => {
        that.tableData = {
          list: res.list,
          totalPages: res.total,
          currentPage: res.pageNum
        };
        that.loading = false;
      })
      .catch(err => {
        console.log('获取数据失败: ', err)
      })
    },
    // 分页
    handleCurrentChange(val){
      this.searchData.pageNum = val
      this.tableData.currentPage = val;
      this.getTableDataFn();
    },
    // 查询
    dataSearchFn: _.debounce(function () {
      const that = this;
      that.getTableDataFn()
    }, 300),

    // 删除会议
    deleteMeetingFn(list) {
      // 先判断是否存在重复会议
      if(list.isRepeat) {
        this.judgeIsRepeat(list.appointmentId);

      }else{
        let deleteArr = [];
        deleteArr.push(list.appointmentId);
        this.$confirm('是否确认删除会议？', '删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.sureDeleteMeetingFn(deleteArr)
      }).catch(() => {

      });
      }
    },
    // 删除重复会议
    deleteRepeatFn(){
      let deleteArr = [];
      this.selectedData.forEach(item => {
        deleteArr.push(item.appointmentId);
      });
      this.sureDeleteMeetingFn(deleteArr);
    },
    // 确定删除
    sureDeleteMeetingFn(data) {
      let deleteData = ''; //会议id，多个用‘，’隔开
      data.forEach(item => {
        deleteData += item + ',';
      });
      ucApi.deleScheduleItem(deleteData)
      .then(res => {
        this.$notification('删除成功！', 'success')
        this.getTableDataFn();
        this.dialogDeleteModal = false;
      })
      .catch(err => {
        this.$notification(err, 'error')
      })
    },

    // 获取重复会议
    judgeIsRepeat(appointmentId) {
      const that = this;
      ucApi.judgeIsRepeat(appointmentId)
      .then(res => {
        that.dialogDeleteModal = true;
        that.repeatListData = res;
        for (let i = 0; i < that.repeatListData.length; i++) {
          if (that.repeatListData[i].appointmentId === appointmentId) {
            that.updateSelected('add', that.repeatListData[i]);
            return;
          }
        }
      })
      .catch(err => {

      })
    },

    // 会议日程 - 加入会议
    joinMeetingFn(data){
      const that = this;
      that.currentComponent = 'JoinMeeting'
      const meetingData = {
        conference: data.vmrNumber,
        pin: data.hostPwd || "",
        host: this.loginUserData.webrtcAddress
      }
      that.$store.commit("setJoinProgress", true);
      setTimeout(() => {
        // 触发 eventbus 的 requestJoinMeeting 事件，传递参数 meetingData。
        eventBus.$emit('requestJoinMeeting', meetingData)
      }, 800);
      // that.$nextTick(()=>{
      //   that.$store.commit("setJoinProgress", true);
      //   // 触发 eventbus 的 requestJoinMeeting 事件，传递参数 meetingData。
      //   eventBus.$emit('requestJoinMeeting', meetingData)
      // })
    },

    // 会议日程 - 直播链接
    liveSrcFn(list){
      this.liveSrcModal = true;
      this.liveSrcModalData = list;
      let appointmentId = list.appointmentId;
      this.srcContent = `${environment.apiBase}/#/watch-live/${appointmentId}`;
      this.srcCopyContent = `链接：${environment.apiBase}/#/watch-live/${appointmentId} \n 密码：${list.livePwd}`;
    },
    copyLiveSrcFn() {
      const _this = this;
      const clipboard = _this.$electron.clipboard;
      clipboard.writeText(_this.srcCopyContent)
      _this.$nextTick(()=>{
         _this.$notification('复制成功！', 'success');
//        _this.$message({
//          center: true,
//          message: '复制成功！',
//          type: 'success'
//        });
        _this.liveSrcModal = false;
        _this.liveSrcModalData = {
            livePwd: ''
        };
      })
    },
    // 取消预约
    cancelMeetingFn(list) {
        let cancelArr = [];
        cancelArr.push(list.appointmentId);
        this.$confirm('是否确认取消预约会议？', '取消预约', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }).then(() => {
            this.sureDeleteMeetingFn(cancelArr)
        }).catch(() => {

        });
    },

    /********************************* 复选框 选择操作 ***********************************/
    updateSelected(action, list) {
      if (action == 'add' && this.selectedData.indexOf(list) == -1) {
        this.selectedData.push(list);
      }
      if (action == 'remove' && this.selectedData.indexOf(list) != -1) {
        this.selectedData.splice(this.selectedData.indexOf(list), 1);
      }
      this.isdisabled = this.selectedData.length <= 0;
    },
    //更新某一列数据的选择
    updateSelection($event, list) {
      let checkbox = $event.target;
      let action = (checkbox.checked ? 'add' : 'remove');
      this.updateSelected(action, list);
    },
    //全选操作
    _allchecked($event) {
      let checkbox = $event.target;
      let action = (checkbox.checked ? 'add' : 'remove');
      for (let i = 0; i < this.repeatListData.length; i++) {
        let contact = this.repeatListData[i];
        this.updateSelected(action, contact);
      }
    },
    isSelected(list) {
      return this.selectedData.indexOf(list) >= 0;
    },
    isSelectedAll() {
      if (this.repeatListData.length > 0) {
        return this.selectedData.length === this.repeatListData.length;
      } else {
        return false;
      }
    }
  },
  created() {
    this.getTableDataFn()
  },
  mounted() {

  },
  destroyed() {


  },
}
</script>

<style scoped>
.schedule-list{
	background: #fbfbfb;
  padding: 20px 10px;
  overflow: hidden;
  border-radius: 45px;
  box-shadow: 1px 1px 1px 1px #ccc;
  margin: 20px 0;
}

.schedule-date{
	color: #ff7989;
  text-align: center;
  margin: 10px 0;
}
.schedule-date p{
	font-size:16px;
}

.schedule-content{
  border-left: 1px solid #07a2e8;
  padding-left: 20px;
}
.schedule-content-list{
	margin:10px 0
}
p.schedule-content-list>span{
	display: inline-block;
  margin-right: 25px;
}

.schedule-update{
	line-height:55px;
}

.del-time-box{
	margin-left: 40px;
}
.del-time-item{
	max-height: 300px;
	overflow-y: auto;

}
.del-time-item>div{
	display: inline-block;
	margin-right: 10px;
}

</style>
