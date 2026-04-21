function validarn(e){
    var teclado = (document.all)?e.keyCode:e.which;
    if (teclado == 8) return true;
    //Creo mi expresion regular
    var patron = /[0-9\d .]/;

    var codigo = String.fromCharCode(teclado);
    return patron.test(codigo);
}

function interes(){
    var valor = document.getElementById('cantidad').value;
    var interes = parseFloat(valor);
    //10% anual
    var subtotal = interes * .10;
    var total = subtotal + interes;
    document.getElementById('sueldo1').value = "$" + total;
}

function borrar() {
    document.getElementById("formularioejer1").reset();
    document.getElementById("cantidad").focus();
}