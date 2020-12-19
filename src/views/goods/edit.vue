<template>
    <div>
        <!-- 面包屑区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home'}">首页</el-breadcrumb-item>
            <el-breadcrumb-item >商品管理</el-breadcrumb-item>
            <el-breadcrumb-item >编辑商品</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card >
            <!-- 返回按钮 -->
            <el-button type="primary" @click="gobackList" class="gobackBtn">返回商品列表</el-button>
            <!-- 信息提示框 -->
            <el-alert title="修改商品信息，注意：商品名称必须唯一" type="info" center show-icon :closable="false"> </el-alert>
            <!-- 步骤条 -->
            <el-steps :active="activeIndex - 0" finish-status="success" align-center >
                <el-step title="基本信息"></el-step>
                <el-step title="商品参数"></el-step>
                <el-step title="商品属性"></el-step>
                <el-step title="商品图片"></el-step>
                <el-step title="商品内容"></el-step>
                <el-step title="完成"></el-step>
            </el-steps>
            <!-- 表单区域 -->
            <el-form :model="editForm" ref="editFormRef" :rules="rules" label-width="80px" label-position="top">
                <!-- 左侧 tab 标签栏 -->
                <el-tabs v-model="activeIndex" tab-position="left">
                    <el-tab-pane label="基本信息" name="0">
                        <el-form-item label="商品名称" prop="goods_name">
                            <el-input v-model="editForm.goods_name" clearable></el-input>
                        </el-form-item>
                        <el-form-item label="商品价格" prop="goods_price">
                            <el-input type="number"  v-model="editForm.goods_price" clearable></el-input>
                        </el-form-item>
                        <el-form-item label="商品重量" prop="goods_weight">
                            <el-input type="number" v-model="editForm.goods_weight" clearable></el-input>
                        </el-form-item>
                        <el-form-item label="商品数量" prop="goods_number">
                            <el-input type="number"  v-model="editForm.goods_number" clearable></el-input>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品参数" name="1">
                        <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
                            <el-checkbox-group v-model="item.attr_vals" >
                                <el-checkbox :label="item1" v-for="(item1, i) in item.attr_vals" :key="i" border>
                                </el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品属性" name="2">
                        <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
                            <el-input v-model="item.attr_vals" clearable></el-input>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品图片" name="3">
                        <el-upload
                            :action="uploadURL"
                            :on-preview="handlePreview"
                            :on-remove="handleRemove"
                            :on-success="handleSuccess"
                            :headers="headersObj"
                            list-type="picture">
                            <el-button size="small" type="primary">点击上传新图片</el-button>
                        </el-upload>
                    </el-tab-pane>
                    <el-tab-pane label="商品内容" name="4">
                        <quill-editor
                            v-model="editForm.goods_introduce"
                        />
                    </el-tab-pane>
                    <el-button type="primary" class="submitEditBtn" @click="submitEditInfo">提交修改</el-button>
                </el-tabs>
            </el-form>
        </el-card>
        <el-dialog
            title="提示"
            :visible.sync="previewDialogVisible"
            width="50%">
            <el-image :src="previewURl" style="width: 100%;"></el-image>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data () {
      return {
        //   接收跳转携带的商品ID
        id: this.$route.params.goodsId,
        //   步骤条控制
        activeIndex: 0,
        // 编辑表单
        editForm: {
            goods_name: '',
            goods_price: 0,
            goods_weight: 0,
            goods_number: 0,
            pics: [],
            goods_introduce: '',
            attrs: [],
        },
        srcList: ['http://127.0.0.1:8888/uploads/goodspics/mid_1bbec9c1bfd7ef2618cca647c1613c08.png'],
        // 商品动态参数
        manyTableData: [],
        // 商品静态属性
        onlyTableData: [],
        // 图片上传路径
        uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
        // 图片上传请求头
        headersObj: {
            Authorization: sessionStorage.getItem('token')
        },
        // 图片预览弹窗
        previewDialogVisible: false,
        // 图片预览路径
        previewURl: '',
        // 验证规则
        rules: {
            goods_name: [{required: true, message: '商品名称不能为空', trigger: 'blur'}],
            goods_price: [{required: true, message: '商品价格不能为空', trigger: 'blur'}],
            goods_weight: [{required: true, message: '商品重量不能为空', trigger: 'blur'}],
            goods_number: [{required: true, message: '商品数量不能为空', trigger: 'blur'}],
            goods_cat: [{required: true, message: '商品分类不可为空', trigger: 'blur'}]
        }
      }
    },
    created() {
        this.getGoodInfo()
    },
    methods: {
        // 返回商品列表按钮
        gobackList() {
            this.$router.go(-1)
        },
        // 获取当前商品信息
        async getGoodInfo() {
            const { data: res } = await this.$http.get(`goods/${this.id}`)
            if(res.meta.status !== 200) {
                return this.$message.error('商品信息获取失败！')
            }
            res.data.attrs.forEach(item => {
                if(item.attr_sel === 'many') {
                    this.manyTableData.push(item)
                } else {
                    this.onlyTableData.push(item)
                }
            })
            // 处理 manyTableData
            this.manyTableData.forEach(item => {
                item.attr_vals = item.attr_vals.split(',')
            })
            this.editForm = res.data
            this.editForm.attrs = []
            console.log(this.editForm)
            // console.log(this.editForm.goods_cat);
            console.log(this.manyTableData)
            // console.log(this.onlyTableData)
        },
        // 图片上传成功
        handleSuccess(response) {
            const picInfo = { pic: response.data.tem_path } 
            this.editForm.pics.push(picInfo)
        },
        // 图片预览
        handlePreview(file) {
            this.previewURl = file.response.data.url
            this.previewDialogVisible = true
        },
        // 图片删除
        handleRemove(file) {
            const filePath = flie.response.data.tem_path
            const i = this.editForm.pics.findIndex(x => x.pic === filePath)
            this.editForm.pics.splice(i, 1)
        },
        // 提交修改后的信息
        submitEditInfo() {
            this.$refs['editFormRef'].validate(async valid => {
                if(!valid) {
                    return this.$message.error('商品添加失败，请填写必要的表单项！')
                }
                // 处理动态参数
                this.manyTableData.forEach(item => {
                    const newInfo = {
                        attr_id: item.attr_id,
                        attr_value: item.attr_vals.join(',')
                    }
                    this.editForm.attrs.push(newInfo)
                })
                // 处理静态属性
                this.onlyTableData.forEach(item => {
                    const newInfo = {
                        attr_id: item.attr_id,
                        attr_value: item.attr_vals
                    }
                    this.editForm.attrs.push(newInfo)
                })
                console.log(this.editForm);
                const { data: res } = await this.$http.put(`goods/${this.id}`, this.editForm)
                console.log(res);
                if(res.meta.status !== 200) {
                    return this.$message.error('商品信息修改失败！')
                }
                this.$message.success('商品信息修改成功！')
                this.$router.push('/goods')
            })
        }
    }
}
</script>

<style lang="less" scoped>
    .gobackBtn {
        margin: 15px 0;
    }

    .submitEditBtn {
        margin-top: 15px;
    }
</style>