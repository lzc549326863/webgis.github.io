import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/home.vue')
  },
  {
    path: '/webgl',
    name: 'webgl',
    component: () => import('../views/home3d.vue')
  }
]

const router = new VueRouter({
  routes
})

// router.beforeEach((to, from, next) => {
//   const token = window.sessionStorage.getItem('token');
//   if (!token) {
//     if (to.path == '/login') {
//       next()
//     } else {
//       next('/login')
//     }
//     return
//   }
//   next()
// })

export default router
