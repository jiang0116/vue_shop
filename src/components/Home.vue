<template>
    <el-container class="Home_container">
        <!-- 头部区域 -->
        <el-header>
            <div>
                <img src="../assets/heima.png" width="35px">
                <span>电商后台管理系统</span>
            </div>
            <el-button type="info" @click="logout">退出</el-button>
        </el-header>
        <el-container>
            <!-- 侧边栏区域 -->
            <el-aside :width="isCollapse ? '64px' : '200px'">
                <div class="toggle-button" @click="toggleCollapse">|||</div>
                <el-menu
                    :default-active="$route.path"
                    class="el-menu-vertical-demo" 
                    background-color="#333744"
                    text-color="#fff"
                    active-text-color="#409eef"
                    unique-opened
                    :collapse="isCollapse"
                    :collapse-transition="false"
                    router
                    >
                    <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
                        <template slot="title">
                        <i :class="iconsObj[item.id]"></i>
                        <span>{{ item.authName }}</span>
                        </template>
                        <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" :key="subItem.id">
                            <template slot="title">
                                <i class="el-icon-menu"></i>
                                <span>{{ subItem.authName }}</span>
                            </template>
                        </el-menu-item>
                    </el-submenu>
                </el-menu>
            </el-aside>
            <!-- 主体区域 -->
            <el-main>
                <router-view></router-view>
            </el-main>
        </el-container>
    </el-container>
</template>

<script>
export default {
    data() {
        return {
            menuList: [],
            // 一级菜单图标
            iconsObj: {
                '125': 'iconfont icon-user',
                '103': 'iconfont icon-tijikongjian',
                '101': 'iconfont icon-shangpin',
                '102': 'iconfont icon-danju',
                '145': 'iconfont icon-baobiao',
            },
            // 菜单是否折叠
            isCollapse: false
        };
    },
    created() {
            this.getMenuList()
        },
    methods: {
        // 退出
        logout() {
            sessionStorage.removeItem("token");
            this.$router.push("/login");
        },
        // 获取左侧导航菜单
        async getMenuList() {
            const {data: res} = await this.$http.get('menus')
            if(res.meta.status !== 200) {
                // console.log(res)
                return this.$message.error(res.meta.msg)
            } else {
                // console.log(res.data)
                this.menuList = res.data
            }
        },
        // 菜单折叠
        toggleCollapse() {
            this.isCollapse = !this.isCollapse
        }
    },
};
</script>

<style lang="less" scoped>
.Home_container {
    height: 100%;
}

.el-header {
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;
    font-size: 20px;
    > div {
        display: flex;
        align-items: center;
        span {
            margin-left: 15px;
        }
    }
}

.el-aside {
    background-color: #333744;
    .el-menu {
        border-right: none;
    }
}

.el-main {
    background-color: #eaedf1;
}

.iconfont {
    margin-right: 10px;
}

.toggle-button {
    background-color: #4a5064;
        font-size: 10px;
        color: #fff;
        line-height: 24px;
        text-align: center;
        letter-spacing: 0.2em;
        cursor: pointer;
    }
</style>