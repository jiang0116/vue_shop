<template>
    <div>
        <!-- 面包屑区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home'}">首页</el-breadcrumb-item>
            <el-breadcrumb-item >商品管理</el-breadcrumb-item>
            <el-breadcrumb-item >商品列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @change="searchForm">
                        <!-- 此按钮仅为装饰，无实际功能 -->
                        <el-button slot="append" icon="el-icon-search"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="goAddPage">添加商品</el-button>
                </el-col>
            </el-row>
              <el-table
                :data="goodsList"
                stripe
                border
                style="width: 100%">
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column prop="goods_name" label="商品名称"> </el-table-column>
                <el-table-column prop="goods_price" label="商品价格（元）" width="200"> </el-table-column>
                <el-table-column prop="goods_weight" label="商品重量" width="130"> </el-table-column>
                <el-table-column prop="add_time" label="创建时间"  width="180">
                    <template slot-scope="scope"> 
                        {{ scope.row.add_time | dateFormat }}
                    </template>
                </el-table-column>
                    <el-table-column label="操作" width="180">
                        <template slot-scope="scope">
                            <el-button size="mini" type="primary" icon="el-icon-edit" @click="goEditPage(scope.row.goods_id)">编辑</el-button>
                            <el-button size="mini" type="danger" icon="el-icon-delete" @click="romoveGoodById(scope.row.goods_id)">删除</el-button>
                        </template>
                    </el-table-column>
            </el-table>
            <!-- 分页区域 -->
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[5, 10, 30, 50]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
                background>
            </el-pagination>
        </el-card>
    </div>
</template>

<script>
export default {
    data () {
      return {
        queryInfo: {
            query: '',
            pagenum: 1,
            pagesize: 10,
        },
        // 商品列表
        goodsList: [],
        // 总商品条数
        total: 0,
      }
    },
    created() {
        this.getGoodsList()
    },
    methods: {
        // 获取商品列表
        async getGoodsList() {
            const { data: res } = await this.$http.get('goods', { params: this.queryInfo } )
            if(res.meta.status !== 200) {
                return this.$message.error('商品列表获取失败！')
            }
            // this.$message.success('商品列表获取成功！')
            this.goodsList = res.data.goods
            this.total = res.data.total
            // console.log(res.data)
        },
        // 每页显示的条数
        handleSizeChange(newSize) {
            this.queryInfo.pagesize = newSize
            this.getGoodsList()
        },
        // 当前页码
        handleCurrentChange(newNum) {
            this.queryInfo.pagenum = newNum
            this.getGoodsList()
        },
        // 搜索框表单功能
        searchForm() {
            this.queryInfo.pagenum = 1
            this.getGoodsList()
        },
        // 跳转到添加商品页面
        goAddPage() {
            this.$router.push('/goods/add')
        },
        // 跳转到编辑商品页面
        goEditPage(id) {
            this.$router.push({ name: 'edit', params:{ goodsId: id } })
        },
        // 删除商品
        async romoveGoodById(id) {
            const confirmRes = await this.$confirm('此操作将会永久删除该商品，是否继续？', '提示', {
                confirmButtonText: '确定',
                cancleButtonText: '取消',
                type: 'warning'
            }).catch(error => error)
            if (confirmRes === 'confirm') {
                const { data: res } = await this.$http.delete(`goods/${id}`)
                if(res.meta.status !== 200) {
                    return this.$message.error('商品删除失败！')
                }
                this.$message.success('商品删除成功！')
                this.getGoodsList()
            } else {
                this.$message.info('已取消删除！')
            }
        }
    },
}
</script>

<style lang="less" scoped>

</style>