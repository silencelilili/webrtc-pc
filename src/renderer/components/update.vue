<template>
    <div>
        <el-dialog
            title="检测更新"
            :visible.sync="updateDialogVisible"
            width="30%"
            center>
            <div v-if="updateStatus === 'update-available'">
                <span>发现了新版本，是否现在更新</span>
                <p>最新版本：V{{updateContent.version}}</p>
                <p v-show="downloadPercent>0">
                    <span>正在下载....</span>
                    <el-progress :text-inside="true" :stroke-width="18" :percentage="downloadPercent"></el-progress>
                </p>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="updateDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="updateExe()">更 新</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>

export default {
  name: "Update",
  methods: {
    close() {
        this.$emit('update:show', false)
    }
  },
  props: {
    show: {
        type: Boolean,
        required: true,
        default: false
    }
  },
  data() {
    return {
      updateDialogVisible: false
    }
  },
}
</script>

<style>
 .videoStyle{
    width: 100%;
    height: 600px;
  }
</style>