function validar(formulario){

let valor = formulario.capital.value.trim();

if(valor === ""){
    alert("El capital es obligatorio");
    formulario.capital.focus();
    return false;
}

let regex = /^[0-9]+(\.[0-9]{1,2})?$/;

if(!regex.test(valor)){
    alert("Solo números válidos (sin letras ni símbolos)");
    formulario.capital.value = "";
    formulario.capital.focus();
    return false;
}

let capital = Number(valor);

if(isNaN(capital)){
    alert("Valor inválido");
    formulario.capital.value = "";
    formulario.capital.focus();
    return false;
}

if(capital <= 0){
    alert("El capital debe ser mayor a 0");
    formulario.capital.value = "";
    formulario.capital.focus();
    return false;
}

let interes = capital * 0.02;

document.getElementById("resultado").innerHTML =
"El banco te paga (2%): $" + interes.toFixed(2);

return false;
}