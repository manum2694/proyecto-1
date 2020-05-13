  ////////////// FUNCIONALIDAD DE INICIALIZACIÓN DE COMPONENTES Y MANEJO DE LOCAL STORAGE //////////////
  
  
  /**
   * Permite inicializar componentes de Materialize.
   */
  document.addEventListener('DOMContentLoaded', function() { M.AutoInit(); });


  /**
   * Al cargarse la página, aplica la carga del skin o tema que el usuario haya elegido
   */
  window.onload = function cargarTema () {  
    var dirEstiloGuardado = localStorage.getItem("Tema");
    var estiloActual = document.getElementById("estilo");
    // Si tengo registro guardado del estilo en uso, entonces lo agrego al cargar la página.
    if (dirEstiloGuardado != null) {
      estiloActual.href = dirEstiloGuardado;
    }
    else {
      estiloActual.href = "css/estiloPred.css";
    }
  }

  
  /**
   * Permite registrar en el navegador un nuevo password ingresado para agregarlo al historial de evaluados.
   * @param psw: cadena de caracteres dada como password.
   */
  function actualizarHistorial (psw) {
    var datoUltimoIndex = localStorage.getItem("ultimoIndexUsado");
    var ultimoIndexUsado;
    // Si registré el último index usado para nombrar registros de passwords o vale 5, empiezo en 0
    if (datoUltimoIndex == null) {
      ultimoIndexUsado = 0;
    }
    else {
      ultimoIndexUsado = parseInt(datoUltimoIndex);
      // Si alcancé a ocupar los 5 slots del historial de entradas, comienzo a ocupar desde el primer slot
      if (ultimoIndexUsado == 5) {
        ultimoIndexUsado = 0;
      }
    }
    localStorage.setItem("password" + (ultimoIndexUsado + 1),psw);
    ultimoIndexUsado++;
    localStorage.setItem("ultimoIndexUsado",ultimoIndexUsado);
  }


  /**
   * Construye una colección que contenga un historial con las contraseñas evaluadas recientemente
   * y la agrega a una ventana emergente donde será visualizada.
   */
  function mostrarHistorial () {
    var datoUltimoIndex = localStorage.getItem("ultimoIndexUsado");
    var datoPsw;
    var coleccion;
    var indexActual;
    var quedanRegistrados;    
    document.getElementById("reporteHistorial").innerHTML = "";
    coleccion = "<ul class=\"collection\">";
    if (datoUltimoIndex == null) {
      coleccion += "<li class=\"collection-item fondoCol textoAlCentro\">";
      coleccion += "No se han registrado entradas evaluadas recientemente </li>";      
    }
    else {
      quedanRegistrados = true;
      indexActual = 1;
      while (indexActual <= 5 && quedanRegistrados) {
        datoPsw = localStorage.getItem("password" + indexActual);
        if (datoPsw == null) {
          quedanRegistrados = false;
        }
        else {
          coleccion += "<li class=\"collection-item fondoCol textoAlCentro\">";
          coleccion += datoPsw + "</li>";
          indexActual++;
        }        
      }
    }
    coleccion += "</ul>";
    document.getElementById("reporteHistorial").innerHTML = coleccion;
  }



/////////////////////// FUNCIONALIDAD PARA EVALUACIÓN DE LA CALIDAD DE UN PASSWORD ///////////////////////


