<template>
    <div>
        <!-- 面包屑区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home'}">首页</el-breadcrumb-item>
            <el-breadcrumb-item >权限管理</el-breadcrumb-item>
            <el-breadcrumb-item >权限列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
        <!-- 用户列表区 -->
            <el-table
                :data="rightsList"
                style="width: 100%"
                border
                stripe>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column prop="authName" label="权限名称"> </el-table-column>
                <el-table-column prop="path" label="路径" > </el-table-column>
                <el-table-column prop="level" label="等级">
                    <template slot-scope="scope">
                        <el-tag v-if="scope.row.level === '0'">一级</el-tag>
                        <el-tag type="success" v-else-if="scope.row.level === '1'">二级</el-tag>
                        <el-tag type="warning" v-else>三级</el-tag>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
    </div>
</template>

<script>
export default {
    data () {
      return {
        //   权限列表
        rightsList: [],
      }
    },
    created() {
        this.getRightsList()
    },
    methods: {
        // 获取权限列表
        async getRightsList() {   
            const { data: res } = await this.$http('rights/list')
            if(res.meta.status !== 200) {
                this.$message.error('权限列表获取失败！');
            }
            this.rightsList = res.data
            console.log(res.data)
        }
    }
}
</script>

<style lang="less" scoped>

</style>