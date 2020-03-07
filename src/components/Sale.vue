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
            <v-btn color="blue" dark class="mb-2" @click="show_dialog_product()">BUSCAR POR NOMBRE</v-btn>
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
      sale_list: [],
      total: 0,
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
          console.log('list_unit_selection');
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
      this.compute_total();
    },

    search_barcode(barcode) {
      let me = this;
      let find_product = []; 
      axios.get("api/products/Search_code/" + barcode)
          .then(function(response) {

            find_product = response.data[0];
            let find_units_products = [];
            
            let item_repeat_product = me.sale_list.find(element => element.id === find_product.id);
            
            if(item_repeat_product == null){

              axios.get("api/product_unit/getproductid/" + find_product.id)
              .then(function(response) {
                find_units_products = response.data[0];
                me.sale_list.push({
                  
                  id: find_product.id,
                  code: find_product.code,
                  name: find_product.name + ' ' + find_product.brandName,
                  unitId: find_units_products.unitId,
                  unitName: find_units_products.unitName,
                  amount: 1,
                  unit_Price: find_units_products.price,
                  total_Price: find_units_products.price

                })
                me.compute_total();
              })
              .catch(function(error) {
                console.log(error);
              });
            }
            else{
              let index_in_array = me.sale_list.indexOf(item_repeat_product);
              me.sale_list[index_in_array].amount++;
              me.compute_total_price(index_in_array)
            }
        })
        .catch(function(error) {
          console.log(error);
        });
        me.search_code = '';
        
    },
    compute_total(){
      let i;
      this.total = 0;
      for (i = 0; i < this.sale_list.length; i++) {
        this.total = this.total + this.sale_list[i].total_Price;
      } 
      //console.log('LA SUMA TOTAL ES: ' + this.total);
    }

  }
};
</script>