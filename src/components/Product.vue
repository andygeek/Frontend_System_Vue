<template>
  <v-layout align-start>
    <v-flex>
      <v-data-table
        :headers="headers"
        :items="products"
        :search="search"
        sort-by="name"
        class="elevation-3"
      >
        <template v-slot:top>
          <v-toolbar flat color="white">
            <v-toolbar-title>Productos</v-toolbar-title>
            <v-divider class="mx-3" inset vertical></v-divider>
            <v-spacer></v-spacer>
            <v-text-field
              class="text-xs-center"
              v-model="search"
              append-icon="search"
              label="Búsqueda"
              single-line
              hide-details
            ></v-text-field>
            <v-spacer></v-spacer>
            <v-btn color="blue" dark class="mb-2" @click="show_dialog_product()">NUEVO</v-btn>
            <v-dialog v-model="dialog_product" max-width="500px">
              <v-card>
                <v-card-title>
                  <span class="headline">{{ formTitle_NewProduct }}</span>
                </v-card-title>
                <v-card-text>
                  <v-container>
                    <v-row>
                      <v-col cols="12" sm="6" md="6">
                        <v-text-field v-model="code" label="Código"></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6" md="6">
                        <v-autocomplete
                          v-model="categoryId"
                          :items="categories"
                          color="white"
                          label="Categorias"
                          :search-input.sync="search_category"
                        ></v-autocomplete>
                      </v-col>
                      <v-col cols="12" sm="12" md="12">
                        <v-text-field v-model="name" label="Nombre"></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="12" md="12">
                        <v-autocomplete
                          v-model="brandId"
                          :items="brands"
                          color="white"
                          label="Marca"
                          :search-input.sync="search_brand"
                        ></v-autocomplete>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" text @click="close_dialog_new_product">Cancelar</v-btn>
                  <v-btn color="blue darken-1" text @click="save_dialog_new_product">Guardar</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
            <v-dialog v-model="dialog_price_list" max-width="700px">
              <v-card>
                <v-card-title
                  class="headline grey lighten-2"
                  primary-title
                >{{ product_select.name + ' ' + product_select.brandName }}</v-card-title>
                <v-data-table
                  :headers="header_price_list"
                  :items="product_prices"
                  :disable-pagination="false"
                  hide-default-footer
                >
                  <template v-slot:item.action="{ item }">
                    <v-btn
                      class="mx-1"
                      fab
                      dark
                      small
                      color="#33691E"
                      max-height="27"
                      max-width="27"
                    >
                      <v-icon dark small>remove_red_eye</v-icon>
                    </v-btn>
                    <v-btn
                      class="mx-1"
                      fab
                      dark
                      small
                      color="#C62828"
                      max-height="27"
                      max-width="27"
                      @click="delete_price(item)"
                    >
                      <v-icon dark small>delete</v-icon>
                    </v-btn>
                  </template>
                </v-data-table>
                <v-btn block color="blue" dark @click="show_dialog_new_price()">Agregar Precio</v-btn>
              </v-card>
            </v-dialog>
            <v-dialog v-model="dialog_new_price" max-width="500px">
              <v-card>
                <v-card-title>
                  <span class="headline">NUEVO PRECIO</span>
                </v-card-title>
                <v-card-text>
                  <v-container>
                    <v-row>
                      <v-col cols="12" sm="12" md="12">
                        <v-autocomplete
                          v-model="unitId"
                          :items="units"
                          color="white"
                          label="Unidades"
                          :search-input.sync="search_unit"
                        ></v-autocomplete>
                      </v-col>
                      <v-col cols="12" sm="6" md="6">
                        <v-text-field v-model="cost" label="Costo"></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6" md="6">
                        <v-text-field v-model="price" label="Precio"></v-text-field>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" text @click="close_dialog_new_price">Cancelar</v-btn>
                  <v-btn color="blue darken-1" text @click="save_dialog_new_price">Guardar</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-toolbar>
        </template>
        <template v-slot:item.action="{ item }">
          <v-btn
            class="mx-1"
            rounded
            color="#AEEA00"
            white
            max-height="27"
            @click="show_price_list(item)"
          >Precios</v-btn>

          <v-btn
            class="mx-1"
            fab
            dark
            small
            color="#1976D2"
            max-height="27"
            max-width="27"
            @click="edit_Product(item)"
          >
            <v-icon small dark>edit</v-icon>
          </v-btn>

          <v-btn
            class="mx-1"
            fab
            dark
            small
            color="#C62828"
            max-height="27"
            max-width="27"
            @click="delete_product(item)"
          >
            <v-icon dark small>delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-flex>
  </v-layout>
