<template>
<div>
  <el-dialog title="添加参会者" :visible.sync="AddAttendDialog" width="60%" :custom-class="'attend-dialog'">
    <!--<el-row>-->
      <div class="attend-header">
        <el-button type="text" @click="cancelHostFn" style="font-size: 12px;" v-show="usedType==1">取消主讲人</el-button>
        <el-button type="text" @click="emptyAttendFn" style="font-size: 12px;">清空参会者</el-button>
      </div>
    <!--</el-row>-->
    <el-row class="attend-box">
      <el-col :span='8'>
        <div class="search-input">
          <el-input
                  placeholder="输入关键字进行搜索"
                  v-model="searchByName">
          </el-input>
        </div>
        <el-tree
          class="attend-tree filter-tree"
          show-checkbox
          node-key="userId"
          :data="userList"
          :props="defaultProps"
          default-expand-all
          :filter-node-method="filterNode"
          @check="handleCheckUser"
          ref="attendTree">
        </el-tree>
      </el-col>

      <el-col :span='16'>
        <el-table
          :data="checkedUserList"
          height="400"
          style="width: 100%;height:400px;overflow-y:auto; padding:0 15px;">
          <el-table-column
            prop="name"
            label="姓名"
            width="'40%'">
          </el-table-column>
          <el-table-column
            label="主讲人"
            v-if="usedType==1"
            width="'40%'">
            <template slot-scope="scope">
              <input type="radio" v-model="isHost" :value="scope.row.userId">
            </template>
          </el-table-column>
          <el-table-column
            label="操作">
            <template slot-scope="scope">
              <a href="javascript:;" @click="removeUser(scope.row)" title="删除"><i class="el-icon-delete"></i></a>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancelAttendFn">取 消</el-button>
      <el-button type="primary" @click="sureAttendFn">确 定</el-button>
    </div>
  </el-dialog>


</div>
</template>

<script>
import { common } from "@/util/common.js";
import {ucApi} from '@/server/ucapi'
export default {
  name: 'addAttend',
  props: ['usedType'],
  data() {
    return {
      // 选择参会者
      AddAttendDialog: false,
      searchByName: '', // 查询关键字
      commonId: '0' , //会议id
      switchflag: 1,
      userList: [], // 参会者列表
      checkedUserList: [], // 已选择的参会者
      isHost:'', // 是否为主讲人
      oldHostId: '',
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      attendType: 1 // 1:发起会议邀请参会者；2：会中邀请参会者
    }
  },
  computed: {

  },
  methods: {
    showDialog(){
      this.AddAttendDialog = true;
    },
    // param: methodFlag 方法标识。
    /*1：发起会议菜单数据格式。
    2：会议议程数据格式。（选中已在会议中的人）
    3：预约邀请参会人数据格式。会控（踢掉已在会中的人
    4：从群组发起会议。
    5：从历史会议查询会议。  默认查询（1）的发起会议。没有任何ischecked
    */
    loadUserData(){
      const getData = {'search': this.searchByName, 'commonId': this.commonId, 'authority': +this.switchflag === 1 ? 1 : 0};
      ucApi.loadUserListData(getData)
      .then((res) => {
        this.userList = res;
      }).catch((err) => {
        console.log(err)
      });
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.name.indexOf(value) !== -1;
    },
    setCheckedKeys(id, type){
      this.$refs.attendTree.setCheckedKeys(id,type);
    },
    handleCheckChange(data, checked, indeterminate) {
      const that = this;
      // console.log(data, checked, indeterminate);
      // if(checked) {
      //   that.setCheckedKeys([data.userId], true)
      // }else{
      //   that.setCheckedKeys([data.userId], false)
      // }
    },
    handleCheckUser(data, node){
      const that = this;
      that.checkedUserList = [];
      let _checkedList = [];
      const _checkedNodes = node.checkedNodes;
      _checkedNodes.forEach(item => {
        if(!item.children && item.apiUserId){
          _checkedList.push(item)
          // that.setCheckedKeys([item.userId])
        }
      });
      that.checkedUserList = common.unique(_checkedList, 'userId')
    },
    // 移除已选择参会者
    removeUser(data){
      const that = this;
      if(data.userId == that.isHost){
        that.isHost = ''
      }
      that.removeListById(that.checkedUserList, data)
    },
    removeListById(arr, list) {
      let i = arr.length;
      while (i--) {
        if (arr[i].userId === list.userId) {
          arr.splice(i, 1);
          return true;
        }
      }
      return arr;
    },
    // 提交已经选择的参会者 并通知父组件
   sureAttendFn() {
     this.checkedUserList.forEach(item => {
      item.isHost = item.userId == this.isHost;
    });
     this.$emit('emitSubmitData', this.checkedUserList);
     this.AddAttendDialog = false;
   },
    // 取消选择参会者
    cancelAttendFn() {
      this.isHost = '';
      this.AddAttendDialog = false
    },
    // 清空参会者
      emptyAttendFn() {
          this.isHost = '';
          this.checkedUserList = [];

      },
    // 选择主讲人
//    chooseHost(e, list) {
//    },
    // 取消选择主讲人
    cancelHostFn() {
      this.isHost = ''
    }
  },
  watch: {
    searchByName(val) {
      this.$refs.attendTree.filter(val);
    },
    checkedUserList(val){
      let that = this;
      let ids = [];
      if(!val){
        val = []
      }
      setTimeout(() => {
        val.forEach(item => {
          ids.push(item.userId)
        });
        that.setCheckedKeys(ids)
      }, 100);
    },
    usedType(val) {
      console.log('深度监听 邀请参会者类型 usedType----：', val)
      this.attendType = val;
    }
  },
  created() {

  },
  mounted() {
    this.loadUserData()
  },
}
</script>

<style scoped>
.attend-box{
  max-height: 500px;
}
.attend-tree{
  overflow-y: auto;
  height: 350px;
}
.search-input{
  margin-bottom: 20px;
}
.attend-dialog{
  margin-top: 5vh !important;
}
.attend-header{
  position: absolute;
  top: 60px;
  right: 20px;
}

</style>