/**
 * Procede al análisis del string como password si se detecta que se apretó ENTER en el textbox de entrada.
 * @param evento: evento generado sobre el textbox de entrada.
 */ 
  function aceptarEntrada () {
    var password;
    var reporte;
    var valorFinal;
    var observaciones;
    password = document.getElementById("psw_box").value;
    actualizarHistorial(password);
    reporte = repotarAnalisis(password);
    valorFinal = reporte[0];
    observaciones = reporte[1];
    mostrarReporte(valorFinal,observaciones);
  }


 /*
  * Evalúa la calidad del string ingresado como password.
  * @param psw: cadena de caracteres dada como password.
  */ 
  function repotarAnalisis (psw) {
    var long_psw = psw.length;
    var existencias = obtenerExistencias(psw);
    var ubicaciones;
    var valorBase;
    var valorFinal;
    var observaciones;
    valorBase = obtenerValorBase(long_psw, existencias);
    ubicaciones = capturarApariciones(psw);
    valorFinal = obtenerValorFinal(valorBase, ubicaciones);
    observaciones = obtenerObservaciones(psw, valorFinal, existencias, ubicaciones);
    return [valorFinal, observaciones];
  }
  
  
  /*
  * obtenerExistencias(psw): brinda arreglo que posee las cantidades de dígitos, mayúsculas,
    minúsculas y otros símbolos en la cadena de password, en este mismo orden.
  * @param psw: cadena de caracteres dada como password.
  * @return arreglo de existencias de cada tipo de caracter a analizar.
  */
  function obtenerExistencias (psw) {
    var existencias = [0, 0, 0, 0];
    var codigo;
    for (let i = 0; i < psw.length; i++) {
      codigo = psw.charCodeAt(i);
      // Determino tipo del char i-ésimo de la cadena dada como password e incremento existencias
      if (esDigito(codigo)) {
        existencias[0]++;
      } else if (esMayus(codigo)) {
        existencias[1]++;
      } else if (esMinus(codigo)) {
        existencias[2]++;
      } else {
        existencias[3]++;
      }
    }
    return existencias;
  }
  

  /*
   * Permite determinar si un entero corresponde a un valor UNICODE de un dígito
   * @param codigo: valor entero positivo
   * @return 'true', si el valor numérico corresponde al de un caracter UNICODE tipo digito
   */
  function esDigito(codigo) {
    return codigo > 47 && codigo < 58;
  }
  

  /*
   * Permite determinar si un entero corresponde a un valor UNICODE de una mayúscula
   * @param codigo: valor entero positivo
   * @return 'true', si el valor numérico corresponde al de un caracter UNICODE tipo mayúscula
   */  
  function esMayus(codigo) {
    return codigo > 64 && codigo < 91;
  }
 

  /*
   * Permite determinar si un entero corresponde a un valor UNICODE de una minúscula
   * @param codigo: valor entero positivo
   * @return 'true', si el valor numérico corresponde al de un caracter UNICODE tipo minúscula
   */
  function esMinus(codigo) {
    return codigo > 96 && codigo < 123;
  }


  /*
   * Permite determinar si un entero corresponde a un valor UNICODE de un símbolo
   * @param codigo: valor entero positivo
   * @return 'true', si el valor numérico corresponde al de un caracter UNICODE tipo mayúscula
   */
  function esSimbolo (codigo) {
    return codigo > 32 && !esMayus(codigo) && !esMinus(codigo) && !esDigito(codigo);
  }
  

  /*
   * Retorna un mapeo de caracteres del string dado como password a listas de posiciones donde
     se encuentran cada uno de ellos dentro de dicha cadena
   * @param psw: cadena de caracteres dada como password
   * @return mapeo de caracteres a listas de posiciones de cada uno dentro del string password
   */
  function capturarApariciones (psw) {
    var posicionesPorChar = new Map([]);
    var posiciones;
    var char;
    // Por c/caracter del password, registro en el mapeo un par que lo asocie con un arreglo posiciones
    // de la cadena donde aparece
    for (let i = 0; i < psw.length; i++) {
      char = psw.charAt(i);
      posiciones = posicionesPorChar.get(char);
      // Si el char no se había registrado, almaceno un nuevo par en el mapeo que lo asocie con esta posición
      if (posiciones == undefined) {
        posiciones = [];
        posiciones.push(i);
        posicionesPorChar.set(char, posiciones);
      }
      // El char estaba registrado, almaceno en su arreglo de posiciones dentro del password la nueva ubicación 
      else {
        posiciones.push(i);
        posicionesPorChar.set(char, posiciones);
      }
    }
    return posicionesPorChar;
  }
  

  /*
   * Retorna la nota de valoración tentativa de la estructura de una cadena dada como password
   * @param long_psw: longitud de una cadena de caracteres dada como password
   * @param existencias: arreglo de ocurrencias de cada tipo de caracter en un string como password
   * @return valor numérico de valoración estructural tentativa como password de una cadena dada
   */  
  function obtenerValorBase(long_psw, existencias) {
    var puntajeBase = 3*long_psw;
    var digitos = existencias[0];
    var mayus = existencias[1];
    var minus = existencias[2];
    var simbolos = existencias[3];
    // Si se cumple la longitud mínima para calidad aceptable, sumo puntaje por tipo de símbolo presente
    if (long_psw >= 8) {
      // Según los tipos de caracteres de la cadena password, incremento la nota de valoración base
      if (mayus || minus) {
        puntajeBase += 25;
        if (digitos) {
          puntajeBase += 15;
        }
        if (simbolos) {
          puntajeBase += 20;
        }
        if (mayus && minus) {
          puntajeBase += 20;
        }
        if (digitos > (mayus + minus)) {
          puntajeBase -= 25;
        }  
      } 
      else {
        if (digitos && simbolos) {
          puntajeBase += 20;
        } 
        else puntajeBase += 5;
      }
    }    
    return puntajeBase;
  }
  
  
  /*
   * Retorna la nota de valoración final de la estructura de una cadena dada como password,
     partiendo de una nota base o tentativa.
   * @param valorBase: valor numérico de valoración estructural tentativa como password de una cadena dada
   * @param existencias: arreglo de ocurrencias de cada tipo de caracter en un string como password
   * @return valor numérico de valoración estructural final como password de una cadena dada
   */  
  function obtenerValorFinal (valorBase, ocurrenciasPorChar) {
    var valorFinal = valorBase;
    var valorPorDescontar;
    // Por cada arreglo de posiciones asociado a cada caracter del password, penalizo repeticiones
    for (posicionesChar of ocurrenciasPorChar.values()) {
      if (posicionesChar.length > 1) {
        valorPorDescontar = evaluarRepeticiones(posicionesChar);
        valorFinal -= valorPorDescontar;
      }
    }
    if (valorFinal < 0) {
      valorFinal = 0;
    }
    else if (valorFinal > 100) {
      valorFinal = 100;
    }

    return valorFinal;
  }
  
  
  /*
   * Retorna una nota de valoración negativa de la estructura de una cadena dada como password,
     basada en la detección de caracteres repetidos en forma aislada o en secuencia
   * @param posicionesChar: mapeo de caracteres de una cadena, dada como password, a arreglos de
     posiciones de cada caracter que forma parte de esta.
   * @return entero de valoración estructural negativa de una cadena como password.
   */  
  function evaluarRepeticiones (posicionesChar) {
    var costoAcumulado = 0;
    var ultimaPos = posicionesChar[0];
    var enSecuencia = 0;
    // Por cada posición donde se ubica cierto caracter del password en este último,
    for (let i = 1; i < posicionesChar.length; i++) {
      if (posicionesChar[i] == ultimaPos+1) {
        enSecuencia++;
        costoAcumulado += enSecuencia*enSecuencia;
      }
      else {
        enSecuencia = 1;
        costoAcumulado += 4;
      }      
      ultimaPos = i;
    }
    
    return costoAcumulado;
  }

  

  ///////////////////////// FUNCIONALIDAD PARA LA ACTUALIZACIÓN DEL SITIO WEB ////////////////////////


  /**
   * Genera un mapeo de strings a strings para corresponder observaciones sobre los resultados de la
   * evaluación de un password dado y su detalle.
   * @param psw: cadena de caracteres dada como password.
   * @param valorFinal: valor numérico de valoración estructural final de un password dado.
   * @param existencias: arreglo de ocurrencias de cada tipo de caracter en un string como password.
   * @param ubicaciones: mapeo de caracteres del password a listas de posiciones donde se encuentra
   * cada uno de ellos dentro de dicha cadena.
   */
  function obtenerObservaciones (psw, valorFinal, existencias, ubicaciones) { 
    var observaciones = new Map([]);
    var long_psw = psw.length;
    var mayorCantRep = 1;
    var masRepetido;
    var coincidenConRep = 0;
    // respeta longitud mínima
    if (long_psw > 7) {
      if (long_psw == 8) {
        observaciones.set("Longitud de contraseña",
        "Cumple con la longitud mínima de seguridad (8 caracteres). Será más segura si fortalece su longitud.");
      }
    }
    else {
      observaciones.set("Longitud",
      "Su contraseña es muy corta (menos de 8 caracteres). Debe agregar más caracteres para que sea más segura.");
    }    
    // Cantidad de dígitos
    if (existencias[0] == 0) {
      observaciones.set("Ausencia de dígitos",
      "Su contraseña no emplea dígitos. Es recomendable combinarlos con letras y otros símbolos (+, ?, @, etc) para mejorar la seguridad.");
    }    
    // Cantidad de mayúsculas
    if (existencias[1] == 0) {
      observaciones.set("Ausencia de mayúsculas",
      "Su contraseña no emplea mayúsculas. Utilizarlas junto con minúsculas, con dígitos y otros símbolos (+, ?, @, etc) para mejorar la seguridad.");
    }
    // Cantidad de minúsculas
    if (existencias[2] == 0) {
      observaciones.set("Ausencia de minúsculas",
      "Su contraseña no emplea minúsculas. Utilizarlas junto con mayúsculas, con dígitos y otros símbolos (+, ?, @, etc) mejora la seguridad.");
    }
    // Cantidad de símbolos
    if (existencias[3] == 0) {
      observaciones.set("Ausencia de símbolos",
      "Su contraseña no emplea símbolos (+, ?, @, etc). Utilizarlos junto a otros tipos de caracteres incrementa el nivel de seguridad.");
    }
    // Cantidad de repeticiones
    for (par of ubicaciones.entries()) {
      posicionesChar = par[1];
      if (posicionesChar.length > mayorCantRep) {
        masRepetido = par[0];
        coincidenConRep = 1;
        mayorCantRep = posicionesChar.length;
      }
      else if (posicionesChar.length == mayorCantRep && posicionesChar.length > 1) {
        coincidenConRep++;
      }
    }
    if (mayorCantRep >= 2) {
      if (coincidenConRep == 1) {
        observaciones.set("Repetición de caracteres",
        "Se repiten caraceres. '" + masRepetido + "' el más repetido con " + mayorCantRep + " apariciones. No es una buena práctica repetir caracteres, sobre todo consecutivamente.");
      }
      else {
        observaciones.set("Repetición de caracteres",
        "Se repiten caraceres. Son " + coincidenConRep + " los más repetidos, con " + mayorCantRep + " apariciones cada uno. No es una buena práctica repetir caracteres, sobre todo consecutivamente.");
      }
    }
    return observaciones;
  }


  /**
   * Construye una colección con las observaciones realizadas sobre un password evaluado previamente,
   * produce un mensaje informando la valoración final con una aclaración y los muestra en el sitio web.
   * @param valorFinal: valor numérico de valoración estructural final de un password dado.
   * @param observaciones: mapeo de strings a strings para corresponder observaciones sobre los resultados de la
   * evaluación de un password dado y su detalle.
   */
  function mostrarReporte (valorFinal, observaciones) {  
    var barraValoracion;
    var coleccion;
    var leyenda;
    // Creo la barra de valoración
    barraValoracion = "<div class=\"progressBar progress-bar-striped\"><div class=\"progress-value circuit";
    barraValoracion += "\" id=\"barraValoracion\"> </div></div>";
    // Comienzo la creación de la colección con las observaciones
    coleccion = "<ul class=\"collection\"> <li class=\"collection-item fondoCol tituloCol\">";
    if (observaciones.size == 0) {
      coleccion += "¡Excelente! su contraseña supera los estándares mínimos y posee una estructura fuerte </li>";
    }
    else {
      coleccion += "Consejos para mejorar su contraseña </li>";
      for (par of observaciones.entries()) {
        coleccion += "<li class=\"collection-item avatar fondoCol\"><i class=\"material-icons circle red\">label_important</i>";
        coleccion += "<span class=\"tituloCol textoAIzquierda\">" + par[0] + "</span>" + "<p>" + par[1] + "</p></li>"
      }
    }
    coleccion += "</ul>";
    // Agrego la barra de valoración
    document.getElementById("contenedorNota").innerHTML = barraValoracion;
    document.getElementById("barraValoracion").style.width = "" + valorFinal + "%";
    // Determino color de la barra y la leyenda de acuerdo a la nota
    if (valorFinal < 40) {
      document.getElementById("barraValoracion").style.backgroundColor = "#f22929";
      document.getElementById("contenedorLeyenda").style.color = "#ef5350";
      leyenda = "¡Muy débil!" + " (" + valorFinal + "%)";;
    }
    else if (valorFinal >= 40 && valorFinal < 60) {
      document.getElementById("barraValoracion").style.backgroundColor = "#edd537";
      document.getElementById("contenedorLeyenda").style.color = "#edd537";
      leyenda = "Aún débil" + " (" + valorFinal + "%)";
    }
    else if (valorFinal >= 60 && valorFinal < 80) {
      document.getElementById("barraValoracion").style.backgroundColor = "#59c96f";
      document.getElementById("contenedorLeyenda").style.color = "#59c96f";
      leyenda = "Buena" + " (" + valorFinal + "%)";;
    }
    else {
      document.getElementById("barraValoracion").style.backgroundColor = "#17d14c";
      document.getElementById("contenedorLeyenda").style.color = "#17d14c";
      leyenda = "¡Muy fuerte!" + " (" + valorFinal + "%)";;
    }
    // Agrego la leyenda asociada a la valoración
    document.getElementById("contenedorLeyenda").innerHTML = leyenda;
    // Agrego la colección con las observaciones
    document.getElementById("reporteColeccion").innerHTML = coleccion;
  }

  /**
   * Borra toda observación y reporte de valoración visible en el sitio web al modificar la entrada
   * del textbox asociado al password.
   */
  function limpiarObs () {
    document.getElementById("contenedorNota").innerHTML = "";
    document.getElementById("contenedorLeyenda").innerHTML = "";
    document.getElementById("reporteColeccion").innerHTML = "";
  }


  /**
   * Permite mostrar en texto plano el contenido de la entrada del textbox asociado al password.
   */
  function cambiarVistaPassword () {
    var elemento = document.getElementById("psw_box");
    if (elemento.type.includes("password")) {
      elemento.type = "text";
    }
    else elemento.type = "password";    
  }

  
  /**
   * Permite modificar el skin o tema que se emplea para estilizar el sitio web.
   */
  function cambiarTema () {
    var estiloActual = document.getElementById("estilo");
    var rutaReferida = estiloActual.href;
    var esPredefinido = rutaReferida.includes("css/estiloPred.css");
    var nuevaRuta;
    // Si estoy usando los estilos predefinidos, entonces los cambio por Dark
    if (esPredefinido) {      
      estiloActual.href = "css/estiloDark.css";
      nuevaRuta = "css/estiloDark.css";   
    }
    else {
      estiloActual.href = "css/estiloPred.css";
      nuevaRuta = "css/estiloPred.css";
    }    
    localStorage.setItem("Tema",nuevaRuta);
  }

  
  