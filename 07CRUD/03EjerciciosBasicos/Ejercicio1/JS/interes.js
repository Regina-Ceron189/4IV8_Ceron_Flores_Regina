function validarn(e){
    var teclado = (document.all)?e.keyCode:e.which;
    if (teclado == 8) return true;
    var patron = /[0-9\d .]/;
    var codigo = String.fromCharCode(teclado);
    return patron.test(codigo);
}

function interes(){
    var valor = document.getElementById('cantidad').value.trim();

    if(valor === ""){
        alert("El capital es obligatorio");
        document.getElementById("cantidad").focus();
        return;
    }

    var regex = /^[0-9]+(\.[0-9]{1,2})?$/;

    if(!regex.test(valor)){
        alert("Solo números válidos (sin letras ni símbolos)");
        document.getElementById("cantidad").value = "";
        document.getElementById("cantidad").focus();
        return;
    }

    var interes = Number(valor);

    if(isNaN(interes)){
        alert("Valor inválido");
        document.getElementById("cantidad").value = "";
        document.getElementById("cantidad").focus();
        return;
    }

    if(interes <= 0){
        alert("El capital debe ser mayor a 0");
        document.getElementById("cantidad").value = "";
        document.getElementById("cantidad").focus();
        return;
    }

    var subtotal = interes * .10;
    var total = subtotal + interes;

    document.getElementById('sueldo1').value = "$" + total.toFixed(2);
}

function borrar() {
    document.getElementById("formularioejer1").reset();
    document.getElementById("cantidad").focus();
}