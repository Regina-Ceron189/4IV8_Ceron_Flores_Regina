function calcular(){

    let sueldo = document.getElementById("sueldo").value.trim();
    let v1 = document.getElementById("venta1").value.trim();
    let v2 = document.getElementById("venta2").value.trim();
    let v3 = document.getElementById("venta3").value.trim();

    let regex = /^[0-9]+(\.[0-9]+)?$/;

    if(sueldo === "" || v1 === "" || v2 === "" || v3 === ""){
        alert("Todos los campos son obligatorios");
        return false;
    }

    if(!regex.test(sueldo) || !regex.test(v1) || !regex.test(v2) || !regex.test(v3)){
        alert("Solo se permiten números positivos");
        return false;
    }

    sueldo = parseFloat(sueldo);
    v1 = parseFloat(v1);
    v2 = parseFloat(v2);
    v3 = parseFloat(v3);

    if(sueldo <= 0 || v1 <= 0 || v2 <= 0 || v3 <= 0){
        alert("Los valores deben ser mayores a cero");
        return false;
    }

    let totalVentas = v1 + v2 + v3;
    let comision = totalVentas * 0.10;
    let total = sueldo + comision;

    document.getElementById("resultado").innerHTML =
        "Comisiones: $" + comision.toFixed(2) + "<br>" +
        "Total a recibir: $" + total.toFixed(2);

    return false;
}