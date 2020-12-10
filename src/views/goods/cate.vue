<template>
    <div>
        <!-- 面包屑区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home'}">首页</el-breadcrumb-item>
            <el-breadcrumb-item >商品管理</el-breadcrumb-item>
            <el-breadcrumb-item >商品分类</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区域 -->
        <el-card>
            <el-row :gutter="20">
                <el-col :span="4">
                    <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
                </el-col>
            </el-row>
            <!-- 分类列表区 -->
            <!-- 第三方树形表格 官方文档：https://github.com/MisterTaki/vue-table-with-tree-grid -->
            <tree-table 
            class="treetable"
            :data="cateList"
            :columns="columns"
            :selection-type="false"
            :expand-type="false"
            :show-index="true"
            index-text="#"
            :show-row-hover="false"
            border>
                <!-- 是否有效 -->
                <template slot="isok" slot-scope="scope">
                    <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: lightgreen;"></i>
                    <i class="el-icon-error" v-else style="color: red;"></i>
                </template>
                <!-- 排序 -->
                <template slot="order" slot-scope="scope">
                    <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
                    <el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
                    <el-tag type="warning" size="mini" v-else>三级</el-tag>
                </template>
                <!-- 操作 -->
                <template slot="option" slot-scope="scope">
                    <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.cat_id)">编辑</el-button>
                    <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeCateById(scope.row.cat_id)">删除</el-button>
                </template>
            </tree-table>
            <!-- 分页区域 -->
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[1, 2, 5, 10]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total">
            </el-pagination>
        </el-card>

        <!-- 添加分类对话框 -->
        <el-dialog
            title="添加分类"
            :visible.sync="addDialogVisible"
            width="50%"
            @close="addCateDialogClosed">
            <el-form :model="addCateForm" :rules="rules" ref="addCateFormRef" label-width="100px" >
                <el-form-item label="分类名称：" prop="cat_name">
                    <el-input v-model="addCateForm.cat_name"></el-input>
                </el-form-item>
                <el-form-item label="父级分类：">
                    <el-cascader
                        v-model="selectedKeys"
                        :options="parentCateList"
                        :props="cascaderProps"
                        clearable
                        @change="parentCateChanged"
                        >
                    </el-cascader>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="submitAddForm">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 修改分类对话框 -->
        <el-dialog
            title="修改分类"
            :visible.sync="editDialogVisible"
            width="50%"
            @close="editCateDialogClosed">
            <el-form :model="editCateForm" :rules="rules" ref="editCateFormRef" label-width="100px" >
                <el-form-item label="分类名称：" prop="cat_name">
                    <el-input v-model="editCateForm.cat_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="submitEditForm">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data () {
      return {
        // 商品分类列表  
        cateList: [],
        queryInfo: {
            type: 3,
            pagenum: 1,
            pagesize: 5,
        },
        total: 0,
        //控制添加弹窗   
        addDialogVisible: false,
        editDialogVisible: false,
        // 添加表单
        addCateForm: {
            cat_name: '',
            cat_pid: 0,   // 父分类ID
            cat_level: 0,       // 分类等级，0 代表默认为一级分类
        },
        // 编辑表单
        editCateForm: {
            cat_name: '',
        },
        // 父级分类列表
        parentCateList: [],
        // 选中的父级分类
        selectedKeys: [],
        // 级联选择器参数
        cascaderProps: {
            expandTrigger: 'hover',      // 触发方式：悬浮触发
            value: 'cat_id',
            label: 'cat_name',
            children: 'children',
            emitPath: true,         // 是否返回选中的节点值（返回值为数组）
            checkStrictly: true,       // 是否可选任意一级
        },
        // 验证规则
        rules: {
            cat_name: [
                {required: true, message: '分类名称不能为空', trigger: 'blur'}
            ]
        },
        // 树形表格列属性
        columns: [
            {
                label: '分类名称',
                prop: 'cat_name'
            },
            {
                label: '是否有效',
                // 表示将当前列定义为模板列
                type: 'template',
                // 当前模板列名称
                template: 'isok'
            },
            {
                label: '排序',
                // 表示将当前列定义为模板列
                type: 'template',
                // 当前模板列名称
                template: 'order'
            },
            {
                label: '操作',
                // 表示将当前列定义为模板列
                type: 'template',
                // 当前模板列名称
                template: 'option'
            },
        ]
      }
    },
    created() {
        this.getCateList()
    },
    methods: {
        // 获取商品分类列表
        async getCateList() {
            const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
            if(res.meta.status !== 200) {
                this.$message.error('商品分类列表获取失败！')
            } else {
                // console.log(res.data)
                this.cateList = res.data.result
                this.total = res.data.total
            }
        },
        // 监听 pagesize 的改变
        handleSizeChange (newPageSize) {
            this.queryInfo.pagesize = newPageSize
            this.getCateList()
        },
        // 监听 pagenum 的改变
        handleCurrentChange (newPageNum) {
            this.queryInfo.pagenum = newPageNum
            this.getCateList()
        },
        // 展示添加分类对话框
        showAddCateDialog() {
            // 打开弹窗之前，先获取父级分类列表
            this.getParentCateList()
            this.addDialogVisible = true
        },
        // 添加新分类时，获取父级分类列表（仅前两级）
        async getParentCateList() {
            const { data: res } = await this.$http.get('categories', { params: { type: 2 } } )
            if(res.meta.status !== 200) {
                this.$message.error('获取父级分类列表失败！')
            } else {
                this.parentCateList = res.data
                console.log(res.data)
            }
        },
        // 获取选中的父级分类节点
        parentCateChanged() {
            this.addCateForm.cat_name
            if(this.selectedKeys.length > 0) {
                this.addCateForm.cat_level = this.selectedKeys.length
                this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
            } else {
                this.addCateForm.cat_level = 0
                this.addCateForm.cat_pid = 0
            }
            console.log(this.selectedKeys)
        },
        // 取消添加，清空表单
        addCateDialogClosed() {
            this.$refs['addCateFormRef'].resetFields()
            this.selectedKeys = []
            this.addCateForm.cat_pid = 0
            this.addCateForm.cat_level = 0
        },
        // 提交添加表单
        async submitAddForm() {
            this.$refs['addCateFormRef'].validate(async valid => {
                if(valid) {
                    const { data: res } = await this.$http.post('categories', this.addCateForm)
                    if(res.meta.status !== 201) {
                        this.$message.error('商品分类添加失败！')
                    } else {
                        this.addDialogVisible = false
                        this.getCateList()
                        this.$message.success('商品分类添加成功！')
                    }
                } else {
                    this.$message.error('商品分类添加失败！')
                }
            })
        },
        // 打开修改分类弹窗
        async showEditDialog(id) {
            this.editDialogVisible = true
            const { data: res } = await this.$http.get(`categories/${id}`)
            if(res.meta.status !== 200) {
                this.$message.error('商品分类获取失败！')
            } else {
                this.editCateForm = res.data
                console.log(res.data)
            }
        },
        // 取消修改，清空表单内容
        editCateDialogClosed() {
            this.$refs['editCateFormRef'].resetFields()
        },
        // 提交修改后的数据
        submitEditForm() {
            this.$refs['editCateFormRef'].validate(async valid => {
                if(valid) {
                    const { data: res } = await this.$http.put(`categories/${this.editCateForm.cat_id}`, this.editCateForm)
                    if(res.meta.status !== 200) {
                        this.$message.error('商品分类修改失败！')
                    } else{
                        this.$message.success('商品分类修改成功！')
                        this.getCateList()
                        this.editDialogVisible = false
                    }
                } else {
                    this.$message.error('商品分类获取失败！')
                }
            })
        },
        // 根据ID 删除商品分类
        async removeCateById(id) {
            const confirmRes = await this.$confirm('此次操作将会永久删除该分类，是否继续？', '提示', {
                confirmButtonText: '确定',
                cancleButtonText: '取消',
                type: 'warning'
            }).catch(error => error)
            if(confirmRes === 'confirm') {
                const { data: res } = await this.$http.delete(`categories/${id}`)
                if(res.meta.status !==200 ) {
                    this.$message.error('商品分类删除失败！')
                } else {
                    this.$message.success('商品分类删除成功！')
                    this.getCateList()
                }
            } else {
                this.$message.info('已取消删除！')
            }
        }
    }
}
</script>

<style lang="less" scoped>
    .treetable {
        margin-top: 15px;
    }
</style>