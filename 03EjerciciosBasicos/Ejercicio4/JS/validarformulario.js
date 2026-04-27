function calcular(){

    let p1 = document.getElementById("p1").value.trim();
    let p2 = document.getElementById("p2").value.trim();
    let p3 = document.getElementById("p3").value.trim();
    let examen = document.getElementById("examen").value.trim();
    let trabajo = document.getElementById("trabajo").value.trim();

    let campos = [p1, p2, p3, examen, trabajo];
    let regex = /^(?:10(?:\.0+)?|[0-9](?:\.[0-9]+)?)$/;

    for(let i = 0; i < campos.length; i++){
        if(campos[i] === ""){
            alert("Todos los campos son obligatorios");
            return false;
        }
        if(!regex.test(campos[i])){
            alert("Solo números entre 0 y 10");
            return false;
        }
    }

    p1 = parseFloat(p1);
    p2 = parseFloat(p2);
    p3 = parseFloat(p3);
    examen = parseFloat(examen);
    trabajo = parseFloat(trabajo);

    let promedioParciales = (p1 + p2 + p3) / 3;

    let calificacionFinal = (promedioParciales * 0.55) +
                            (examen * 0.30) +
                            (trabajo * 0.15);

    document.getElementById("resultado").innerHTML =
        "Promedio parciales: " + promedioParciales.toFixed(2) + "<br>" +
        "Calificación final: " + calificacionFinal.toFixed(2);

    return false;
}