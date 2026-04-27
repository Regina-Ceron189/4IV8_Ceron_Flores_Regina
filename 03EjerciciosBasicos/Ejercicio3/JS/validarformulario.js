function calcular(){

    let total = document.getElementById("total").value.trim();
    let regex = /^[0-9]+(\.[0-9]+)?$/;

    if(total === ""){
        alert("El campo es obligatorio");
        return false;
    }

    if(!regex.test(total)){
        alert("Solo se permiten números positivos");
        return false;
    }

    total = parseFloat(total);

    if(total <= 0){
        alert("El valor debe ser mayor a cero");
        return false;
    }

    let descuento = total * 0.15;
    let totalFinal = total - descuento;

    document.getElementById("resultado").innerHTML =
        "Descuento: $" + descuento.toFixed(2) + "<br>" +
        "Total a pagar: $" + totalFinal.toFixed(2);

    return false;
}