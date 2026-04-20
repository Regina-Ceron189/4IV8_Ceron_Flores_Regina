function validar(formulario){

    //Vamos a crear una funcion para validar un número mínimo de caracteres en el nombre
    if(formulario.nombre.value.trim() == ""){
        alert("El nombre no puede estar vacio");
        formulario.nombre.focus();
        return false;
    }

    if(formulario.nombre.value.trim().length < 3 || formulario.nombre.value.trim().length > 30){
        alert("El nombre debe tener entre 3 y 30 caracteres");
        formulario.nombre.focus();
        return false;
    }

    if(formulario.nombre.value.startsWith(" ") || formulario.nombre.value.endsWith(" ")){
        alert("El nombre no puede iniciar o terminar con espacios");
        formulario.nombre.focus();
        return false;
    }

    var abcOK = "QWERTYUIOPASDFGHJKLÑZXCVBNM" + "qwertyuiopasdfghjklñzxcvbnm ";

    var checkString = formulario.nombre.value;

    var allValid = true;

    //tenemos que ir comparando y recorriendo la cadena caracter por caracter
    for(var i = 0; i < checkString.length; i++){
        //Necesito la cadena pasarla a caracter
        var caracteres = checkString.charAt(i);
        for(var j = 0; j < abcOK.length; j++){
        if (caracteres == abcOK.charAt(j)){
            break;
            }
        }

        if(j == abcOK.length){
            allValid = false;
            break;
        }
        }

            if(!allValid){
                alert("Por favor escriba unicamente letras en el campo nombre");
                formulario.nombre.focus();
                return false;
            }

            if(checkString.indexOf("  ") != -1){
                alert("El nombre no puede contener espacios dobles");
                formulario.nombre.focus();
                return false;
            }

            if(formulario.edad.value.trim() == ""){
                alert("La edad es obligatoria");
                formulario.edad.focus();
                return false;
            }
    
    
            var abcOK = "1234567890";

            var checkString = formulario.edad.value;

            var allValid = true;

    //tenemos que ir comparando y recorriendo la cadena caracter por caracter
    for(var i = 0; i < checkString.length; i++){
        //Necesito la cadena pasarla a caracter
        var caracteres = checkString.charAt(i);
        for(var j = 0; j < abcOK.length; j++){
        if (caracteres == abcOK.charAt(j)){
            break;
            }
        }

        if(j == abcOK.length){
            allValid = false;
            break;
        }
        }

            if(!allValid){
                alert("Por favor escriba unicamente numeros en el campo edad");
                formulario.edad.focus();
                return false;
            }

             var edad = parseInt(edadValor);

                if(edad < 1 || edad > 120){
                alert("Edad no valida");
                formulario.edad.focus();
                return false;
            }

            //algo.algo@algo.algo       MIGJ861019

            var correoelectronico = /^[^@\s]+[^@\.\s]+(\.[^@\.\s]+)+$/;

            var txt = formulario.email.value;

            if(txt == ""){
                alert("El correo es obligatorio");
                formulario.email.focus();
                return false;
            }

            if(!correoelectronico.test(txt)){
                alert("Email " + correoelectronico.test(txt)?" ":" no " +"valido");
                formulario.email.focus();
                return false;
         } else {
                alert("Email válido");
            }

            if(txt.indexOf("..") != -1){
                alert("El correo no puede contener puntos consecutivos");
                formulario.email.focus();
                return false;
            }

            if(txt.startsWith(".") || txt.endsWith(".")){
                alert("El correo no puede iniciar o terminar con punto");
                formulario.email.focus();
                return false;
            }

            if(formulario.comentario.value.trim() == ""){
                alert("El comentario es obligatorio");
                formulario.comentario.focus();
                return false;
            }

            if(formulario.comentario.value.trim().length < 10){
                alert("El comentario debe tener minimo 10 caracteres");
                formulario.comentario.focus();
                return false;
            }

            if(formulario.comentario.value.trim().length > 200){
                alert("El comentario es demasiado largo");
                formulario.comentario.focus();
                return false;
            }

        return true;
}