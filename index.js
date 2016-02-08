var hapiLib = require('hapi');
var blipp  = require('blipp');
var requestMaker =  require('request');

var server = new hapiLib.Server();
var applicationKEY = process.env.WEATHER_DEVELOPER_FORECAST_KEY;

server.connection({ 
    port: process.env.PORT || 8000 ,
    routes : {cors : true}
});


var possibleResults = [
{"name": "clear-day", "phrases": ["Ma' claro ni el agua manito!", "Compai, jale pa' la playa y olvidese del mundo!", "Mardito' solasooooooo!!!!", "Compai, ubiqua aunqeu sea una gorra que er sol ta' de pinga!", "Ponte un huevo en la calle que se cocina"]}, 
{"name":"clear-night", "phrases": ["Esta lloviendooooo estrellas!!!!", "Mira a Pluton, Mercurio...Rusia!!!", "El cielo ta' claro y pelao!", "Noche playera!"]},
{"name":"rain", "phrases": ["El dia ta' pacheco!", "San Isidro por la pita!", "Sonido suave astoa!", "Un chocolatico con pan ahora mimo!", "Lluvia, tus besos frios como la lluvia"]},
{"name":"snow", "phrases": ["Ta como nevando!"]},
{"name":"sleet", "phrases": ["Er diablo!!! Piedra del cielo!", "Cuidao' que tan' tirando de arriba", "Plomoooooooooo!!!!!!!", "Lo vridiiiiiooooo!!!!!"]},
{"name":"wind", "phrases": ["Ta chichiguoso el dia", "No leas el periodico que se te va a volar!", "La verdadera brisa mijo!", "Soplando duro y pico ta' la brisa"]},
{"name":"fog", "phrases": ["Y eta' niebla?!?!", "Parece que paso un carro publico por aqui!", "No veo na con eta' niebla", "Y ete' humo de donde salio?"]},
{"name":"cloudy", "phrases": ["Bueeeeeehhhh, el dia ta' como nubloso!" , "Hoy la parabola no sirve!", "El dia ta' trite' y gri!", "Ta' como pol llover compai!"]},
{"name":"partly-cloudy-day", "phrases": ["Pila de nubes haciendo pila de coro", "Cancela el coro afuera que con toa' eta' nube...", "No hay parrillada hoy!", "Pa' mi que llueve hoy"]},
{"name":"partly-cloudy-night", "phrases": ["Hoy se duelme' acurrucao'", "Ubicate la colcha que hoy de na' hace un friito jevi", "Friiioooo Friiiioooo, como el agua del rio", "No hay que prender el aire hoy!!!"]}];

function getRandomPhraseBasedOnResult(forecast){
	var result = forecast;
	for(var i = 0; i<= possibleResults.length -1;i++){
		console.log(possibleResults[i]);
		var jsonPhrases = possibleResults[i];
		if(jsonPhrases.name === forecast){
			var index = Math.round(Math.random() * jsonPhrases.phrases.length -1);
			result = jsonPhrases.phrases[index];
			break;
		}
	}
	return result;
}

server.route({

	method: "GET",
	path: "/weather/{coordinates}",
	handler : function(request, response){
		var coordinates = request.params.coordinates;

		if(coordinates !== undefined){
			if(applicationKEY !== undefined){
				
				var url = "https://api.forecast.io/forecast/"+applicationKEY+"/"+coordinates;
				var options = {
					uri : url,
					method : "GET"
				};
				requestMaker(options, function(error, replyFromServer, body){
					if(!error && replyFromServer.statusCode === 200){
						var jsonResponse = JSON.parse(body);
						var weatherResponse = {
							icon : jsonResponse.currently.icon,
							summary : jsonResponse.currently.summary,
							temperature :(jsonResponse.currently.temperature - 32) * 5/9,
							phrase : getRandomPhraseBasedOnResult(jsonResponse.currently.icon)
						};
						response(weatherResponse);
					}else{
						response(error).code(400);
					}
				});
			}else{
				response("{Invalid application key}").code(400);
			}
		}else{
			response("{errorMessage: Invalid coordinates}").code(400);
		}

	}
});


server.register({register:blipp , options :{}}, function(error){
	if(error){
		console.log("Error starting hapi server with error: "+error);
	}else{
		server.start(function(){
			console.log('Server running at: '+ server.info.uri + "("+new Date()+")");
		});
	}
});