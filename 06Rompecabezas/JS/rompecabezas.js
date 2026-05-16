var instrucciones = [
    "Utiliza las flechas de navegaci[on para mover las piezas", "Para ordenar las spiezas guiate por la imagen Objetivo"
];

//Para guardar los movimientos necesitamos un arreglo

var movimientos = [];

//Tengo que saber cuales son las posiciones del rompecabezas original
var rompe =[
    [1,2,3],
    [4,5,6],
    [7,8,9]
];

//Necesito otra variable para saber que es el orden del rompecabezas es el correcto
var rompeCorrecta =[
    [1,2,3],
    [4,5,6],
    [7,8,9]
];

//Necesito conocer la posici[on de la pieza vacia

var filaVacia = 2;
var columnaVacia = 2;

//Necesito una funci[on que se encargue de mostrar la lista de instrucci[ones]]
function mostrarInstrucciones(instrucciones) {
    for (var i = 0; i < instrucciones.length; i++) {
        mostrarInstruccionesLista(instrucciones[i], "lista-instrucciones");
    }
}

function mostrarInstruccionesLista(instruccion, id_lista) {
    var ul = document.getElementById(id_lista);
    var li = document.createElement("li");
    li.textContent = instruccion;
    ul.appendChild(li);
}