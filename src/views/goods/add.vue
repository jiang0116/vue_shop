<template>
    <div>
        <!-- 面包屑区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home'}">首页</el-breadcrumb-item>
            <el-breadcrumb-item >商品管理</el-breadcrumb-item>
            <el-breadcrumb-item >添加商品</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区域 -->
        <el-card>
            <!-- 取消添加，返回按钮 -->
            <el-button type="primary"  @click="gobackList" class="gobackBtn">返回商品列表</el-button>
            <!-- 警告 -->
            <el-alert title="添加商品信息，注意：商品名称必须唯一" type="info" show-icon center :closable="false"></el-alert>
            <!-- 步骤条 -->
            <el-steps :active="activeIndex - 0" finish-status="success" align-center>
                <el-step title="基本信息"></el-step>
                <el-step title="商品参数"></el-step>
                <el-step title="商品属性"></el-step>
                <el-step title="商品图片"></el-step>
                <el-step title="商品内容"></el-step>
                <el-step title="完成"></el-step>
            </el-steps>
            <!-- 左侧边栏 -->
            <el-form :model="addForm" status-icon :rules="rules" ref="addFormRef" label-width="100px" label-position="top">
                <el-tabs v-model="activeIndex" :tab-position="'left'" :before-leave="beforeTabLeave" @tab-click="tabClicked">
                    <el-tab-pane label="基本信息" name="0">
                        <el-form-item label="商品名称" prop="goods_name">
                            <el-input v-model="addForm.goods_name" clearable ></el-input>
                        </el-form-item>
                        <el-form-item label="商品价格" prop="goods_price">
                            <el-input v-model="addForm.goods_price" type="number" clearable ></el-input>
                        </el-form-item>
                        <el-form-item label="商品重量" prop="goods_weight">
                            <el-input v-model="addForm.goods_weight" type="number" clearable ></el-input>
                        </el-form-item>
                        <el-form-item label="商品数量" prop="goods_number">
                            <el-input v-model="addForm.goods_number" type="number" clearable ></el-input>
                        </el-form-item>
                        <el-form-item label="商品分类" prop="goods_cat">
                            <el-cascader
                                v-model="addForm.goods_cat"
                                :options="cateList"
                                :props="cateProps"
                                clearable
                                @change="handleChange">
                            </el-cascader>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品参数" name="1">
                        <el-form-item v-for="item in manyTableData" :key="item.attr_id" :label="item.attr_name">
                            <el-checkbox-group v-model="item.attr_vals">
                                <el-checkbox border v-for="(item1, i) in item.attr_vals" :key="i" :label="item1"></el-checkbox>
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
                            list-type="picture"
                            :headers="headersObj"
                            :on-success="handleSuccess">
                            <el-button size="small" type="primary">点击上传</el-button>
                        </el-upload>
                    </el-tab-pane>
                    <el-tab-pane label="商品内容" name="4">
                        <quill-editor
                            ref="myQuillEditor"
                            v-model="addForm.goods_introduce"
                        />
                        <el-button class="addBtn" type="primary" @click="addGoods">添加商品</el-button>
                    </el-tab-pane>
                    
                </el-tabs>
            </el-form>
        </el-card>
        <!-- 图片预览弹窗 -->
        <el-dialog
            title="图片预览"
            :visible.sync="previewDialogVisible"
            width="50%">
            <el-image :src="previewURl" class="previewImg"></el-image>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data () {
        return {
            // 所有商品分类
            cateList:[],
            // 步骤条控制
            activeIndex: 0,
            // 添加表单
            addForm: {
                goods_name: '',
                goods_price: 0,
                goods_weight: 0,
                goods_number: 0,
                // 已选中的商品分类
                goods_cat: [],
                // 图片信息数组
                pics: [],
                // 商品介绍
                goods_introduce: '',
                // 商品属性
                attrs: []
            },
            // 商品分类级联选择器参数
            cateProps: { 
                expandTrigger: 'hover',
                value: 'cat_id',
                label: 'cat_name',
                children: 'children'
            },
            // 商品动态参数列表
            manyTableData: [],
            // 商品静态属性列表
            onlyTableData: [],
            // 图片上传URL地址
            uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
            // 图片上传请求头
            headersObj: {
                Authorization: sessionStorage.getItem('token')
            },
            // 图片预览弹窗
            previewDialogVisible: false,
            // 图片预览地址
            previewURl: '',
            // 验证规则
            rules: {
                goods_name: [{required: true, message: '商品名称不可为空', trigger: 'blur'}],
                goods_price: [{required: true, message: '商品价格不可为空', trigger: 'blur'}],
                goods_weight: [{required: true, message: '商品重量不可为空', trigger: 'blur'}],
                goods_number: [{required: true, message: '商品数量不可为空', trigger: 'blur'}],
                goods_cat: [{required: true, message: '商品分类不可为空', trigger: 'blur'}]
            }
        }
    },
    created() {
        this.getCateList()
    },
    methods: {
        // 取消添加，返回操作
        gobackList() {
            this.$router.go(-1)
        },
        // 获取所有商品分类列表
        async getCateList() {
            const { data: res } = await this.$http.get('categories')
            if(res.meta.status !==200) {
                return this.$message.error('获取商品分类列表失败！')
            }
            this.cateList = res.data
            console.log(res.data)
            this.$message.success('商品分类列表获取成功！')
        },
        // 监听级联选择器
        handleChange() {
            console.log(this.addForm.goods_cat)
            if(this.addForm.goods_cat.length !== 3) {
                this.addForm.goods_cat = []
                // this.$message.warning('只能选择三级分类！')
            }
        },
        // 控制 Tab 标签的切换，不选择分类，不能切换标签
        beforeTabLeave(activeName, oldActiveName) {
            if(oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
                this.$message.error('请先选择商品分类！')
                return false
            }
        },
        // 监听 tab 标签的选中事件，获取商品属性
        async tabClicked() {
            if(this.activeIndex === '1') {
                const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'many' } })
                if(res.meta.status !== 200) {
                    return this.$message.error('获取商品参数失败！')
                }
                res.data.forEach(item => {
                    item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
                })
                this.manyTableData = res.data
                console.log(res.data)
            } else if (this.activeIndex === '2') {
                const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'only' } })
                if(res.meta.status !== 200) {
                    return this.$message.error('获取商品属性失败！')
                }
                this.onlyTableData = res.data
                console.log(res.data)
            }
        },
        // 点击图片预览处理函数
        handlePreview(file) {
            this.previewURl = file.response.data.url
            this.previewDialogVisible = true
        },
        // 点击删除图片处理函数
        handleRemove(file) {
            // 1.获取要删除图片的基本路径
            const filePath = file.response.data.tem_path
            // 2.从 pics 数组中，找到这个图片对应的索引值
            const i = this.addForm.pics.findIndex(x => x.pic === filePath)
            // 3.调用数组的 splice 方法，把图片信息对象从 pics 数组中移除
            this.addForm.pics.splice(i, 1)
            console.log(this.addForm)
        },
        // 监听图片上传成功的处理函数
        handleSuccess(response) {
            console.log(response)
            // 1.拼接得到一个图片信息对象
            const picInfo = { pic: response.data.tmp_path }
            // 2.将图片信息对象 push 到 pics 数组中
            this.addForm.pics.push(picInfo)
            console.log(this.addForm)
        },
        // 添加商品按钮
        addGoods() {
            this.$refs['addFormRef'].validate(async valid => {
                if(!valid) {
                    return this.$message.error('商品添加失败，请填写必要的表单项！')
                }
                // 进行添加处理
                this.addForm.goods_cat = this.addForm.goods_cat.join(',')
                // 处理动态参数
                this.manyTableData.forEach(item => {
                    const newInfo = {
                        attr_id: item.attr_id,
                        attr_value: item.attr_vals.join(',')
                    }
                    this.addForm.attrs.push(newInfo)
                })
                // 处理静态属性
                this.onlyTableData.forEach(item => {
                    const newInfo = {
                        attr_id: item.attr_id,
                        attr_value: item.attr_vals
                    }
                    this.addForm.attrs.push(newInfo)
                })
                console.log(this.addForm);
                // 发起添加请求,商品的名称必须是唯一的
                const { data: res } = await this.$http.post('goods', this.addForm)
                if(res.meta.status !== 201) {
                    return this.$message.error('商品添加失败！')
                }
                this.$message.success('商品添加成功！')
                this.$router.push('/goods')
            })
        }
    },
    computed: {
        cateId() {
            if(this.addForm.goods_cat.length === 3) {
                return this.addForm.goods_cat[2]
            }
            return null
        }
    }
}
</script>

<style lang="less" scoped>
    .el-checkbox {
        margin: 0 10px 0 0 !important;
    }

    .previewImg {
        width: 100%;
    }

    .addBtn {
        margin-top: 15px;
    }

    .gobackBtn {
        margin: 15px 0;
    }
</style>