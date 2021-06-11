sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/UploadCollectionParameter"
], function (Controller, MessageBox, UploadCollectionParameter) {
    "use strict";
    //se crea modelo principal, parte desde el step 0 y se invalida el first step 
    function onBeforeRendering() {
        this._wizard = this.byId("wizard");

        this._model = new sap.ui.model.json.JSONModel({});
        this.getView().setModel(this._model);
      
        var oFirstStep = this._wizard.getSteps()[0];
        this._wizard.discardProgress(oFirstStep);   
        this._wizard.goToStep(oFirstStep);     
        oFirstStep.setValidated(false);
        
    }

    //Funcion que se utiliza cada vez que se pulsa los tipo de empleados
    function toStepButton(oEvent) {
        //Step 1
        var datosEmployeeStep = this.byId("datosEmployeeStep");
        //Step 2
        var employeeSteptype = this.byId("employeeSteptype");

        //Se obtiene el tipo seleccionado con el "CustomData"
        var button = oEvent.getSource();
        var typeEmployee = button.data("typeEmployee");

        //Dependiendo del tipo, el salario bruto por defecto 
        var Salary, Type;
        switch (typeEmployee) {
            case "interno":
                Salary = 24000;
                Type = "0";
                break;
            case "autonomo":
                Salary = 400;
                Type = "1";
                break;
            case "gerente":
                Salary = 70000;
                Type = "2";
                break;
            default:
                break;
        }

        //Al pulsar sobre el tipo, se sobreescribe el modelo registrando el tipo  y el valor del salario por defecto
        this._model.setData({
            _type: typeEmployee,
            Type: Type,
            _Salary: Salary
        });

        //Se comprueba si se está en el paso 1, ya que se debe usar la función "nextStep" para activar el paso 2.
        if (this._wizard.getCurrentStep() === employeeSteptype.getId()) {
            this._wizard.nextStep();
        } else {
           
            this._wizard.goToStep(datosEmployeeStep);
        }
    }

    //Función para validar el dni
    function validateDNI(oEvent) {
        //Se comprueba si es dni o cif. En caso de dni, se comprueba su valor. Para ello se comprueba que el tipo no sea "autonomo" se mostrar CIF
        if (this._model.getProperty("_type") !== "autonomo") {
            var dni = oEvent.getParameter("value");
            if (Fn.validaRut(dni)) {
                //alert("El rut ingresado es válido :D");
                this._model.setProperty("/_RutState", "None");
                this.employeeValidationData();
            } else {
                //alert("El Rut no es válido :'( ");
                this._model.setProperty("/_RutState", "Error");
            }

        }
    }


    var Fn = {
        // Valida el rut con su cadena completa "XXXXXXXX-X"
        validaRut: function (rutCompleto) {
            //        rutCompleto = rutCompleto.replace("‐", "-");
            //        if (!/^[0-9]+[-|‐]{1}[0-9kK]{1}$/.test(rutCompleto))
            //            return false;
            //        var tmp = rutCompleto.split('-');
            //        var digv = tmp[1];
            //        var rut = tmp[0];
            //       if (digv == 'K') digv = 'k';

            //        return (Fn.dv(rut) == digv);
            //    },
            //    dv: function (T) {
            //        var M = 0, S = 1;
            //        for (; T; T = Math.floor(T / 10))
            //            S = (S + T % 10 * (9 - M++ % 6)) % 11;
            //        return S ? S - 1 : 'k';
            //    }
            var respuesta = false;
            var number;
            var letter;
            var letterList;
            var regularExp = /^\d{8}[a-zA-Z]$/;

            if (regularExp.test(rutCompleto) === true) {
                //Número
                number = rutCompleto.substr(0, rutCompleto.length - 1);
                //Letra
                letter = rutCompleto.substr(rutCompleto.length - 1, 1);
                number = number % 23;
                letterList = "TRWAGMYFPDXBNJZSQVHLCKET";
                letterList = letterList.substring(number, number + 1);
                if (letterList !== letter.toUpperCase()) {
                    respuesta = false;
                } else {
                    respuesta = true;
                }
            } else {
                respuesta = false;
            }



        }
    }

    //Funcion que valida y tambien cuando se vuelve atras

    function employeeValidationData(oEvent, callback) {
        var object = this._model.getData();
        var isValid = true;
     
        if (!object.FirstName) {
            object._FirstNameState = "Error";
            isValid = false;
        } else {
            object._FirstNameState = "None";
        }

        if (!object.LastName) {
            object._LastNameState = "Error";
            isValid = false;
        } else {
            object._LastNameState = "None";
        }

       
        if (!object.CreationDate) {
            object._CreationDateState = "Error";
            isValid = false;
        } else {
            object._CreationDateState = "None";
        }

        if (!object.Dni) {
            object._RutState = "Error";
            isValid = false;
        } else {
            object._RutState = "None";
        }

        if (isValid) {
            this._wizard.validateStep(this.byId("datosEmployeeStep"));
        } else {
            this._wizard.invalidateStep(this.byId("datosEmployeeStep"));
        }
        //Si vuelven atras
        if (callback) {
            callback(isValid);
        }
    }

    //verifica los errores enpulsar wizard
    function wizardCompletedHandler(oEvent) {
        //para los error
        this.employeeValidationData(oEvent, function (isValid) {
            if (isValid) {
             
                var wizardNavContainer = this.byId("wizardNavContainer");
                wizardNavContainer.to(this.byId("RevisionPage"));
               
                var uploadCollection = this.byId("UploadCollection");
                var files = uploadCollection.getItems();
                var numFiles = uploadCollection.getItems().length;
                this._model.setProperty("/_numFiles", numFiles);
                if (numFiles > 0) {
                    var arrayFiles = [];
                    for (var i in files) {
                        arrayFiles.push({ DocName: files[i].getFileName(), MimeType: files[i].getMimeType() });
                    }
                    this._model.setProperty("/_files", arrayFiles);
                } else {
                    this._model.setProperty("/_files", []);
                }
            } else {
                this._wizard.goToStep(this.byId("datosEmployeeStep"));
            }
        }.bind(this));
    }

    //funcion generica para editar un step
    function _editStep(step) {
        var wizardNavContainer = this.byId("wizardNavContainer");
        var fnAfterNavigate = function () {
            this._wizard.goToStep(this.byId(step));
         
            wizardNavContainer.detachAfterNavigate(fnAfterNavigate);
        }.bind(this);

        wizardNavContainer.attachAfterNavigate(fnAfterNavigate);
        wizardNavContainer.back();
    }

    //al presionar edita Tipo de empleado
    function editStepOne() {
        _editStep.bind(this)("employeeSteptype");
    }

    //al presionar edita Datos de emplead
    function editStepTwo() {
        _editStep.bind(this)("datosEmployeeStep");
    }

    //al presionar editar Información adicional
    function editStepThree() {
        _editStep.bind(this)("OptionalInfoStep");
    }

    //guarda el nuevo empleado
    function onSaveEmployee() {
        var json = this.getView().getModel().getData();
        var body = {};
        //Se obtienen aquellos campos que no empicen por "_", ya que son los que vamos a enviar
        for (var i in json) {
            if (i.indexOf("_") !== 0) {
                body[i] = json[i];
            }
        }
        body.SapId = this.getOwnerComponent().SapId;
        body.UserToSalary = [{
            Ammount: parseFloat(json._Salary).toString(),
            Comments: json.Comments,
            Waers: "EUR"
        }];
        this.getView().setBusy(true);
        this.getView().getModel("odataModel").create("/Users", body, {
            success: function (data) {
                this.getView().setBusy(false);
            
                this.newUser = data.EmployeeId;
                sap.m.MessageBox.information(this.oView.getModel("i18n").getResourceBundle().getText("empleadoNuevo") + ": " + this.newUser, {
                    onClose: function () {
                        var wizardNavContainer = this.byId("wizardNavContainer");
                        wizardNavContainer.back();
                        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                        oRouter.navTo("menu", {}, true);
                    }.bind(this)
                });
                this.onStartUpload();
            }.bind(this),
            error: function () {
                this.getView().setBusy(false);
            }.bind(this)
        });
    }

    //cancelar la creación
    function onCancel() {
      
        sap.m.MessageBox.confirm(this.oView.getModel("i18n").getResourceBundle().getText("preguntaCancelar"), {
            onClose: function (oAction) {
                if (oAction === "OK") {
                    var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                    oRouter.navTo("menu", {}, true);
                }
            }.bind(this)
        });

    }

    //genera cabecera para el envio al servicio odata con autentificacio para sap 
    function onChange(oEvent) {
        var oUploadCollection = oEvent.getSource();
        var oCustomerHeaderToken = new sap.m.UploadCollectionParameter({
            name: "x-csrf-token",
            value: this.getView().getModel("odataModel").getSecurityToken()
        });
        oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
    }

    //se suben los parametros slug para el servicio odata 
    function onBeforeUploadStart(oEvent) {
        var oCustomerHeaderSlug = new UploadCollectionParameter({
            name: "slug",
            value: this.getOwnerComponent().SapId + ";" + this.newUser + ";" + oEvent.getParameter("fileName")
        });
        oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
    }

    function onStartUpload(ioNum) {
        var that = this;
        var oUploadCollection = that.byId("UploadCollection");
        oUploadCollection.upload();
    }

    //se ingresan todas las funciones del controlador para que sean visibles CreateEmployee
    return Controller.extend("Empleados.RecursoHumano.controller.CreateEmployee", {
        onBeforeRendering: onBeforeRendering,
        toStepButton: toStepButton,
        validateDNI: validateDNI,
        employeeValidationData: employeeValidationData,
        wizardCompletedHandler: wizardCompletedHandler,
        editStepOne: editStepOne,
        editStepTwo: editStepTwo,
        editStepThree: editStepThree,
        onSaveEmployee: onSaveEmployee,
        onCancel: onCancel,
        onChange: onChange,
        onBeforeUploadStart: onBeforeUploadStart,
        onStartUpload: onStartUpload
    });

});