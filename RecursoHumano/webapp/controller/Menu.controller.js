sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    function onInit() {

    }

    function onAfterRendering() {
        // Error en el framework : Al agregar la dirección URL de "Firmar pedidos", el componente GenericTile debería navegar directamente a dicha URL,
        // pero no funciona en la version 1.78. Por tanto, una solución  encontrada es eliminando la propiedad id del componente por jquery
        var genericTileFirmarPedido = this.byId("linkFirmarPedido");
        //Id del dom
        var idGenericTileFirmarPedido = genericTileFirmarPedido.getId();
        //Se vacia el id
        //jQuery("#"+idGenericTileFirmarPedido)[0].id = "";
    }

    //Función al pulsar sobre el Tile "Crear empleado". Hace un routing a la vista "createEmployee"
    function navCreateEmployee() {
        //Se obtiene el conjuntos de routers del programa
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        //Se navega hacia el router "CreateEmployee"
        oRouter.navTo("CreateEmployee", {}, false);
    }

    //Función al pulsar sobre el Tile "Ver empleados". Hace un routing a la vista "showEmployee"
    function navShowEmployee() {
        //Se obtiene el conjuntos de routers del programa
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        //Se navega hacia el router "CreateEmployee"
        oRouter.navTo("ShowEmployee", {}, false);
    }

    //Función al pulsar sobre el Tile "linkFirmarPedido". Hace un href
    function navEmployeeIndex() {
        //URL de sitio publicado en el cloud propio 
        window.location.href = "https://cde00d78trial-dev-logali-approuter.cfapps.us10.hana.ondemand.com/logaligroupEmployees/index.html";
    }

    return Controller.extend("Empleados.RecursoHumano.controller.Menu", {
        onInit: onInit,
        onAfterRendering: onAfterRendering,
        navCreateEmployee: navCreateEmployee,
        navShowEmployee: navShowEmployee,
        navEmployeeIndex: navEmployeeIndex
    });
});