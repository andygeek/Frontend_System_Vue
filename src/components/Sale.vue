<template>
  <v-layout align-start>
    <v-flex>
      <v-data-table :headers="headers_products" :items="sale_list" dense :disable-pagination="false"
                  hide-default-footer>
        <template v-slot:top>
          <v-toolbar flat color="white">
            <v-toolbar-title>Ventas</v-toolbar-title>
            <v-divider class="mx-3" inset vertical></v-divider>
            <v-spacer></v-spacer>
            <v-text-field
              class="text-xs-center"
              v-model="search_code"
              append-icon="style"
              label="Código de producto"
              single-line
              hide-details
              @keydown.enter="search_barcode(search_code)"
            ></v-text-field>
            <v-spacer></v-spacer>
            <v-btn color="blue" dark class="mb-2" @click="show_dialog_product()">NUEVO</v-btn>
          </v-toolbar>
        </template>
        <template v-slot:item.unit_Price="edit">
          <v-edit-dialog @close="compute_total_price(sale_list.indexOf(edit.item))">
            <div>{{ edit.item.unit_Price }}</div>
            <template v-slot:input>
              <v-text-field v-model="edit.item.unit_Price" label="P. Unidad" single-line autofocus></v-text-field>
            </template>
          </v-edit-dialog>
        </template>
        <template v-slot:item.amount="edit">
          <v-edit-dialog @close="compute_total_price(sale_list.indexOf(edit.item))">
            <div>{{ edit.item.amount }}</div>
            <template v-slot:input>
              <v-text-field v-model="edit.item.amount" label="Cantidad" single-line autofocus></v-text-field>
            </template>
          </v-edit-dialog>
        </template>
        <template v-slot:item.unitName="edit">
          <v-edit-dialog
            @open="list_unit_selection(edit.item)"
            large
            @close="cancel_dialog_unit()"
            save-text="Aceptar"
            @save="select_unit(edit.item.id)"
            cancel-text="Cancelar"
            @cancel="cancel_dialog_unit()"
            autofocus="false"
          >
            <div>{{ edit.item.unitName }}</div>
            <template v-slot:input>
              <v-card elevation="0">
                <v-autocomplete v-model="unitId" label="Unidad" :items="unit_selection"></v-autocomplete>
              </v-card>
            </template>
          </v-edit-dialog>
        </template>
        <template v-slot:item.action="{ item }">
          
          <v-icon small class="mr-2" @click="">remove_red_eye</v-icon>

            <v-icon small class="mr-2" @click="">delete</v-icon>
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
      unitId: "",
      unit_selection: [],
      search_code: "",
      search_product: [],
      sale_list: [
        {
          id: 1,
          code: "111111111111",
          name: "Lapicero",
          unitId: 1,
          unitName: "unidad",
          amount: 1,
          unit_Price: "5.10",
          total_Price: "10.50"
        },
        {
          id: 1002,
          code: "111111111111",
          name: "Colores pastel x 10 Faber Castell",
          unitId: 1002,
          unitName: "unidad",
          amount: 1,
          unit_Price: "66.9",
          total_Price: "10.50"
        },
        {
          id: 1003,
          code: "111111111111",
          name: "Colores pastel x 10 Faber Castell",
          unitId: 1002,
          unitName: "Unidad",
          amount: 1,
          unit_Price: "66.9",
          total_Price: "10.50"
        },
        {
          id: 1004,
          code: "111111111111",
          name: "Colores pastel x 10 Faber Castell",
          unitId: 1002,
          unitName: "Unidad",
          amount: 1,
          unit_Price: "66.9",
          total_Price: "10.50"
        },
        {
          id: 1005,
          code: "111111111111",
          name: "Colores pastel x 10 Faber Castell",
          unitId: 1002,
          unitName: "Unidad",
          amount: 1,
          unit_Price: "66.9",
          total_Price: "10.50"
        }
      ],
      headers_products: [
        { text: "Nombre", value: "name", sortable: false, width: 200 },
        { text: "Unidad", value: "unitName", sortable: false, width: 100 },
        { text: "Cantidad", value: "amount", sortable: false, width: 50 },
        { text: "P. Unidad", value: "unit_Price", sortable: false, width: 50 },
        { text: "P. Total", value: "total_Price", sortable: false, width: 50 },
        { text: "Opciones", value: "action", sortable: false, width: 50 }
      ]
    };
  },
  methods: {
    list_unit_selection(item) {
      this.dialog = true;
      let me = this;
      let unitsArray = [];
      this.unitId = item.unitId;
      axios
        .get("api/product_unit/getproductid/" + item.id)
        .then(function(response) {
          unitsArray = response.data;
          unitsArray.map(function(x) {
            me.unit_selection.push({
              text: x.unitName,
              value: x.unitId,
              unitPrice: x.price
            });
          });
          console.log(unitsArray);
        })
        .catch(function(error) {
          console.log(error);
        });
      this.search_unitName = item.unitName;
    },
    select_unit(id) {
      let resut = this.sale_list.find(sale => sale.id === id);
      let id_array = this.sale_list.indexOf(resut);
      this.sale_list[id_array].unitId = this.unitId;
      this.sale_list[id_array].unitName = this.change_unitName(this.unitId);
      this.sale_list[id_array].unit_Price = this.change_unitPrice(this.unitId);
      this.compute_total_price(id_array);

      this.clear_unit_select();
    },
    change_unitName(id) {
      let rr = this.unit_selection.find(unit => unit.value === id);
      return rr.text;
    },
    change_unitPrice(id) {
      let rr = this.unit_selection.find(unit => unit.value === id);
      return rr.unitPrice;
    },
    cancel_dialog_unit() {
      this.clear_unit_select();
    },
    clear_unit_select() {
      this.unitId = "";
      this.unit_selection = [];
    },
    compute_total_price(id) {
      let result;
      result = this.sale_list[id].unit_Price * this.sale_list[id].amount;
      this.sale_list[id].total_Price = result;
    },
    search_barcode(code) {
      let me = this;
      let product = [];

      axios
        .get("api/products/Search_code/" + code)
        .then(function(response) {
          product = response.data[0];
          let item_repeat_product = me.sale_list.find(
            item => item.id === product.id
          );

          if (item_repeat_product == null) {
            me.sale_list.push({
              id: product.id,
              name: product.name,
              unitId: "",
              unitName: "",
              amount: 1,
              unit_Price: "",
              total_Price: ""
            });
          } else {
            let id_item_repeat = me.sale_list.indexOf(item_repeat_product);
            me.sale_list[id_item_repeat].amount++;
          }
          me.search_code = "";
        })
        .catch(function(error) {
          console.log(error);
        });
    }
  }
};
</script>