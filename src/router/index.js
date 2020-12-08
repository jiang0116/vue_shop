import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../views/login'
import Home from '@/components/Home.vue'
import Welcome from '@/views/welcome'
import Users from '@/views/users'


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
      }
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
