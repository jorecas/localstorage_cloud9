$(document).ready(function(){
	//Para los servicios que se consumirán...
	var nomServicios = [
	                        {
	                            servicio 	: 	"Trae todas las tareas",
	                            urlServicio	: 	"getAllTask",
	                            metodo		: 	"GET"
	                        },
	                        {
	                            servicio 	: 	"Crear una nueva tarea",
	                            urlServicio	: 	"createTask",
	                            metodo		: 	"POST"
	                        },
	                        {
	                            servicio 	: 	"Editar una tarea",
	                            urlServicio	: 	"updateTask",
	                            metodo		: 	"PUT"
	                        },
	                        {
	                            servicio 	: 	"Eliminar Tarea",
	                            urlServicio	: 	"deleteTask",
	                            metodo		: 	"DELETE"
	                        },
	                        {
	                            servicio 	: 	"Trae una sola tarea",
	                            urlServicio	: 	"getTask",
	                            metodo		: 	"GET"
	                        }
	                    ];

	var consumeServicios = function(tipo, val, callback)
	{
	    var servicio = {
	                        url 	: nomServicios[tipo - 1].urlServicio,
	                        metodo	: nomServicios[tipo - 1].metodo,
	                        datos 	: ""
	                    };
	    if(tipo === 4 || tipo === 5)
	    {
	        servicio.url += "/" + val;
	    }
	    else
	    {
	        servicio.datos = val !== "" ? JSON.stringify(val) : "";
	    }
	    //Invocar el servicio...
	    $.ajax(
	    {
	        url 		: servicio.url,
	        type 		: servicio.metodo,
	        data 		: servicio.datos,
	        dataType 	: "json",
	        contentType: "application/json; charset=utf-8"
	    }).done(function(data)
	    {
	        callback(data);
	    });
	};

	todos = [];
	var indEdita = -1; //El índice de Edición...

	//Constructor tarea...
	function tarea(task,estate)
	{
		this.tarea = task;
		this.estado = estate;
		this.imprime = function()
		{
			return [
						this.tarea, 
						this.estado
					];
		}
	}


	//Imprimer usuarios en pantalla...
	function imprimeUsuarios(){
		var txt = "";
		for(var i = 0; i < todos.length; i++)
		{
			if(todos[i].finish != true){
				txt += "<div class='tarea' id='activo'>";

				txt += "<img src = 'img/imagen2.png' class='imagen' id = 'update_"+i+"'/>";
				txt += "<img align='right' src = 'img/imagen4.png' class='imagen' id = 'delete_"+i+"'/>";
				txt += "<center>"+(todos[i].task)+"</center>";
				
				txt += "</div>";
			}
			else{
				txt += "<div class='tarea' id='inactivo'>";

				txt += "<img src = 'img/imagen3.png' class='imagen' id = 'update_"+i+"'/>";
				txt += "<img align='right' src = 'img/imagen5.png' class='imagen' id = 'delete_"+i+"'/>";
				txt += "<center>"+(todos[i].task)+"</center>";
				
				txt += "</div>";
			}
			
		}
		nom_div("imprimir").innerHTML = txt;
		//Poner las acciones de editar y eliminar...
		for(var i = 0; i < todos.length; i++)
		{	
			//Editar...
			nom_div("update_" + i).addEventListener('click', function(event)
			{
				var ind = event.target.id.split("_")[1];
				var idUser = todos[ind].task;
				ind = buscaIndice(idUser);
				if(ind != -1)
				{
					var updateData = {
                    "id"        : ind,
                    "finish"    : true,
                    "field"     : "finish"
	                };
					consumeServicios(3, updateData, function(data){
						    consumeServicios(1, "", function(data){
							    todos = data;
							    imprimeUsuarios();
							});
					});
				}
				else
				{
					alert("No existe el ID");
				}
			});

			//Eliminar...
			nom_div("delete_" + i).addEventListener('click', function(event)
			{
				var ind = event.target.id.split("_")[1];
				var idUser = todos[ind].task;
				if(confirm("Eliminar?"))
				{
					ind = buscaIndice(idUser);
					if(ind != -1)
					{
						consumeServicios(4, ind, function(data){
						    imprimeUsuarios();
						    
						    consumeServicios(1, "", function(data){
							    todos = data;
							    imprimeUsuarios();
							});
						});
					}
				}
			});
		}
		return imprimeUsuarios;
	}

	consumeServicios(1, "", function(data){
	    todos = data;
	    imprimeUsuarios();
	});
	//Dada la identificación, buscar la posición donde se encuentra almacenado...
	var buscaIndice = function(tarea)
	{
		var indice = -1;
		for(var i in todos)
		{	
			if(todos[i].task === tarea)
			{
				indice = todos[i].id;
				break;
			}
		}
		return indice;
	}


	//Saber si un usuario ya existe, bien por identificación o por e-mail...
	function existeTarea(tarea)
	{
		var existe = 0; //0 Ningún campo existe...

		for(var i in todos)
		{
			//Cédula...
			if(i !== indEdita)
			{
				if(todos[i].task.trim().toLowerCase() === tarea.trim().toLowerCase())
				{
					existe = 1; 
					break;
				}
			}
		}
		return existe;
	}

	//Acciones sobre el botón guardar...
	$('#TB_tarea').keyup(function(e){
		if(e.keyCode == 13)
    	{
			var valor = "";
			if(nom_div("TB_tarea").value === "")
			{
				alert("Digite una tarea");
				nom_div("TB_tarea").focus();
			}
			else
			{
				valor = nom_div("TB_tarea").value;
				var existeDatos = existeTarea(valor);
				if(existeDatos === 0) //No existe...
				{
					if(indEdita < 0)
					{
						var newToDo = {finish : false, task : valor};
						consumeServicios(2, newToDo, function(data){
						    todos.push(data);
						});
					}
					else
					{
						todos[indEdita].tarea = valor;
					}

					consumeServicios(1, "", function(data){
					    todos = data;
					    imprimeUsuarios();
					});

					indEdita = -1; 
					nom_div("TB_tarea").value = "";	

				}
				else
				{
					alert("la tarea ya existe!");
					nom_div("TB_tarea").focus();
				}
			}
		}
	});

	//Accedera los elementos de HTML...
	function nom_div(div)
	{
		return document.getElementById(div);
	}
});	