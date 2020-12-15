<template>
    <div>
        <!-- 面包屑区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home'}">首页</el-breadcrumb-item>
            <el-breadcrumb-item >商品管理</el-breadcrumb-item>
            <el-breadcrumb-item >分类参数</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <!-- 警告区域 -->
            <el-alert
                title="注意：只允许为第三级分类设置参数！"
                type="warning"
                :closable="false"
                show-icon>
            </el-alert>
            <!-- 选择商品分类区域 -->
            <el-row class="cat_opt">
                <el-col>
                    <span>选择商品分类：</span>
                    <!-- 商品分类级联选择器区域 -->
                    <el-cascader
                        v-model="selectedCateKeys"
                        :options="cateList"
                        :props="cateProps"
                        clearable
                        @change="cascaderChanged"
                        ref="cascaderRef">
                    </el-cascader>
                </el-col>
            </el-row>
            <!-- tab 页签区域 -->
            <el-tabs v-model="activeName" @tab-click="tabHandleClick">
                <el-tab-pane label="动态参数" name="many">
                    <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加参数</el-button>
                    <!-- 动态参数表格 -->
                    <el-table :data="manyTableData" stripe border>
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="removeTag(i, scope.row)">{{ item }}</el-tag>
                                <el-input
                                    class="input-new-tag"
                                    v-if="scope.row.inputVisible"
                                    v-model="scope.row.inputValue"
                                    ref="saveTagInput"
                                    size="small"
                                    @keyup.enter.native="handleInputConfirm(scope.row)"
                                    @blur="handleInputConfirm(scope.row)"
                                    >
                                </el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column type="index" label="#"></el-table-column>
                        <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                                <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
                <el-tab-pane label="静态属性" name="only">
                    <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加属性</el-button>
                    <!-- 静态属性表格 -->
                    <el-table :data="onlyTableData" stripe border>
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="removeTag(i, scope.row)">{{ item }}</el-tag>
                                <el-input
                                    class="input-new-tag"
                                    v-if="scope.row.inputVisible"
                                    v-model="scope.row.inputValue"
                                    ref="saveTagInput"
                                    size="small"
                                    @keyup.enter.native="handleInputConfirm(scope.row)"
                                    @blur="handleInputConfirm(scope.row)"
                                    >
                                </el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column type="index" label="#"></el-table-column>
                        <el-table-column label="属性名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                                <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </el-card>
        <!-- 添加对话框 -->
        <el-dialog
            :title="'添加' + dialogTitleText"
            :visible.sync="addDialogVisible"
            width="50%"
            @close="addDialogClosed">
            <el-form :model="addForm" :rules="rules" ref="addFormRef" label-width="100px">
                <el-form-item :label="dialogTitleText" prop="attr_name">
                    <el-input v-model="addForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="submitAddForm">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 修改对话框 -->
        <el-dialog
            :title="'修改' + dialogTitleText"
            :visible.sync="editDialogVisible"
            width="50%"
            @close="editDialogClosed">
            <el-form :model="editForm" :rules="rules" ref="editFormRef" label-width="100px">
                <el-form-item :label="dialogTitleText" prop="attr_name">
                    <el-input v-model="editForm.attr_name"></el-input>
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
        // 级联选择器参数
        cateProps: {
            expandTrigger: 'hover',      // 子级菜单的触发方式
            value: 'cat_id',
            label: 'cat_name',
            children: 'children',
            // checkStrictly: true,    // 是否可选任意一级菜单
        },
        // 级联选择器选中的分类ID集合
        selectedCateKeys:[],
        // tab页签 默认选中的项
        activeName: 'many',
        // 动态参数表格数据
        manyTableData: [],
        // 静态属性表格数据
        onlyTableData: [],
        // 控制添加对话框的显示与隐藏
        addDialogVisible: false,
        // 添加表单
        addForm: {
            attr_name: ''
        },
        // 控制修改对话框的显示与隐藏
        editDialogVisible: false,
        // 修改表单
        editForm: {
            attr_name: ''
        },
        // 添加 tag 文本框
        inputVisible: false,
        // 添加 tag 的值
        inputValue: '',
        // 添加表单验证规则
        rules: {
            attr_name: [{required: true, message: '动态参数（静态属性）不能为空', trigger: 'blur'}]
        }
      }
    },
    created() {
        // 获取商品分类列表
        this.getCateList()
    },
    methods: {
        // 获取商品分类列表
        async getCateList() {
            const { data: res } = await this.$http.get('categories')
            if(res.meta.status !== 200) {
                this.$message.error('商品分类列表获取失败！')
            } else {
                this.cateList = res.data
                console.log(res.data)
            }
        },
        // 监听级联选择器的变化，只能选择三级分类
        cascaderChanged() {
            this.getParamsData()
        },
        // 监听 tab页签 的变化
        tabHandleClick() {
            this.getParamsData()
        },
        // 动态获取参数列表
        async getParamsData() {
            if(this.selectedCateKeys.length !== 3) {
                this.selectedCateKeys = []
                this.manyTableData = []
                this.onlyTableData = []
                // this.$message.warning('只能为三级分类添加参数！')
            } else {
                // 根据选中的分类ID和参数面板，发起请求
                const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
                    params: { sel: this.activeName }
                })
                if(res.meta.status !== 200) {
                    this.$message.error('参数列表获取失败！')
                } else {
                    
                    res.data.forEach(item => {
                        item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
                        // 添加属性 控制 tag 输入框的显示与隐藏
                        item.inputVisible = false
                        item.inputValue = ''
                    })
                    console.log(res.data)
                    if(this.activeName === 'many') {
                        this.manyTableData = res.data
                    } else {
                        this.onlyTableData = res.data
                    }
                   
                }
            }
        },
        // 监听添加对话框表单的关闭事件
        addDialogClosed() {
            this.$refs['addFormRef'].resetFields()
        },
        // 提交对话框表单
        submitAddForm() {
            this.$refs['addFormRef'].validate(async valid => {
                if(valid) {
                    const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
                        attr_name: this.addForm.attr_name,
                        attr_sel: this.activeName
                    })
                    if(res.meta.status !== 201) {
                        this.$message.error('添加失败！')
                    } else {
                        this.$message.success('添加成功！')
                        this.addDialogVisible = false
                        this.getParamsData()
                    }
                } else {
                    this.$message.error('添加失败！')
                }
            })
        },
        // 根据ID，获取参数，展示修改对话框
        async showEditDialog(attr_id) {
            this.editDialogVisible = true
            const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attr_id}`, { attr_sel: this.activeName })
            if(res.meta.status !== 200) {
                this.$message.error('参数信息获取失败！')
            } else {
                this.editForm = res.data
            }
        },
        // 提交修改后的表单
        submitEditForm() {
            this.$refs['editFormRef'].validate(async valid => {
                if(!valid) return
                const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`,{
                    attr_name: this.editForm.attr_name,
                    attr_sel: this.activeName
                })
                if(res.meta.status !== 200) {
                    this.$message.error('参数信息修改失败！')
                } else {
                    this.$message.success('参数信息修改成功！')
                    this.editDialogVisible = false
                    this.getParamsData()
                }
            })
        },
        // 监听修改对话框表单的关闭事件
        editDialogClosed() {
            this.$refs['editFormRef'].resetFields()
        },
        // 删除参数
        async removeParams(attr_id) {
            const confirmRes = await this.$confirm('此操作将会永久删除该参数，是否继续？','提示',{
                confirmButtonText: '确定',
                cancleButtonText: '取消',
                type: 'warning'
            }).catch(error => error)
            if(confirmRes === 'confirm') {
                const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attr_id}`)
                if(res.meta.status === 200) {
                    this.$message.success('删除成功！')
                    this.getParamsData()
                } else {
                    this.$message.error('删除失败！')
                }
            } else {
                this.$message.info('已取消删除！')
            }
        },
        // 添加 tag 与输入框的切换
        showInput(row) {
            row.inputVisible = true
            // $nextTick 方法的作用：方页面上的元素重新渲染之后，才会执行回调函数中的代码
            this.$nextTick(() => {
                this.$refs.saveTagInput.focus();
            });
        },
        // 添加新的 tag
        handleInputConfirm(row) {
            if(row.inputValue.trim().length === 0) {
                row.inputValue = ''
                row.inputVisible = false
                return
            }
            // 如果没有 return ，证明输入的内容需要做后续的处理
            row.attr_vals.push(row.inputValue)
            row.inputValue = ''
            row.inputVisible = false
            // 将数据保存到数据库
            this.saveAttrVals(row)
        },
        // 将 attr_vals 保存到数据库
        async saveAttrVals(row) {
            const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
                attr_name: row.attr_name,
                attr_sel: row.attr_sel,
                attr_vals: row.attr_vals.join(',')
            })
            if(res.meta.status !==200) {
                this.$message.error('修改参数项失败！')
            } else {
                this.$message.success('修改参数项成功！')
            }
        },
        // 删除 tag
        removeTag(i, row) {
            row.attr_vals.splice(i, 1)
            this.saveAttrVals(row)
        }
    },

    computed: {
        // 控制 tab页签 中的按钮是否启用
        isBtnDisabled() {
            if(this.selectedCateKeys.length === 3) {
                return false
            } else {
                return true
            }
        },
        // 当前选中的三级分类的ID
        cateId() {
            if(this.selectedCateKeys.length === 3) {
                return this.selectedCateKeys[2]
            } else {
                return null
            }
        },
        // 计算添加对话框的标题
        dialogTitleText() {
            if(this.activeName === 'many') {
                return '动态参数'
            } else {
                return '静态属性'
            }
        },
    }
}
</script>

<style lang="less" scoped>
    .cat_opt {
        margin: 15px 0;
    }

    .el-tag {
        margin: 0 5px ;
    }

    .input-new-tag {
        width: 120px;
    }
</style>