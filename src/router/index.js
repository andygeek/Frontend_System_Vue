import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Category from '../components/Category.vue'
import Brand from '../components/Brand.vue'
import Unit from '../components/Unit.vue'
import Product from '../components/Product.vue'
import Sale from '../components/Sale.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/category',
    name: 'Category',
    component: Category
  },
  {
    path: '/brand',
    name: 'Brand',
    component: Brand
  },
  {
    path: '/unit',
    name: 'Unit',
    component: Unit
  },
  {
    path: '/product',
    name: 'Product',
    component: Product
  },
  {
    path: '/sale',
    name: 'Sale',
    component: Sale
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
