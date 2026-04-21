function calcular(){

    let hombres = document.getElementById("hombres").value.trim();
    let mujeres = document.getElementById("mujeres").value.trim();

    let regex = /^[0-9]+$/;

    if(hombres === "" || mujeres === ""){
        alert("Todos los campos son obligatorios");
        return false;
    }

    if(!regex.test(hombres) || !regex.test(mujeres)){
        alert("Solo se permiten números enteros positivos");
        return false;
    }

    hombres = parseInt(hombres);
    mujeres = parseInt(mujeres);

    if(hombres < 0 || mujeres < 0){
        alert("No se permiten valores negativos");
        return false;
    }

    let total = hombres + mujeres;

    if(total === 0){
        alert("El total no puede ser cero");
        return false;
    }

    let porcentajeHombres = (hombres / total) * 100;
    let porcentajeMujeres = (mujeres / total) * 100;

    document.getElementById("resultado").innerHTML =
        "Hombres: " + porcentajeHombres.toFixed(2) + "%<br>" +
        "Mujeres: " + porcentajeMujeres.toFixed(2) + "%";

    return false;
}