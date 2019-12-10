<template>
  <div>
      <div class="page-header">视频列表</div>
      <div class="white-bg"
           v-loading="loading"
           element-loading-text="拼命加载中"
           element-loading-spinner="el-icon-loading">
        <el-tabs v-model="activeName" @tab-click="handleClick">
          <el-tab-pane label="个人视频" name="person"></el-tab-pane>
          <el-tab-pane label="企业视频" name="ent"></el-tab-pane>
        </el-tabs>

        <!-- 查询 -->
        <div class="clearfix" style="overflow:hidden;">
          <el-button type="primary" v-if="activeName==='person'" @click="deleMultipleVideo">删除</el-button>
          <div class="pull-right">
            <el-input type="text" v-model="searchData.keywords" placeholder="文件名" @keyup.native="dataSearchKeyUp"></el-input>
          </div>
        </div>

        <!-- 表格 -->
        <div class="table-list">
          <el-table
            :data="tableData.list"
            stripe
            ref="multipleTable"
            tooltip-effect="dark"
            @selection-change="handleSelectionChange"
            style="width: 100%">
            <el-table-column
              type="selection"
              width="30"
              v-if="activeName==='person'">
            </el-table-column>
            <el-table-column
              prop="fileName"
              label="文件名">
              <template slot-scope="scope">
                <span v-if="activeName==='person'">
                  <span v-if="!scope.row.isEditFileName">
                    {{scope.row.fileName}}
                    <a href="javascript:;" @click="editFn(scope.row)" class="fa fa-pencil-square-o font14 svoc-color"></a>
                  </span>
                  <span v-else>
                    <el-input
                      class="input-new-tag"
                      v-model="scope.row.editFileName"
                      ref="saveTagInput"
                      size="small"
                      @keyup.enter.native="handleInputConfirm(scope.row, true)"
                      @blur="handleInputConfirm(scope.row, false)"
                    >
                    </el-input>
                  </span>
                </span>
                <span v-else>
                  {{scope.row.fileName}}
                </span>
              </template>
            </el-table-column>
            <el-table-column
              label="操作"
              width="80">
              <template slot-scope="scope">
                <a href="javascript:;" title="播放" @click="openPlayWin(scope.row)" class="fa-play-circle font16 svoc-color fa"></a>
                <a :href="scope.row.downPath" v-if="activeName==='person'" class="fa-download font16 svoc-color marginLR10 fa" :download="scope.row.fileName+'.mp4'" title="下载"></a>
                <el-dropdown trigger="click" v-if="activeName==='person'">
                  <span class="font16 svoc-color fa-ellipsis-h fa"></span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item v-if="scope.row.common==false" >
                      <a href="javascript:;" @click="updateState(scope.row)">公开</a>
                    </el-dropdown-item>
                    <el-dropdown-item v-if="scope.row.common==true">
                      <a href="javascript:;" @click="updateState(scope.row)">私密</a>
                    </el-dropdown-item>
                    <el-dropdown-item >
                      <a href="javascript:;" @click="deleSingleVideo(scope.row.fileId)">删除</a>
                    </el-dropdown-item>

                  </el-dropdown-menu>
                </el-dropdown>
              </template>
            </el-table-column>
            <el-table-column
              prop="userName"
              label="发起人">
            </el-table-column>
            <el-table-column
              label="大小"
              width="80">
              <template slot-scope="scope">
                {{scope.row.fileSize/1024/1024 | toFixed(2)}}M
              </template>
            </el-table-column>
            <el-table-column
              prop="fileDuration"
              label="时长">
              <template slot-scope="scope">
                {{scope.row.fileDuration*1000 | toSwitchTime}}
              </template>
            </el-table-column>
            <el-table-column
              prop="fileCreateTime"
              label="创建时间">
            </el-table-column>
            <el-table-column
              label="状态"
              width="60">
              <template slot-scope="scope">
                <span>{{scope.row.common? '公开':'私密'}}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      <div class="text-right">
          <el-pagination
          background
          layout="total, prev, pager, next"
          :page-size="10"
          :total="tableData.totalPages"
          :current-page.sync="tableData.currentPage"
          @current-change="handleCurrentChange">
        </el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
