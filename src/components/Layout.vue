<template>
    <div>
        后台首页
        <el-button type="info" @click="logout">退出</el-button>
    </div>
</template>

<script>
export default {
    data () {
      return {
      }
    },
    components: {},
    methods: {
        logout() {
            sessionStorage.removeItem('token')
            this.$router.push('/login')
        }
    }
}
</script>

<style scoped>

</style>