import { createApp } from 'vue'
import App from './App.vue'
import { createWebHistory,createRouter } from 'vue-router'
import Login from './pages/Login.vue'
import Register from './pages/Register.vue'
import User from './pages/User.vue'
import Profile from './pages/Profile.vue'
import Home from './pages/Home.vue'
import Followers from './pages/Followers.vue'
import Post from './pages/Post.vue'
import Search from './pages/Search.vue'
import './assets/base.css'

const routes = [
  { path: '/', component: Home,name: 'home' },
    { path: '/login', component: Login,name: 'login' },
    { path: '/register', component: Register,name: 'register' },
    { path: '/profile', component: Profile,name: 'profile' },
    { path: '/user/:username', component: User,name: 'user' },
    { path: '/post/:postId', component: Post,name: 'post' },
    { path: '/followers', component: Followers,name: 'followers' },
    { path: '/search', component: Search,name: 'search' },
  ]
  
  const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
  })

const app = createApp(App).use(router).mount('#app')


export default router