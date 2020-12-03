<template>
    <div class="login_container">
        <div class="login_box">
            <!-- 头像区 -->
            <div class="avatar_box">
                <img src="@/assets/logo.png" alt="" />
            </div>
            <!-- 表单区 -->
            <el-form ref="loginFormRef" class="login_form" :rules="rules" :model="loginForm" label-width="0px" >
                <el-form-item label-width="80px" label="用户名" prop="username">
                    <el-input prefix-icon="iconfont icon-user" v-model="loginForm.username"></el-input>
                </el-form-item>
                <el-form-item label-width="80px" label="密码" prop="password">
                    <el-input prefix-icon="iconfont icon-3702mima" type="password" v-model="loginForm.password"></el-input>
                </el-form-item>
                <el-form-item class="btns">
                    <el-button type="primary" @click="login">登录</el-button>
                    <el-button type="info" @click="resetLoginForm">重置</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script>
// import { compile } from 'vue/types/umd';
export default {
    data() {
        return {
            loginForm: {
                username: '',
                password: ''
            },
            rules: {
                username: [
                    { required: true, message: '用户名不能为空', trigger: 'blur' },
                    { min: 3, max: 10, message: '用户名长度在 3 到 10 个字符', trigger: 'blur' }
                ],
                password: [
                    {required: true, message: '密码不能为空', trigger: 'blur'},
                    { min: 6, max: 15, message: '密码长度在 6 到 15 个字符', trigger: 'blur' }
                ]
            }
        };
    },
    methods: {
        resetLoginForm() {
            // console.log(this)
            this.$refs['loginFormRef'].resetFields()
        },
        login() {
            this.$refs['loginFormRef'].validate(async valid => {
                if(!valid) return;
                const {data: res} = await this.$http.post('login', this.loginForm)
                // console.log(res)
                if(res.meta.status !== 200) {
                    this.$message.error('登录失败')
                } else {
                    this.$message.success('登录成功')
                    sessionStorage.setItem('token', res.data.token)
                    this.$router.push('/home')
                }
            })
        }
    },
};
</script>

<style <style lang="less" scoped>
.login_container {
    height: 100%;
    background-color: #2b4b6b;
}

.login_box {
    width: 450px;
    height: 300px;
    border-radius: 5px;
    background-color: #fff;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.avatar_box {
    width: 130px;
    height: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    box-shadow: 0 0 10px #ddd;
    padding: 10px;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #eee;
    }
}

.login_form {
    position: absolute;
    bottom: 0;
    width: 100%;
    left: -5%;
    padding: 0 20px;
    box-sizing: border-box;
}

.btns {
    display: flex;
    justify-content: flex-end;
}
</style>