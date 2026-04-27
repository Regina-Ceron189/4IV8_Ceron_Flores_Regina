function problema1(){
    var texto = document.querySelector("#p1-input").value;
    var palabras = texto.split(" ");
    palabras = palabras.reverse();
    var resultado = palabras.join(" ");
    document.querySelector("#p1-output").textContent = resultado;
}


function problema2(){
    //Primero necesito obteneer todos los valores  de la tabla
    var p2x1 = Number(document.querySelector("#p2-x1").value);
    var p2x2 = Number(document.querySelector("#p2-x2").value);
    var p2x3 = Number(document.querySelector("#p2-x3").value);
    var p2x4 = Number(document.querySelector("#p2-x4").value);
    var p2x5 = Number(document.querySelector("#p2-x5").value);
    var p2y1 = Number(document.querySelector("#p2-y1").value);
    var p2y2 = Number(document.querySelector("#p2-y2").value);
    var p2y3 = Number(document.querySelector("#p2-y3").value);
    var p2y4 = Number(document.querySelector("#p2-y4").value);
    var p2y5 = Number(document.querySelector("#p2-y5").value);

    //Creamos los vectores
    var v1 = [p2x1, p2x2, p2x3, p2x4, p2x5];
    var v2 = [p2y1, p2y2, p2y3, p2y4, p2y5];

    //primero vamos a ordenar los elementos para permutarlos
    v1 = v1.sort(function(a,b){return b-a});
    v2 = v2.sort(function(a,b){return a-b});

    //para hacer la permutacion
    v2 = v2.reverse();

    //para mulltiplicar necesitamos un for
    var p2_producto = 0;

    for(var i=0; i< v1.length; i++) {
        p2_producto += v1[i] * v2[i];
    }

    document.querySelector("#p2-output").textContent = p2_producto;
}


function problema3(){
var texto = document.querySelector("#p3-input").value;
    var palabras = texto.split(",");

    var maxPalabra = "";
    var maxUnicos = 0;

    for(var i = 0; i < palabras.length; i++){
        var letras = new Set(palabras[i]);
        var cantidad = letras.size;

        if(cantidad > maxUnicos){
            maxUnicos = cantidad;
            maxPalabra = palabras[i];
        }
    }

    document.querySelector("#p3-output").textContent = maxPalabra + " " + maxUnicos;
}