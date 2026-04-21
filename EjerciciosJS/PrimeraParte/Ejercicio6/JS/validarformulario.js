function calcular(){

    let anio = document.getElementById("anio").value.trim();
    let regex = /^[0-9]{4}$/;

    if(anio === ""){
        alert("El campo es obligatorio");
        return false;
    }

    if(!regex.test(anio)){
        alert("Ingresa un año válido de 4 dígitos");
        return false;
    }

    anio = parseInt(anio);

    let actual = new Date().getFullYear();

    if(anio > actual){
        alert("El año no puede ser mayor al actual");
        return false;
    }

    if(anio < 1900){
        alert("El año no es válido");
        return false;
    }

    let edad = actual - anio;

    document.getElementById("resultado").innerHTML =
        "Edad: " + edad + " años";

    return false;
}