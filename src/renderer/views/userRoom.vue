<template>
<div>
    <div class="page-header">云会议室</div>
    <div class="white-bg"
         v-loading="loading"
         element-loading-text="拼命加载中"
         element-loading-spinner="el-icon-loading">
        <!--表格-->
        <div class="table-list">
            <el-table
            :data="tableData"
            stripe
            ref="multipleTable"
            tooltip-effect="dark"
            style="width: 100%">
                <el-table-column
                    prop="vmrName"
                    label="云会议室">
                </el-table-column>
                <el-table-column
                    prop="vmrNumber"
                    label="会议号">
                </el-table-column>
                <el-table-column
                    prop="participantPin"
                    label="密码">
                </el-table-column>
                <el-table-column
                    label="云会议室状态">
                    <template slot-scope="scope">
                        <span v-if="scope.row.status==0">空闲</span>
                        <span class="red" v-if="scope.row.status==2">进行中</span>
                    </template>
                </el-table-column>
                <el-table-column
                    label="操作">
                    <template slot-scope="scope">
                        <el-button type="primary" round size="small" @click="editFicFn(scope.row)">编辑</el-button>
                        <el-button type="primary" round size="small" @click="joinMeetingFn(scope.row)">入会</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
    </div>
    <template>
        <component v-show="false" :is="currentComponent"></component>
    </template>

    <!--编辑会议室-->
    <el-dialog title="编辑云会议室" :visible.sync="editRoomModal" width="40%">
        <el-form :model="editForm">
            <el-form-item label="会议号" label-width="80px">
                <el-input v-model="editForm.vmrNumber" autocomplete="off" disabled></el-input>
            </el-form-item>
            <el-form-item label="云会议室" label-width="80px">
                <el-input v-model="editForm.vmrName" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="密码" label-width="80px">
                <el-input v-model="editForm.participantPin" autocomplete="off"></el-input>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button @click="cancleUpdate()">取 消</el-button>
            <el-button type="primary" :loading="updateLoading" @click="sureUpdateFic()">确 定</el-button>
        </div>
    </el-dialog>
</div>
</template>


<script>
import {ucApi} from '@/server/ucapi';
import { common } from "@/util/common.js";
import { eventBus } from '@/config/eventbus'

export default {
    components: {
        JoinMeeting: () => import('../components/JoinMeeting')
    },
    data() {
        return {
            loading: true,
            tableData: [],
            loginUserData: common.getLoginMsg(),
            editRoomModal: false,
            editForm: {
                vmrNumber: '',
                vmrName: '',
                participantPin: ''
            },
            currentComponent: '',
            updateLoading: false
        }
    },
    methods: {
        // 获取初始化表格数据
        getTableDataFn() {
            const that = this;
            ucApi.getRoomListTableFn(this.loginUserData.userId)
                .then(res => {
                    const resList = res;
                    that.tableData = resList;
                    that.loading = false;
                })
                .catch(err => {
                    that.loading = false;
                    console.log('获取数据失败: ', err)
                })
        },
        // 编辑会议室
        editFicFn(list) {
            const updatelist = {...list};
            if (updatelist.status === 2) {
                this.$notification('会议室正在使用中暂不可编辑', 'warning')
            } else {
                this.editForm = updatelist;
                this.editRoomModal = true;
            }
        },
        //  确定编辑会议室
        sureUpdateFic() {
            const that = this;
            that.updateLoading = true;
            const vmrNumber = that.editForm.vmrNumber;
            ucApi.updateRoomFn(vmrNumber, that.editForm)
                .then(res => {
                    that.$notification('编辑云会议室成功', 'success');
                    that.editRoomModal = false;
                    that.updateLoading = false;
                    that.getTableDataFn()
                })
                .catch(error => {
                    that.updateLoading = false;
                    that.$notification('编辑失败', 'error')
                })
        },
        // 取消编辑
        cancleUpdate() {
            this.editForm = {};
            this.editRoomModal = false;
        },



        // 云会议室 加入会议
        joinMeetingFn(data){
            const that = this;
            that.currentComponent = 'JoinMeeting'
            const meetingData = {
                conference: data.vmrNumber,
                pin: data.participantPin || "",
                host: this.loginUserData.webrtcAddress
            }
            that.$store.commit("setJoinProgress", true);
            setTimeout(() => {
                // 触发 eventbus 的 requestJoinMeeting 事件，传递参数 meetingData。
                eventBus.$emit('requestJoinMeeting', meetingData)
            }, 800);
        },

    },

    created() {
        console.log('创建【useRoom】组件')
        this.getTableDataFn()
    },
    mounted() {
        console.log('useRoom】组件加载完成')
    },
    destroyed() {

    },
}

</script>

<style scoped>

</style>
