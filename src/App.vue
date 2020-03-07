<template>
  <v-app id="inspire">
    <v-navigation-drawer
      v-model="drawer"
      app
    >
      <v-list dense>
        <v-list-item :to="{name: 'Home'}">
          <v-list-item-action>
            <v-icon>home</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Inicio</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item :to="{name: 'Product'}">
          <v-list-item-action>
            <v-icon>shopping_basket</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Productos</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
         <v-list-item :to="{name: 'Sale'}">
          <v-list-item-action>
            <v-icon>local_grocery_store</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Venta</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item :to="{name: 'Brand'}">
          <v-list-item-action>
            <v-icon>business</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Marcas</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item :to="{name: 'Category'}">
          <v-list-item-action>
            <v-icon>category</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Categorias</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item :to="{name: 'Unit'}">
          <v-list-item-action>
            <v-icon>format_list_numbered</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Unidades</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        
      </v-list>
    </v-navigation-drawer>
    <v-app-bar
      app
      color="indigo"
      dark>
       <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
       <v-toolbar-title>Sistema</v-toolbar-title>
    </v-app-bar>
    <v-content>
      <v-container
        class="fill-height"
        fluid
        >
        <v-slide-y-transition mode="out-in">
          <router-view/>
        </v-slide-y-transition>      
      </v-container>
    </v-content>
    <v-footer
      color="indigo"
      app
    >
      <span class="white--text">&copy; 2020</span>
    </v-footer>
  </v-app>
</template>
<script>
export default {
  props: {
      source: String,
    },
    data: () => ({
      drawer: null,
    }),
}
</script>
