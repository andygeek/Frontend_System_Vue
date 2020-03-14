<template>
  <v-layout align-start>
    <v-flex>
      <v-data-table
        :headers="headers"
        :items="brands"
        :search="search"
        sort-by="calories"
        class="elevation-1"
      >
        <template v-slot:top>
          <v-toolbar flat color="white">
            <v-toolbar-title>Marcas</v-toolbar-title>
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
            <v-btn color="blue" dark class="mb-2" @click="show_dialog_brand()">Nuevo</v-btn>
            <v-dialog v-model="dialog_brand" max-width="500px">
              <v-card>
                <v-card-title>
                  <span class="headline">{{ formTitle }}</span>
                </v-card-title>

                <v-card-text>
                  <v-container>
                    <v-row>
                      <v-col cols="12" sm="6" md="12">
                        <v-text-field v-model="name" label="Nombre" @keyup="uppercaseName"></v-text-field>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card-text>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" text @click="close_dialog_new_brand()">Cancelar</v-btn>
                  <v-btn color="blue darken-1" text @click="save_dialog_new_brand()">Guardar</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
            <v-dialog v-model="dialog_delete" max-width="290">
              <v-card>
                <v-card-title class="headline">Advertencia!!</v-card-title>
                <v-card-text>Está seguro que desea eliminar esta marca. Solo será posible eliminar la marca si ningún producto está usando esta marca.</v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="red" text @click="agree_dialog_delete()">ACEPTAR</v-btn>
                  <v-btn color="red" text @click="cancel_dialog_delete()">CANCELAR</v-btn>
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
            @click="edit_Brand(item)"
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
            @click="show_dialog_delete(item)"
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
export default {
  data() {
    return {
      brands: [],
      dialog_brand: false,
      dialog_delete: false,
      headers: [
        { text: "Id", value: "id", sortable: true, width: 100 },
        { text: "Nombre", value: "name", sortable: true },
        { text: "Opciones", value: "action", sortable: false, width: 120 }
      ],
      search: "",
      editedIndex: -1,

      id: "",
      name: "",
      //delete
      item_delete: []
    };
  },
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Nueva Marca" : "Editar Marca";
    }
  },

  watch: {
    dialog_brand(val) {
      !val && this.clear_new_brand();
    }
  },

  created() {
    this.list();
  },
  methods: {
    cancel_dialog_delete() {
      this.item_delete = [];
      this.dialog_delete = false;
    },
    agree_dialog_delete() {
      this.delete_brand(this.item_delete.id);
      this.item_delete = [];
      this.dialog_delete = false;
    },
    delete_brand(id) {
      let me = this;
      axios
        .delete("api/brands/delete/" + id)
        .then(function(response) {
          me.brands = [];
          me.list();
        })
        .catch(function(error) {
          console.log(error);
        });
    },
    show_dialog_delete(item) {
      this.dialog_delete = true;
      this.item_delete = item;
    },
    show_dialog_brand() {
      this.dialog_brand = true;
      console.log(this.editedIndex);
    },
    edit_Brand(item) {
      this.editedIndex = this.brands.indexOf(item);
      this.dialog_brand = true;
      this.id = item.id;
      this.name = item.name;
    },
    uppercaseName() {
      this.name = this.name.toUpperCase();
    },
    list() {
      let me = this;
      let brandsArray = [];
      axios
        .get("api/brands/list")
        .then(function(response) {
          brandsArray = response.data;
          brandsArray.map(function(x) {
            me.brands.push({
              id: x.id,
              name: x.name
            });
          });
          console.log("AQUI Y AHORA");
        })
        .catch(function(error) {
          console.log(error);
        });
    },
    editItem(item) {
      this.editedIndex = this.desserts.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },
    close() {
      this.dialog = false;
    },
    clean() {
      this.id = "";
      this.name = "";
    },
    save_dialog_new_brand() {
      let me = this;
      if (me.editedIndex == -1) {
        axios
          .post("api/brands/create", {
            name: me.name
          })
          .then(function(response) {
            me.clear_new_brand();
            me.brands = [];
            me.dialog_brand = false;
            me.list();
          })
          .catch(function(error) {
            console.log(error);
          });
      } else {
        axios
          .put("api/brands/update", {
            id: me.id,
            name: me.name
          })
          .then(function(response) {
            me.clear_new_brand();
            me.brands = [];
            me.dialog_brand = false;
            me.list();
          })
          .catch(function(error) {
            console.log(error);
          });
      }
    },
    close_dialog_new_brand() {
      this.clear_new_brand();
      this.dialog_brand = false;
    },
    clear_new_brand() {
      this.id = "";
      this.name = "";
      this.editedIndex = -1;
    }
  }
};
</script>