import {ucApi} from '@/server/ucapi'
export default {
  // name: 'videolist',
  data() {
    return {
      activeName: 'person',
      loading: true,
      searchData: {
        keywords: '',
        pageNum: '1',
        pageSize: '10',
      },
      tableData: {
        list: [],
        totalPages: 0,
        currentPage: 1
      },
      selectedData: [] //选中的要删除的文件
    }
  },

  methods: {
    // 切换标签页
    handleClick() {
      // console.log(this.activeName)
      this.loading = true;
      this.tableData ={
        list: [],
        totalPages: 0,
        currentPage: 1
      }
      this.searchData.keywords = '';
      if(this.activeName === 'ent'){
        this.getEntTableDataFn()
      }else{
        this.getTableDataFn()
      }
    },
    // 获取数据列表
    getTableDataFn() {
      const that = this;
      ucApi.getRecordsList(that.searchData)
      .then(res => {
        // console.log(res)
        let resList = res.list;
         resList.map(item=>{
           item.isEditFileName = false;
           item.editFileName = item.fileName;
           return item
         })
        that.tableData = {
          list: resList,
          totalPages: res.total,
          currentPage: res.pageNum
        }
        that.loading = false;
      })
      .catch(err => {
        console.log('获取数据失败: ', err)
      })
    },
    //查询企业公共录播文件列表
    getEntTableDataFn() {
      const that = this;
      ucApi.getEntRecordsList(that.searchData)
      .then(res => {
        that.tableData = {
          list: res.list,
          totalPages: res.total,
          currentPage: res.pageNum
        }
        that.loading = false;
      })
      .catch(err => {
        console.log('获取数据失败')
      })
    },
    // 分页
    handleCurrentChange(val){
       this.searchData.pageNum = val
       this.tableData.currentPage = val;
       this.getTableDataFn();
    },
    // 查询
    dataSearchKeyUp: _.debounce(function () {
      const that = this;
      if(that.activeName === 'ent'){
        that.getEntTableDataFn()
      }else{
        that.getTableDataFn()
      }
    }, 300),
    // 删除多个视频文件
    deleMultipleVideo(){
      let fileIdArr = [];
      this.selectedData.forEach(item => {
        fileIdArr.push(item.fileId)
      });
      if(fileIdArr && fileIdArr.length > 0) {
        this.$confirm('是否确认删除选中的视频文件？', '删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.sureDeleVideo(fileIdArr)
        }).catch(() => {

        });
      } else {
          this.$notification('请至少选择一条要删除的视频', 'warning')
      }

    },
    // 删除单个视频文件
    deleSingleVideo(fileId) {
      let fileIdArr = [];
      fileIdArr.push(fileId);
      this.$confirm('是否确认删除视频文件？', '删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.sureDeleVideo(fileIdArr)
      }).catch(() => {

      });
    },
    // 确认删除
    sureDeleVideo(fileIdArr) {
      let deleteData = '';
      for (let i = 0; i < fileIdArr.length; i++) {
        deleteData += fileIdArr[i] + ',';
      }
      ucApi.deleRecordItem(deleteData)
      .then(res => {
        this.getTableDataFn()
        this.$notification('删除成功！', 'success')
      })
      .then(() => {
        this.selectedData = []
      })
      .catch(err => {
        this.$notification('删除失败', 'error')
      })
    },

    // 修改录播视频对外状态
    updateState(data){
      let postData = { 'state': !data.common };
      ucApi.updateRecordState(data.fileId, postData)
      .then(res => {
        this.getTableDataFn()
        this.$notification('修改成功', 'success')
      })
      .catch(err => {
        this.$notification('修改失败', 'error')
      })
    },
    // 多选 选择框
    handleSelectionChange(val) {
      this.selectedData = val;
    },
    // 打开编辑 修改文件名
    editFn(video){
      video.editFileName = video.fileName;
      video.isEditFileName = true;
    },
    handleInputConfirm(video, status){
      let oldValue = video.editFileName;
      let inputValue = video.editFileName;
      let postData = { 'fileName': video.editFileName };
      if(inputValue && status){
        ucApi.updateRecordFileName(video.fileId, postData)
        .then((result) => {
          this.$notification('修改成功', 'success')
          video.isEditFileName = false;
          video.fileName = video.editFileName;
        }).catch((err) => {
          this.$notification('修改失败', 'error')
        });
      }else{
        video.isEditFileName = false;
        video.editFileName = oldValue;
      }
    },

    // 播放已录制的文件
    openPlayWin(video){
      let address = video.livePath;
      this.$electron.ipcRenderer.send('playvideo-window', address)
    }
  },
  created() {
    this.getTableDataFn()
  },

}
</script>

<style scoped>

</style>
