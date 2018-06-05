
var date = new Date()
//Variables de busqueda
var categoria = 'all';
var fecha = date.getFullYear() + '-' + 
			( date.getMonth().toString().length < 2 ? '0'+date.getMonth() : date.getMonth() ) + '-' + 
			( date.getDate().toString().length < 2 ? '0'+date.getDate() : date.getDate() );
var recientes = true;
var cercaAMi = true;

var latitudUsuario;
var longitudUsuario;

$(function () {
	$('#pickyDate').datepicker({
		format: "yyyy-mm-dd",
	}).on('changeDate', showTestDate);
});

function showTestDate(){
	fecha = $('#pickyDate').datepicker('getFormattedDate');
}

$("#cercania").on('change', function() {
	if ($(this).is(':checked')) {
		$(this).attr('value', 'true');
		getPosicionUsuario();
	} else {
		$(this).attr('value', 'false');
	}

});

function buscarDenuncias(){

    console.log("Entrando a buscarDenuncias()");

    getPosicionUsuario();


	console.log("Iniciando conexión con Web Service Rest[URL=/denuncias/buscarDenuncias] ....");

	$.ajax({
		type: "GET",
		url: "http://127.0.0.1:8080/denuncias/buscarDenuncias",
		contentType: "application/json; charset=utf-8",
		data: {
			latUser: latitudUsuario,
			lonUser: longitudUsuario,
			cat: $("#categoria").val(),
			fec: $('#pickyDate').datepicker('getFormattedDate'),
			rec: recientes,
			cerca: $("#cercania").val()
		},
		success: 
			function (denuncias) {
					console.log("Se recibió respuesta del Web Service");

		            var denunciasJson = JSON.stringify(denuncias);

		            console.log("DenunciasJSON="+denunciasJson);

		            insertarDenuncias(denuncias);       
		     }
	});
}


function insertarDenuncias(denuncias){

	$("#lista-denuncias").html("");

	for (var i = 0; i < denuncias.length; i++) {
		var denuncia = denuncias[i];

		var codigo = denuncia.codigo;
		var direccion = denuncia.direccion;
		var categoria = denuncia.categoria;
		var username = denuncia.usuario.username;
		var comentario = denuncia.comentario;
		var date = denuncia.date;
		var time = denuncia.time;

		var denunciaString = "<div class='panel panel-primary'><div class='panel-heading'>"
					+ "Denuncia Nro <b>" + codigo + "</b> / Categoria <b>" + mapearCategoria(categoria) + "</b>"
					+ "</div><div class='panel-body'>"
					+ "<b>Comentario: </b>" + comentario + "</br>" + "<b>Ubicacion: </b>" + direccion +"</br> <em>Denuncia registrada por el usuario <b>" + username + "</b> el <b>" + date + "</b> a las <b>" + time + "</b></em>"
					+ "</div></div>";

		$("#lista-denuncias").append(denunciaString);

	}

	

}


function mapearCategoria(cat){

	var categoria;

	switch(cat){
	        	case 'RMA':
	        			categoria = "Robo a mano armada"
	        		break;
	        	case 'RAV':
	        			categoria = "Robo a vehiculo"
	        		break;
	        	case 'VAN':
	        			categoria = "Vandalismo"
	        		break;
	        	case 'RAP':
	        			categoria = "Robo al paso"
	        		break;
	        	default:
	        			categoria = "Sin categoria"
	        		break;
	        }

	return categoria
}


function getPosicionUsuario(){
	console.log("Entrando a getPosicionUsuario()");

	if (navigator.geolocation)
	{
		console.log("Obteniendo posición del usuario...");
		navigator.geolocation.getCurrentPosition(function(objPosition)
		{
			longitudUsuario = objPosition.coords.longitude;
			latitudUsuario = objPosition.coords.latitude;

			console.log("Latitud del usuario: "+latitudUsuario);
			console.log("Longitud del usuario: "+longitudUsuario);

		}, function(objPositionError)
		{
			switch (objPositionError.code)
			{
				case objPositionError.PERMISSION_DENIED:
				console.log("No se ha permitido el acceso a la posición del usuario.");
				break;
				case objPositionError.POSITION_UNAVAILABLE:
				console.log("No se ha podido acceder a la información de su posición.");
				break;
				case objPositionError.TIMEOUT:
				console.log("El servicio ha tardado demasiado tiempo en responder.");
				break;
				default:
				console.log("Error desconocido.");
			}
		}, {
			maximumAge: 75000,
			timeout: 15000
		});
	}
	else
	{
		console.log("Su navegador no soporta la API de geolocalización.");
	}
}



