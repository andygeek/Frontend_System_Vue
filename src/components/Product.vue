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
                        <v-text-field v-model="code" label="Código" @keyup="uppercaseCode"></v-text-field>
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
                        <v-text-field v-model="name" label="Nombre" @keyup="uppercaseName"></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6" md="6">
                        <v-autocomplete
                          v-model="unitId"
                          :items="units"
                          color="white"
                          label="Unidad"
                          :search-input.sync="search_unit"
                        ></v-autocomplete>
                      </v-col>
                      <v-col cols="12" sm="6" md="6">
                        <v-autocomplete
                          v-model="brandId"
                          :items="brands"
                          color="white"
                          label="Marca"
                          :search-input.sync="search_brand"
                        ></v-autocomplete>
                      </v-col>
                      <v-col cols="12" sm="6" md="6">
                        <v-text-field v-model="cost" label="Costo" :rules="[rules.numeric]"></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6" md="6">
                        <v-text-field v-model="price" label="Precio" :rules="[rules.numeric]"></v-text-field>
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
            <v-dialog v-model="dialog_delete" max-width="290">
              <v-card>
                <v-card-title class="headline">Advertencia!!</v-card-title>
                <v-card-text>Está seguro que desea eliminar este producto. Los cambios serán irrecuperables.</v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="red" text @click="dialog = false">ACEPTAR</v-btn>
                  <v-btn color="red" text @click="dialog = false">CANCELAR</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-toolbar>
        </template>
        <template v-slot:item.action="{ item }">
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
            @click="show_dialog_delete()"
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
      dialog_delete: false,
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
        { text: "Unidad", value: "unitName", sortable: true },
        { text: "Marca", value: "brandName", sortable: true },
        {
          text: "Categoria",
          value: "categoryName",
          sortable: true,
          width: 200
        },
        { text: "Precio", value: "price", sortable: true, width: 90 },
        { text: "Opciones", value: "action", sortable: false, width: 250 }
      ],
      //rules
      rules: {
        numeric: value => {
          const pattern = /^\d*\.?\d*$/;
          return pattern.test(value) || "Cantidad invalida";
        }
      },
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
    dialog_product(val) {
      !val && this.clear_new_product();
    }
  },
  created() {
    this.list();
    this.initialize();
  },
  methods: {
    insertDecimal(num) {
      return num.toFixed(2);
    },
    uppercaseName() {
      this.name = this.name.toUpperCase();
    },
    uppercaseCode() {
      this.code = this.code.toUpperCase();
    },
    show_dialog_product() {
      this.dialog_product = true;
    },
    show_dialog_delete() {
      this.dialog_delete = true;
    },
    list() {
      let me = this;
      let unitsArray = [];
      let brandsArray = [];
      let categoriesArray = [];
      let productsArray = [];
      axios
        .get("api/products/list")
        .then(function(response) {
          //me.products = response.data;
          productsArray = response.data;
          productsArray.map(function(x) {
            me.products.push({
              id: x.id,
              code: x.code,
              name: x.name,
              unitName: x.unitName,
              unitId: x.unitId,
              brandName: x.brandName,
              brandId: x.brandId,
              categoryName: x.categoryName,
              categoryId: x.categoryId,
              price: me.insertDecimal(x.price),
              cost: me.insertDecimal(x.cost)
            });
          });
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
    edit_Product(item) {
      this.editedIndex = this.products.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog_product = true;
      this.id = item.id;
      this.code = item.code;
      this.name = item.name;
      this.brandId = item.brandId;
      this.categoryId = item.categoryId;
      this.unitId = item.unitId;
      this.cost = item.cost;
      this.price = item.price;
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
    close_dialog_new_product() {
      this.clear_new_product();
      this.dialog_product = false;
    },
    close_dialog_edit_product() {
      this.dialog_edit_product = false;
    },

    clear_new_product() {
      this.code = "";
      this.name = "";
      this.brandId = "";
      this.categoryId = "";
      this.cost = "";
      this.price = "";
      this.unitId = "";
      this.search_category = "";
      this.search_brand = "";
      this.search_unit = "";
      this.editedIndex = -1;
    }
  }
};
</script>