
var API_GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json";
var APP_KEY = "AIzaSyCSeQsRYgffothWx8Cfq-7CgcmP4ehKUvY";
var map;
var marker;
var latitud = -12.056015207800758;
var longitud = -77.08442259999998;

var GUN_IMAGE_URL = 'http://127.0.0.1:8080/gun.png';
var CAR_IMAGE_URL = 'http://127.0.0.1:8080/car.png';
var FIGHT_IMAGE_URL = 'http://127.0.0.1:8080/fight.png';
var RUN_IMAGE_URL = 'http://127.0.0.1:8080/run.png';

var longitudUsuario;
var latitudUsuario;

	function setLatLng(lat, lng){
		latitud = lat;
		longitud = lng;
	}

	function initMap(latitud, longitud) {
  			console.log("Entrando a initMap(), params[latitud=" + latitud + ", longitud=" + longitud + "]");
  			console.log("Generando map...");
    		map = new google.maps.Map($("#map")[0], {
          		center: {lat: latitud, lng: longitud},
          		zoom: 17
    		});

    	console.log("Generando marker...");
    	marker = new google.maps.Marker({
          	map: map,
          	draggable: true,
          	animation: google.maps.Animation.DROP,
          	position: {lat: latitud, lng: longitud}
    	});

    	console.log("Registrando eventos en el marker, events[click, dragend]");
    	marker.addListener('click', toggleBounce);
    	marker.addListener('dragend', dragEnd);

    	//listarDenuncias();
  	}

  	function toggleBounce() {
        if (marker.getAnimation() !== null) {
          marker.setAnimation(null);
        } else {
          marker.setAnimation(google.maps.Animation.BOUNCE);
        }
  	}

  	function dragEnd(){
  		console.log("Entrando a dragend()");
  		var lat = marker.getPosition().lat();
  		var lng = marker.getPosition().lng();
  		console.log("lat=" + lat + ", lng=" + lng);
  		setLatLng(lat, lng);
  		callApiGeoAddress(lat, lng);
  	}



  	function callApiGeoLatLng(addr){
			console.log("Entrando a callApiGeoLatLng(), params: address="+addr);

			console.log("Iniciando conexion con API_GEOCODE...");
			$.ajax({
				type: "GET",
		        url: API_GEOCODE_URL,
		        data: {
		            address: addr,
		            key: APP_KEY
		        },
		        dataType: "json",
		        success: function (result) {
		            //var data = '{ "name": "Antony", "age": "24" }';
		            //var json = JSON.parse(data);

		            console.log("Conexion exitosa, obteniendo latitud y longitud");

		            var json = JSON.stringify(result)
		            var obj = JSON.parse(json);

		            var lat = obj.results[0].geometry.location.lat;
		            var lng = obj.results[0].geometry.location.lng;
		            
		            console.log("lat="+lat+", lng="+lng);
		            initMap(lat, lng);
		            setLatLng(lat, lng);
	    		}
    		});

		}

		function callApiGeoAddress(latitud, longitud){
			console.log("Entrando a callApiGeoAddress(), params: [latitud=" + latitud + ", longitud=" + longitud + "]");

			var latlng = latitud + "," + longitud;

			console.log("Iniciando conexion con API_GEOCODE...");
			$.ajax({
				type: "GET",
		        url: API_GEOCODE_URL,
		        data: {
		            latlng: latlng,
		            key: APP_KEY
		        },
		        dataType: "json",
		        success: function (result) {
		            
		            console.log("Conexion exitosa, obteniendo address");

		            var json = JSON.stringify(result)
		            var obj = JSON.parse(json);

		            var address = obj.results[0].formatted_address;
		            
		            console.log("address="+address);

		            $("#address").val(address);
	    		}
    		});

		}

		function buscarUbicacion(){
			console.log("Entrando a buscarUbicacion()...");
			var address = $("#address").val();

			if( !address ){
				alert("Por favor, ingresa una direccion");
			} else{
				console.log(address);
				callApiGeoLatLng(address);
				getPosicionUsuario();
			}

		}

		
      	


      	function registrarDenuncia(){

      		console.log("Entrando a registrarDenuncia()");

      		var user = {
      			dni: "73253818",
      			username: "amartinez",
      			password: "123456",
      			nombres: "Antony",
      			apellidos: "Martinez",
      			edad: 24,
      			correo: "antonymartinez12@gmail.com",
      			tipo_usuario: "admin",
      			celular: "978534454",
      			latitud: latitudUsuario,
      			longitud: longitudUsuario
      		}

			var denuncia = {
			    direccion: $("#address").val(),
			    latitud: latitud,
			    longitud: longitud,
			    categoria: $("#categoria").val(),
			    comentario: $("#Comentario").val(),
			    usuario: user
			};

			var denunciaJson = JSON.stringify(denuncia);

			console.log("JSON a enviar: ["+ denunciaJson +"]");
			console.log("Iniciando conexión con Web Service Rest[URL=/denuncias/registrarDenuncia] ....");

			$.ajax({
				type: "POST",
		        url: "http://127.0.0.1:8080/denuncias/registrarDenuncia",
		       	contentType: "application/json; charset=utf-8",
		        data: denunciaJson,
		        success: function (result) {
		        	console.log("Se recibió respuesta del Web Service");
		   
		            var json = JSON.stringify(result);

		            console.log("JSON="+json);

		            if(result.codigo == "OK"){
		            	alertify.success(result.mensaje);
		            }else{
		            	alertify.error(result.mensaje);
		            }

		            
	    		}
    		});

      	}


      	function listarDenuncias(categ){

      		initMap(latitud, longitud);

      		console.log("Entrando a listarDenuncias[params="+categ+"]");

			console.log("Iniciando conexión con Web Service Rest[URL=/denuncias/listarDenuncias] ....");

			$.ajax({
				type: "GET",
		        url: "http://127.0.0.1:8080/denuncias/listarDenuncias",
		       	contentType: "application/json; charset=utf-8",
		        success: function (denuncias) {
		        	console.log("Se recibió respuesta del Web Service");
		   
		            var denunciasJson = JSON.stringify(denuncias);

		            console.log("DenunciasJSON="+denunciasJson);

		            setMarkers(map, denuncias, categ);
		            
	    		}
    		});

			return false;
      	}


      	function setMarkers(map, denuncias, categ) {

      		var urlImage;

	        switch(categ){
	        	case 'RMA':
	        			urlImage = GUN_IMAGE_URL;
	        		break;
	        	case 'RAV':
	        			urlImage = CAR_IMAGE_URL;
	        		break;
	        	case 'VAN':
	        			urlImage = FIGHT_IMAGE_URL;
	        		break;
	        	case 'RAP':
	        			urlImage = RUN_IMAGE_URL;
	        		break;
	        }

	        var image = {
	          url: urlImage,
	          size: new google.maps.Size(32, 32),
	          origin: new google.maps.Point(0, 0),
	          anchor: new google.maps.Point(0, 32)
	        };
	        
	        var shape = {
	          coords: [1, 1, 1, 20, 18, 20, 18, 1],
	          type: 'poly'
	        };

	        for (var i = 0; i < denuncias.length; i++) {
	          var denuncia = denuncias[i];

	          if( denuncia.categoria.toString() == categ || (typeof categ == "undefined") ){
		          	var resumen = "Codigo: "+ denuncia.codigo +"\n" +
					  "Direccion: "+ denuncia.direccion +"\n" +
					  "Categoria: "+ denuncia.categoria +"\n" +
					  "Usuario: "+ denuncia.usuario.username +"\n" +
					  "Comentario: "+ denuncia.comentario +"\n" +
					  "Fecha: "+ denuncia.date +"\n" +
					  "Hora: "+ denuncia.time +"\n";

				  console.log(resumen);
				  console.log(denuncia.latitud + " " + denuncia.longitud);

		          var marker = new google.maps.Marker({
		            position: {lat: denuncia.latitud, lng: denuncia.longitud},
		            map: map,
		            icon: image,
		            shape: shape,
		            title: resumen,
		            zIndex: i
		          });
	          }

	        }
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