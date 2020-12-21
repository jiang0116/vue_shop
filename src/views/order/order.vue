<template>
    <div>
        <!-- 面包屑区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home'}">首页</el-breadcrumb-item>
            <el-breadcrumb-item >订单管理</el-breadcrumb-item>
            <el-breadcrumb-item >订单列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区域 -->
        <el-card >
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input placeholder="请输入内容">
                        <el-button slot="append" icon="el-icon-search"></el-button>
                    </el-input>
                </el-col>
            </el-row>
            <!-- 表格区域 -->
            <el-table :data="orderList" border stripe>
                <el-table-column label="#" type="index"></el-table-column>
                <el-table-column label="订单编号" prop="order_number"></el-table-column>
                <el-table-column label="订单价格" prop="order_price" width="120px"></el-table-column>
                <el-table-column label="是否付款" prop="pay_status" width="150px">
                    <template slot-scope="scope">
                        <el-tag type="danger"  v-if="scope.row.pay_status === '0'">未付款</el-tag>
                        <el-tag type="success" v-else>已付款</el-tag>
                    </template>
                    
                </el-table-column>
                <el-table-column label="是否发货" prop="is_send" width="120px"></el-table-column>
                <el-table-column label="下单时间" prop="create_time" width="200px">
                    <template slot-scope="scope">
                        {{ scope.row.create_time | dateFormat }}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="180px">
                    <template slot-scope="scope">
                        <el-tooltip class="item" effect="dark" content="修改订单地址" placement="top">
                            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditAddress(scope.row.order_id)"></el-button>
                        </el-tooltip>
                        <el-tooltip class="item" effect="dark" content="查看物流进度" placement="top">
                            <el-button type="success" icon="el-icon-location" size="mini" @click="showProgress"></el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页区域 -->
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[10, 20, 30, 50]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total">
            </el-pagination>
        </el-card>
        <!-- 地区联动对话框 -->
        <el-dialog
            title="地区联动"
            :visible.sync="addressDialogVisible"
            width="50%"
            @close="addressDialogClose">
            <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px">
                <el-form-item label="省市区/县" prop="address1">
                    <el-cascader
                    v-model="addressForm.address1"
                    :options="cityOptions"
                    :props="addressProps"
                    @change="handleChange"
                    clearable>
                </el-cascader>
                </el-form-item>
                <el-form-item label="详细地址" prop="address2">
                    <el-input v-model="addressForm.address2"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addressDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="SubmitEditAddress">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 物流进度对话框 -->
        <el-dialog
            title="物流进度"
            :visible.sync="progressDialogVisible"
            width="50%">
            <span>由于接口文档中测试订单不可用，因此无法完成物流进度的展示！</span>
            <span slot="footer" class="dialog-footer">
                <el-button @click="progressDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="progressDialogVisible = false">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>

import cityOptions from '@/assets/js/citydata.js'

export default {
    data () {
        return {
            queryInfo: {
                query: '',
                pagesize: 10,
                pagenum:1
            },
            // 订单列表
            orderList: [],
            // 数据总数
            total: 0,
            // 地区联动弹窗
            addressDialogVisible: false,
            // 接收导入的地区联动数据
            cityOptions: cityOptions,
            // 地区级联选择器参数
            addressProps: {
                expandTrigger: 'hover',
                label: 'label',
                value: 'value',
                children: 'children'
            },
            // 地址表单
            addressForm: {
                address1: [],
                address2: '',
            },
            // 物流进度对话框
            progressDialogVisible: false, 
            // 物流进度信息
            progressInfo: [],
            // 地址表单验证规则
            addressFormRules: {
                address1: [{required: true, message: '请选择省市县/区', trigger: 'blur'}],
                address2: [{required: true, message: '请填写详细地址', trigger: 'blur'}],
            }
        }
    },
    created() {
        this.getOrderList()
    },
    methods: {
        // 获取订单列表
        async getOrderList() {
            const { data: res } = await this.$http.get('orders', { params: this.queryInfo })
            if(res.meta.status !== 200) {
                return this.$message.error('订单列表获取失败！')
            }
            this.orderList = res.data.goods
            this.total = res.data.total
            console.log(this.orderList);
            // this.$message.success('订单列表获取成功！')
        },
        // 分页
        handleSizeChange(newSize) {
            this.queryInfo.pagesize = newSize
            this.getOrderList()
        },
        handleCurrentChange(newNum) {
            this.queryInfo.pagenum = newNum
            this.getOrderList()
        },
        // 修改地址，实现订单的省市县三级联动
        showEditAddress() {
            this.addressDialogVisible = true
        },
        // 监听级联选择器
        handleChange() {
            console.log(this.addressForm.address1);
        },
        // 提交修改后的地址
        SubmitEditAddress() {

        },
        // 关闭弹窗，清空级联选择器
        addressDialogClose() {
            this.$refs['addressFormRef'].resetFields()
        },
        // 显示物流进度对话框
        async showProgress() {
            this.progressDialogVisible = true
            /* const { data: res } = await this.$http.get('/kuaidi/1106975712662')
            if(res.meat.status !== 200) {
                return this.$message.error('物流进度查询失败！')
            }
            this.progressInfo = res.data
            console.log(this.progressInfo); */
        }
    },

}
</script>

<style lang="less" scoped>

</style>