</template>
<script>
import axios from "axios";
function $(el) {
  return document.getElementById(el);
}
export default {
  data() {
    return {
      //dialogs
      dialog_product: false,
      dialog_price_list: false,
      dialog_new_price: false,
      //for lists
      products: [],
      brands: [],
      categories: [],
      units: [],
      //array with data of product select
      product_select: [],
      //array with prices of product select
      product_prices: [],
      //deaders
      headers: [
        { text: "Código", value: "code", sortable: true, width: 150 },
        { text: "Nombre", value: "name", sortable: true },
        { text: "Marca", value: "brandName", sortable: true },
        {
          text: "Categoria",
          value: "categoryName",
          sortable: true,
          width: 200
        },
        { text: "Opciones", value: "action", sortable: false, width: 250 }
      ],
      header_price_list: [
        { text: "Unidad", value: "unitName", sortable: false, width: 200 },
        { text: "Precio", value: "price", sortable: false, width: 100 },
        { text: "Opciones", value: "action", sortable: false, width: 100 }
      ],
      //edit
      editedIndex: -1,
      //for data table products
      search: "",
      code: "",
      name: "",
      brandId: "",
      brandName: "",
      categoryId: "",
      categoryName: "",

      search_unit: "",
      search_category: "",
      search_brand: "",

      //for unit
      select: "",
      unitName: "",
      unitId: "",
      cost: "",
      price: ""
    };
  },
  computed: {
    formTitle_NewProduct() {
      return this.editedIndex === -1 ? "Nuevo Producto" : "Editar Producto";
    }
  },
  watch: {
    dialog_price_list(val) {
      !val && ((this.product_prices = []), (this.product_select = []));
    },
    dialog_product(val) {
      !val && this.clear_new_product();
    },
    dialog_new_price(val) {
      !val && this.clear_new_unit();
    }
  },
  created() {
    this.list();
    this.initialize();
  },
  methods: {
    show_dialog_product() {
      this.dialog_product = true;
    },
    show_dialog_new_price() {
      this.dialog_new_price = true;
    },
    list() {
      let me = this;
      let unitsArray = [];
      let brandsArray = [];
      let categoriesArray = [];
      axios
        .get("api/products/list")
        .then(function(response) {
          me.products = response.data;
        })
        .catch(function(error) {
          console.log(error);
        });
      axios
        .get("api/categories/list")
        .then(function(response) {
          categoriesArray = response.data;
          categoriesArray.map(function(x) {
            me.categories.push({ text: x.name, value: x.id });
          });
        })
        .catch(function(error) {
          console.log(error);
        });
      axios
        .get("api/brands/list")
        .then(function(response) {
          brandsArray = response.data;
          brandsArray.map(function(x) {
            me.brands.push({ text: x.name, value: x.id });
          });
        })
        .catch(function(error) {
          console.log(error);
        });
      axios
        .get("api/units/list")
        .then(function(response) {
          unitsArray = response.data;
          unitsArray.map(function(x) {
            me.units.push({ text: x.name, value: x.id });
          });
        })
        .catch(function(error) {
          console.log(error);
        });
    },
    list_price(id) {
      let me = this;
      axios
        .get("api/product_unit/getproductid/" + id)
        .then(function(response) {
          me.product_prices = response.data;
        })
        .catch(function(error) {
          console.log(error);
        });
    },
    show_price_list(item) {
      this.dialog_price_list = true;
      let me = this;
      me.product_select = item;
      me.list_price(me.product_select.id);
    },
    edit_Product(item) {
      this.editedIndex = this.products.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog_product = true;
      this.id = item.id;
      this.code = item.code;
      this.name = item.name;
      this.brandId = item.brandId;
      this.categoryId = item.categoryId;
    },
    save_dialog_new_product() {
      let me = this;
      //console.log()
      if (me.editedIndex == -1) {
        axios
          .post("api/Products/create", {
            code: me.code,
            name: me.name,
            brandId: me.brandId,
            categoryId: me.categoryId
          })
          .then(function(response) {
            me.clear_new_product();
            me.dialog_product = false;
            me.list();
          })
          .catch(function(error) {
            console.log(error);
          });
      } else {
        axios
          .put("api/Products/update", {
            id: me.id,
            code: me.code,
            name: me.name,
            brandId: me.brandId,
            categoryId: me.categoryId
          })
          .then(function(response) {
            me.clear_new_product();
            me.dialog_product = false;
            me.list();
          })
          .catch(function(error) {
            console.log(error);
          });
      }
      this.list();
    },
    delete_price(item) {
      let me = this;
      let id_product = me.product_select.id;
      axios
        .delete("api/Product_Unit/delete/" + item.productId + "/" + item.unitId)
        .then(function(response) {
          me.list_price(id_product);
        })
        .catch(function(error) {
          console.log(error);
        });
    },
    delete_product(item) {
      let me = this;
      axios
        .delete("api/Products/delete/" + item.id)
        .then(function(response) {
          me.list();
        })
        .catch(function(error) {
          console.log(error);
        });
    },
    save_dialog_new_price() {
      let me = this;
      let id_product = me.product_select.id;
      axios
        .post("api/Product_Unit/create", {
          unitId: me.unitId,
          productId: me.product_select.id,
          cost: me.cost,
          price: me.price
        })
        .then(function(response) {
          me.clear_new_unit();
          me.dialog_new_price = false;
          me.list_price(id_product);
        })
        .catch(function(error) {
          console.log(error);
        });
    },
    close_dialog_new_product() {
      this.clear_new_product();
      this.dialog_product = false;
    },
    close_dialog_edit_product() {
      this.dialog_edit_product = false;
    },
    close_dialog_new_price() {
      this.clear_new_unit();
      this.dialog_new_price = false;
    },

    clear_new_product() {
      this.code = "";
      this.name = "";
      this.brandId = "";
      this.categoryId = "";
      this.search_category = "";
      this.search_brand = "";
      this.editedIndex = -1;
    },
    clear_new_unit() {
      this.cost = "";
      this.price = "";
      this.search_unit = "";
      this.unitId = "";
    }
  }
};
</script>