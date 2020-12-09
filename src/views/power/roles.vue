<template>
    <div>
        <!-- 面包屑区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/roles'}">首页</el-breadcrumb-item>
            <el-breadcrumb-item >角色管理</el-breadcrumb-item>
            <el-breadcrumb-item >角色列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <el-row>
                <el-col>
                    <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
                </el-col>
            </el-row>      
        <!-- 角色列表区 -->
            <el-table
                :data="rolesList"
                style="width: 100%"
                border
                stripe>
                <!-- 展开列 -->
                <el-table-column type="expand">
                    <template slot-scope="scope">
                        <el-row
                         :class="['vcenter', 'bdbottom', i1 === 0 ? 'bdtop' : '']"
                         v-for="(item1, i1) in scope.row.children"
                         :key="item1.id">
                            <!-- 渲染一级权限 -->
                            <el-col  :span="5">
                                <el-tag closable @close="removeAuthById(scope.row, item1.id)">{{ item1.authName }}</el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <!-- 渲染二级和三级权限 -->
                            <el-col :span="19">
                                <!-- 嵌套循环二级权限 -->
                                <el-row 
                                :class="['vcenter', i2 !== 0 ? 'bdtop' : '']" 
                                v-for="(item2, i2) in item1.children" 
                                :key="item2.id">
                                    <el-col :span="6">
                                        <el-tag type="success" closable @close="removeAuthById(scope.row, item2.id)">{{ item2.authName }}</el-tag>
                                        <i  class="el-icon-caret-right"></i>
                                    </el-col>
                                    <el-col :span="18">
                                    <!-- 嵌套循环三级权限 -->
                                        <el-tag 
                                        v-for="(item3) in item2.children"
                                        :key="item3.id"
                                        type="warning"
                                        closable
                                        @close="removeAuthById(scope.row, item3.id)">
                                            {{ item3.authName }}
                                        </el-tag>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                    </template>   
                </el-table-column>
                <!-- 索引列 -->
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column prop="roleName" label="角色名称"> 
                </el-table-column>
                <el-table-column prop="roleDesc" label="角色描述"> </el-table-column>
                <el-table-column label="操作" width="350px">
                <template slot-scope="scope">
                    <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)">编辑</el-button>
                    <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeRoleById(scope.row.id)">删除</el-button>
                    <el-tooltip effect="dark" content="分配权限" placement="top" :enterable="false">
                        <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(scope.row)">分配权限</el-button>
                    </el-tooltip>
                </template>
                
            </el-table-column>
            </el-table>
        </el-card>
        <!-- 添加角色对话框 -->
        <el-dialog
            title="添加角色"
            :visible.sync="addDialogVisible"
            width="50%"
            @close="dialogClosed('addFormRef')">
            <el-form :label-position="'right'" label-width="85px" ref="addFormRef" :model="addForm" :rules="rules">
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="addForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="addForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="submitAddForm">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 修改角色对话框 -->
        <el-dialog
            title="修改角色"
            :visible.sync="editDialogVisible"
            width="50%"
            @close="dialogClosed('editFormRef')">
            <el-form :label-position="'right'" label-width="85px" ref="editFormRef" :model="editForm" :rules="rules">
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="editForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="editForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="submitEditForm">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 分配权限对话框 -->
        <el-dialog
            title="分配权限"
            :visible.sync="setRightDialogVisible"
            width="50%"
            ref="setRightRef"
            @close="setRightDialogClosed">
            <el-tree 
            :data="rightsList" 
            :props="treeProps" 
            ref="treeRef"
            show-checkbox 
            node-key="id" 
            default-expand-all 
            :default-checked-keys="defKeys"></el-tree>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setRightDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="allotRights">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data () {
      return {
        //   角色列表
        rolesList: [],
        // 控制添加弹窗
        addDialogVisible: false,
        // 控制修改弹窗
        editDialogVisible: false,
        // 控制分配权限弹窗
        setRightDialogVisible: false,
        addForm: {
            roleName: '',
            roleDesc: ''
        },
        editForm: {
            roleName: '',
            roleDesc: ''
        },
        // 权限列表
        rightsList: [],
        treeProps: {
            label: 'authName',
            children: 'children'
        },
        // 角色已经选中的权限列表
        defKeys: [],
        // 当前即将要分配权限的角色ID
        roleId: '',
        rules: {
            roleName :[
                {required:true, message: '角色名称不能为空', trigger: 'blur'}
            ],
            roleDesc :[
                {required:true, message: '角色描述不能为空', trigger: 'blur'}
            ],
        }
      }
    },
    created() {
        this.getRolesList()
    },
    methods: {
        // 获取角色列表
        async getRolesList() {
            const { data: res } = await this.$http.get('roles')
            if (res.meta.status !== 200) {
                this.$message.error('角色列表获取失败！')
            }else {
                this.rolesList = res.data
                console.log(res.data)
            }
        },
        // 关闭弹窗，清空数据
        dialogClosed(formRef) {
            this.$refs[formRef].resetFields()
        },
        // 添加角色
        submitAddForm() {
            this.$refs['addFormRef'].validate(async valid => {
                if(valid) {
                    const { data: res } = await this.$http.post('roles', this.addForm)
                    if(res.meta.status === 201) {
                        this.$message.success(res.meta.msg)
                        this.addDialogVisible = false
                        this.getRolesList()
                    } else {
                        this.$message.error(res.meta.msg)
                    }
                } else {
                    this.$message.error('角色添加失败!')
                }
            })
        },
        // 打开修改角色弹窗, 根据ID查询角色信息
        async showEditDialog(id) {
            const { data: res } = await this.$http.get(`roles/${id}`)
            if(res.meta.status !== 200) {
                this.$message.error('角色信息获取失败！')
            }else {
                this.editForm = res.data
                // console.log(res.data)
                this.editDialogVisible = true
            }
        },
        // 提交修改后的角色信息
        submitEditForm() {
            this.$refs['editFormRef'].validate(async valid => {
                if(valid) {
                    const { data: res } = await this.$http.put(`roles/${this.editForm.roleId}`, {
                        roleName: this.editForm.roleName,
                        roleDesc: this.editForm.roleDesc,
                    })
                    if(res.meta.status === 200) {
                        this.$message.success('角色修改成功!')
                        this.editDialogVisible = false
                        this.getRolesList()
                    } else {
                        this.$message.error('角色修改失败!')
                    }
                } else {
                    this.$message.error('角色修改失败!')
                }
            })
        },
        // 根据ID 删除角色
        async removeRoleById(id) {
            const confirmRes = await this.$confirm('该操作将会永久删除该角色，是否继续？', '提示', {
                confirmButtonText: '确定',
                cancleButtonText: '取消',
                type: 'warning'
            }).catch(error => error)
            if(confirmRes === 'confirm') {
                const { data: res } = await this.$http.delete(`roles/${id}`)
                if(res.meta.status) {
                    this.$message.success(res.meta.msg)
                    this.getRolesList()
                }
            }else {
                this.$message.info('已取消删除！')
            }    
        },
        // 分配权限弹窗
        async showSetRightDialog(role) {
            this.roleId = role.id
            const { data: res } = await this.$http.get('rights/tree')
            if(res.meta.status !== 200) {
                this.$message.error('权限列表获取失败！')
            } else {
                this.rightsList = res.data
                // 调用递归函数，获取三级权限节点的ID
                this.getDefKeys(role, this.defKeys)
                // console.log(res.data)
            }
            this.setRightDialogVisible = true
        },
        // 递归函数，获取三级权限节点ID
        getDefKeys(node, arr) {
            // 如果当前 node 节点不包含 children 属性，则是三级权限节点
            if(!node.children) {
                return arr.push(node.id)
            }
            node.children.forEach(item => this.getDefKeys(item, arr))
        },
        // 关闭分配权限弹窗，清空 defKeys 数组
        setRightDialogClosed() {
            this.defKeys = []
        },
        // 获取勾选的权限ID，为角色分配权限
        async allotRights() {
            const keys = [
                ...this.$refs['treeRef'].getCheckedKeys(), ...this.$refs['treeRef'].getHalfCheckedKeys()
            ]
            const idStr = keys.join(',')
            const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
            if(res.meta.status !== 200) {
                this.$message.error('权限分配失败！')
            } else {
                this.$message.success('权限分配成功！')
                this.setRightDialogVisible = false
                this.getRolesList()
            }
        },
        // 删除三级权限
        async removeAuthById(role, rightId) {
            const confirmRes = await this.$confirm('此操作将永久删除该权限，是否继续？', '提示', {
                confirmButtonText: '确定',
                cancleButtonText: '确定',
                type: 'warning'
            }).catch(error => error)
            if(confirmRes !== 'confirm') {
                this.$message.info('已取消删除')
            } else {
                // console.log('删除')
                const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
                if (res.meta.status === 200) {
                    this.$message.success('权限删除成功！')
                    // this.getRolesList()
                    role.children = res.data
                } else {
                    this.$message.error('权限删除失败！')
                }
            }
            
        }
    }
}
</script>

<style lang="less" scoped>
.el-tag {
    margin: 7px;
}
.bdtop {
    border-top: 1px solid #eee;
}
.bdbottom {
    border-bottom: 1px solid #eee;
}
.vcenter {
    display: flex;
    align-items: center;
}
</style>