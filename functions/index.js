//Poner sugerencias en opciones de react y
//poner ciclo para recorrer tematicas

// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';
 
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');

const admin = require('firebase-admin');
admin.initializeApp();
const firestore = admin.firestore();

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

//este es nuestro entry point
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const ciudades = ['Bogotá','Ciudad de Mexico', 'Bogota','Ciudad de México'];
  const tematicas = ['Inteligencia Artificial', 'React','Firebase'];
  const siguienteLive = {
  	dia: '20 de septiembre',
   	hora: '7 PM',
   	tema: 'Cómo convertirte en desarrollador estrella'
  };
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
  function obtenerCiudad(agent){
  	if(ciudades.includes(agent.parameters.ciudad[0])){
      const ssml = `<speak> <audio src="https://storage.googleapis.com/atzi-acciones/sonidos/disparo.mp3"></audio> Reebien: Te puedo ayudar a encontrar charlas y 
                  talleres en tu ciudad o eventos en linea. ¿Por cuál
                  te gustaria empezar?</speak>`
      agent.add(ssml);
      agent.add(new Suggestion('Pláticas'));
      agent.add(new Suggestion('Talleres'));
      agent.add(new Suggestion('Platzi Live'));    
    }else{
      agent.add(`Mala mia, Aun no hay meetups en tu ciudad, pero
				el siguiente Platzi Live es el día ${siguienteLive.dia}
				a las ${siguienteLive.hora} y el tema es
				${siguienteLive.tema}`);
    }
  }
  
  function detallePlatziLive(agent){
    /*let nextPlatziLive = firestore.collection('platzi-lives').get().then(function(doc){
        //TODO completar código y traer datos de firestore
    })*/
  	agent.add(`El siguiente Platzi Live es el día ${siguienteLive.dia}
				a las ${siguienteLive.hora} y el tema es
				${siguienteLive.tema}`);
  }
  
  function seleccionDeTematica(agent){
    const ssml = `<speak> <p> <s>¡Bacano! </s> <s>A mi también me encantan los retos.</s>
                  <s>Estos son los temas que se van a cubrir próximamente
                  en tu ciudad:</s> ${tematicas.join('<break time="500ms" />,')}.
                  ¿Cúal te interesa más? </p>
                  </speak>`
    //let conv = agent.conv();
    //conv.ask(ssml); //se le da la conversación el ssml 
    //agent.add(conv); //se añade la conversación al flujo*/
    agent.add(ssml);
    agent.add(new Suggestion(tematicas[0]));
    agent.add(new Suggestion(tematicas[1]));
    agent.add(new Suggestion(tematicas[2]));
  }

  //Talleres - Deep Links
  function seleccionDeTematicaDeep(agent){
  	agent.add(`Bacano! A mi también me encantan los retos.	
			Estos son los temas que se van a cubrir próximamente
			en tu ciudad: ${tematicas.join(',')}.
			¿Cúal te interesa más?`);
    agent.add(new Suggestion(tematicas[0]));
    agent.add(new Suggestion(tematicas[1]));
    agent.add(new Suggestion(tematicas[2]));
  }
  
  function detalleDeTaller(agent){
  	agent.add(`<speak>El sábado 28 de agosto a las <say-as interpret-as="time" format="hms12">7:00pm</say-as> en las oficinas de
			Platzi tendremos de React Hooks. 
			¿Te gustaría asistír?</speak>`);
  }
  
  function Button(title, uri){
    this.title = title;
    this.openUriAction = {
      uri: uri
    };
  }
  
  function registroAlTaller(agent){
  	agent.add(`<speak>!Listo pana!, solo nos falta un detalle, para asistir debes
				registrarte en <sub alias="la plataforma de Meetup">https://www.meetup.com/platzi-mexico-city/</sub>
				¿Te gustaria explorar algo más? Solo dí:
				Quiero información de otra plática, taller o evento en linea.</speak>`);
  	agent.add(new Card({
    	title: 'Registro en MeetUp',
     	imageUrl: 'https://www.islabit.com/wp-content/uploads/2019/04/google-assistant.png',
      	text: 'Registrate en Meetup, También puedes usar saltos de linea\n y hasta emojis 🍄',	
      	buttons: [
                {
                  title: 'Registrarme',
                  openUrlAction: {
                    url: 'https://www.meetup.com/platzi-mexico-city/'
                  }
                }
              ],	
      	//buttonText: 'Registrarme',
      	//buttonUrl: 'https://www.meetup.com/platzi-mexico-city/',
      	
    }));

    //el contexto se agrega para que dialogflow sepa entender cuando ya no quiern seguir con la conversación
    //lifespan: es el número de turnos en que el contexto esta vivo - es la vida util - ver https://cloud.google.com/dialogflow/docs/contexts-input-output
    //el agente dice algo, el usuario responde, eso es 1 turno
    agent.setContext({ name: 'registroAlTAller', lifespan: 2, parameters: {} });
  }
  
  //este es el que relaciona el intent con la función de código
  let intentMap = new Map();
  intentMap.set('Obtener Ciudad', obtenerCiudad);
  intentMap.set('Live', detallePlatziLive);
  intentMap.set('Talleres', seleccionDeTematica);
  intentMap.set('Talleres - Deep Links', seleccionDeTematicaDeep);
  intentMap.set('Seleccion de taller', detalleDeTaller);
  intentMap.set('Seleccion de taller - yes',registroAlTaller);
  agent.handleRequest(intentMap);
});

