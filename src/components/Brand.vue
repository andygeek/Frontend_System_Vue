<template>
    <v-layout align-start="">
        <v-flex>
            <v-data-table
            :headers="headers"
            :items="categories"
            :search="search"
            sort-by="calories"
            class="elevation-1"
            >
            <template v-slot:top>
                <v-toolbar flat color="white">
                <v-toolbar-title>Marcas</v-toolbar-title>
                <v-divider
                    class="mx-3"
                    inset
                    vertical
                ></v-divider>
                <v-spacer></v-spacer>
                <v-text-field class="text-xs-center" v-model="search" append-icon="search" label="Búsqueda" single-line hide-details></v-text-field>
                <v-spacer></v-spacer>
                <v-dialog v-model="dialog" max-width="500px">
                    <template v-slot:activator="{ on }">
                    <v-btn color="primary" dark class="mb-2" v-on="on">Nuevo</v-btn>
                    </template>
                    <v-card>
                    <v-card-title>
                        <span class="headline">{{ formTitle }}</span>
                    </v-card-title>
        
                    <v-card-text>
                        <v-container>
                        <v-row>
                            <v-col cols="12" sm="6" md="12">
                            <v-text-field v-model="name" label="Nombre"></v-text-field>
                            </v-col>                    
                        </v-row>
                        </v-container>
                    </v-card-text>
        
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="blue darken-1" text @click="close">Cancelar</v-btn>
                        <v-btn color="blue darken-1" text @click="save">Guardar</v-btn>
                    </v-card-actions>
                    </v-card>
                </v-dialog>
                </v-toolbar>
            </template>
            <template v-slot:item.action="{ item }">
                <v-icon
                small
                class="mr-2"
                @click="editItem(item)"
                >
                edit
                </v-icon>
                <v-icon
                small
                @click="deleteItem(item)"
                >
                delete
                </v-icon>
            </template>
            <template v-slot:no-data>
                <v-btn color="primary" @click="initialize">Resetear</v-btn>
            </template>
            </v-data-table>
        </v-flex>
    </v-layout>
</template>
<script>
import axios from 'axios'
export default {
    data(){
        return{
            categories:[],
            dialog: false,
            headers: [
            { text: 'Opciones', value: 'action', sortable: false, width: 100 },
            { text: 'Id', value: 'id', sortable: true, width: 100 },
            { text: 'Nombre', value: 'name', sortable: true },          
            ],
            search: '',
            editedIndex: -1,
            editedItem: {
                name: '',
                calories: 0,
                fat: 0,
                carbs: 0,
                protein: 0,
            },
            defaultItem: {
                name: '',
                calories: 0,
                fat: 0,
                carbs: 0,
                protein: 0,
            },
            id: '',
            name: '',
        }
    },
    computed: {
    formTitle () {
      return this.editedIndex === -1 ? 'Nueva Marca' : 'Editar Marca'
    },
    },

    watch: {
        dialog (val) {
        val || this.close()
        },
    },

    created () {
        this.list();
    },
    methods:{
        list(){
            let me=this;
            axios.get('api/brands/list').then(function(response){
                me.categories = response.data;
            }).catch(function(error){
                console.log(error);
            });
        },
        editItem (item) {
            this.editedIndex = this.desserts.indexOf(item)
            this.editedItem = Object.assign({}, item)
            this.dialog = true
        },
        deleteItem (item) {
            const index = this.desserts.indexOf(item)
            confirm('Are you sure you want to delete this item?') && this.desserts.splice(index, 1)
        },
        close () {
            this.dialog = false
        },
        clean(){
            this.id="";
            this.name="";
        },
        save() {
            if (this.editedIndex > -1) {
                //Edit
            } else {
                //Save
                let me=this;
                axios.post('api/brands/create',{
                    'name':me.name
                }).then(function(response){
                    me.close();
                    me.list();
                    me.clean();
                }).categories(function(error){
                    console.log(error);
                });
            }
            this.close()
        },
    }
}
</script>