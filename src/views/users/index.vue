<template>
    <div>
        <!-- 面包屑区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home'}">首页</el-breadcrumb-item>
            <el-breadcrumb-item >用户管理</el-breadcrumb-item>
            <el-breadcrumb-item >用户列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区域 -->
        <el-card>
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
                        <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
                </el-col>
            </el-row>
        </el-card>
        <!-- 用户列表区 -->
        <el-table
        :data="userList"
        style="width: 100%"
        border
        stripe>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column prop="username" label="姓名" width="180"> </el-table-column>
            <el-table-column prop="email" label="邮箱" width="180"> </el-table-column>
            <el-table-column prop="mobile" label="电话"> </el-table-column>
            <el-table-column prop="role_name" label="角色"> </el-table-column>
            <el-table-column label="状态">
                <template slot-scope="scope">
                    <el-switch v-model="scope.row.mg_state" @change="userStatusChanged(scope.row)"> </el-switch>
                </template> 
            </el-table-column>
            <el-table-column label="操作" width="180px">
                <template slot-scope="scope">
                    <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
                    <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
                    <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
                        <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
                    </el-tooltip>
                </template>
                
            </el-table-column>
        </el-table>
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
        <!-- 添加用户对话框 -->
        <el-dialog
            title="添加用户"
            :visible.sync="addDialogVisible"
            width="50%"
            @close="addDialogClosed">
            <el-form :label-position="'right'" label-width="70px" ref="addFormRef" :model="userAddForm" :rules="rules">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="userAddForm.username"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="userAddForm.password"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="userAddForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机" prop="mobile">
                    <el-input v-model="userAddForm.mobile"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="submituserAddForm">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 修改用户对话框 -->
        <el-dialog
            title="修改用户"
            :visible.sync="editDialogVisible"
            width="50%"
            @close="editDialogClosed">
            <el-form :label-position="'right'" label-width="70px" ref="editFormRef" :model="userEditForm" :rules="rules">
                <el-form-item label="用户名">
                    <el-input v-model="userEditForm.username" :disabled="true"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="userEditForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机" prop="mobile">
                    <el-input v-model="userEditForm.mobile"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="submituserEditForm">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {

    data() {
        // 自定义验证邮箱规则
        var checkEmail = (rule, value, callback) => {
           const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
           if (regEmail.test(value)) {
                callback();
            } else {
                callback(new Error('请输入合法的邮箱'));
            }
        };
        // 自定义手机号则
        var checkMobile = (rule, value, callback) => {
           const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
           if (regMobile.test(value)) {
                callback();
            } else {
                callback(new Error('请输入合法的手机号'));
            }
        };
        return {
            // 用户列表请求参数
            queryInfo: {
                query: '',
                pagenum: 1,
                pagesize: 2
            },
            userList: [],
            total: 0,
            // 控制添加弹出框是否显示
            addDialogVisible: false,
            editDialogVisible: false,
            // 添加用户表单
            userAddForm: {
                username: '',
                password: '',
                email: '',
                mobile: ''
            },
            // 修改用户表单
            userEditForm: {
                username: '',
                email: '',
                mobile: ''
            },
            // 弹出框表单验证规则
            rules: {
                username: [
                    {required: true, message: '用户名不能为空', trigger: 'blur'},
                    { min: 3, max: 10, message: '用户名长度在 3 到 10 个字符', trigger: 'blur' }
                ],
                password: [
                    {required: true, message: '密码不能为空', trigger: 'blur'},
                    { min: 6, max: 15, message: '密码长度在 6 到 15 个字符', trigger: 'blur' }
                ],
                email: [
                    {required: true, message: '邮箱不能为空', trigger: 'blur'},
                    {validator: checkEmail, trigger: 'blur'}
                ],
                mobile: [
                    {required: true, message: '手机号不能为空', trigger: 'blur'},
                    {validator: checkMobile, trigger: 'blur'}
                ],
            }
        };
    },
    created() {
        this.getUserList()
    },
    methods: {
        async getUserList() {
            const { data: res } = await this.$http.get('users', {
                params: this.queryInfo
            })
            if(res.meta.status !== 200) {
                return this.$message.error('用户数据列表获取失败')
            } else {
                this.userList = res.data.users
                this.total = res.data.total
                console.log(res)
            }
        },
        handleSizeChange(newSize) {
            this.queryInfo.pagesize = newSize
            this.getUserList()
        },
        handleCurrentChange(newPage) {
            this.queryInfo.pagenum = newPage
            this.getUserList()
        },
        // 改变用户状态
        async userStatusChanged(userInfo) {
            // console.log(userInfo)
            const { data:res } = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
            if(res.meta.status !== 200) {
                userInfo.mg_state = !userInfo.mg_state
                return this.$message.error('更新用户状态失败！')
            } else {
                this.$message.success('更新用户状态成功！')
            }
        },
        // 关闭弹窗，清空添加表单
        addDialogClosed() {
            this.$refs['addFormRef'].resetFields()
        },
        // 添加用户
        submituserAddForm () {
            this.$refs['addFormRef'].validate(valid => {
                if(valid) {
                    this.$http.post('users', this.userAddForm).then(response => {
                        const resp = response.data
                        if(resp.meta.status === 201) {
                            this.addDialogVisible = false
                            this.$message.success(resp.meta.msg)
                            this.getUserList()
                        } else {
                            this.$message.error(resp.meta.msg)
                        }
                    })
                } else {
                    this.$message.error('用户添加失败!')
                }
            })
        },
        // 展示编辑用户对话框
        async showEditDialog(id) {
            const { data: res } = await this.$http.get(`users/${id}`)
            if(res.meta.status !== 200) {
                this.$$message.error('用户信息查询失败！')
            } else {
                this.userEditForm = res.data
                this.editDialogVisible = true
            }
        },
        // 关闭弹窗，清空修改表单
        editDialogClosed() {
            this.$refs['editFormRef'].resetFields()
        },
        // 提交修改后的信息
        submituserEditForm() {
            this.$refs['editFormRef'].validate(async valid => {
                if(valid) {
                    const { data: res } = await this.$http.put(`users/${this.userEditForm.id}`, {
                        email: this.userEditForm.email,
                        mobile: this.userEditForm.mobile
                    })
                    if(res.meta.status !==200) {
                        this.$message.error(res.meta.msg)
                    } else {
                        this.editDialogVisible = false
                        this.getUserList()
                        this.$message.success(res.meta.msg)
                    }
                }else {
                    this.$message.error('用户信息修改失败！')
                }
            })
        },
        // 根据ID 删除用户
        async removeUserById(id) {
            const confirmRes = await this.$confirm('此操作将永久删除该用户，是否继续？', '提示', {
                confirmButtonText: '确定',
                cancleButtonText: '取消',
                type: 'warning'
            }).catch(error => error)
            // 如果用户确认删除，则返回值为字符串 confirm
            // 如果用户取消删除，则返回值为字符串 cancle
            if(confirmRes !== 'confirm') {
                this.$message.info('已取消删除')
            } else {
                const { data: res } = await this.$http.delete(`users/${id}`)
                if(res.meta.status !== 200) {
                    this.$message.error(res.meta.msg)
                } else {
                    this.$message.success(res.meta.msg)
                    this.getUserList()
                }
            }
        }
    },
};
</script>

<style lang="less" scoped>
</style>