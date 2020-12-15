import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../views/login'
import Home from '@/components/Home.vue'
import Welcome from '@/views/welcome'
import Users from '@/views/users'
import Rights from '@/views/power/rights.vue'
import Roles from '@/views/power/roles.vue'
import Cate from '@/views/goods/cate.vue'
import Params from '@/views/goods/params.vue'


Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: "/login",
    component: Login
  },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      {
        path: '/welcome',
        component: Welcome
      },
      {
        path: '/users',
        component: Users,
      },
      {
        path: '/rights',
        component: Rights
      },
      {
        path: '/roles',
        component: Roles
      },
      {
        path: '/categories',
        component: Cate
      },
      {
        path: '/params',
        component: Params
      },
    ]
  }
]
const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  if (to.path === '/login') {
    return next()
  } else {
    const token = sessionStorage.getItem('token')
    if (token) {
      return next()
    } else {
      return next('/login')
    }
  }
})

export default router
