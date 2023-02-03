var express = require('express');
var router = express.Router();
const axios = require('axios');
const dialogflow = require('@google-cloud/dialogflow');


/**
 * Permet de communiquer avec DialogFlow
 */
router.get('/', async function(req, res) {

    const textQuery = req.query['q']
    //appel à la main f() en passant le contenu de l'URL en param
    let test = await runSample('api-chat-bot-370713', textQuery)
    console.log(test);
    const response = {
        query : textQuery,
        answer : test
    }

    res.send(response);
});
    
    
    /*-------------Communication avec DialogFlow----------------*/
    
/**
 * Permet l'envoi d'une Query à dialogflow et d'en récupérer son resultat
 * @param {string} projectId The project to be used
 */
async function runSample(projectId, textQuery) {
    // On définit la session ID comme il est indiqué dans la doc
    const sessionId = "123456789";
    
    // On créé ici une nouvelle session
    const sessionClient = new dialogflow.SessionsClient();
    const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);
    
    // On remplis la requette qui sera passé
    const request = {
        session: sessionPath,
        queryInput: {
        text: {
            // The query to send to the dialogflow agent
            text: textQuery,
            // The language used by the client (en-US)
            languageCode: 'fr-FR',
        },
        },
    };
    
    // Envoie de la requête et affichage du résultat
    const responses = await sessionClient.detectIntent(request);
    // console.log('Detected intent');
    const result = responses[0].queryResult;
    console.log(`  Query: ${result.queryText}`);
    console.log(`  Response: ${result.fulfillmentText}`);
    if (result.intent) {
        console.log(`  Intent: ${result.intent.displayName}`);
    } else {
        console.log(`  No intent matched.`);
    }
    

    ////----------MAIN BLOCK-----------////
    //Gestion des différentes intentions et des retours
    let intent = result.intent.displayName
    let resFinal = ""
    switch (intent) {
        
        
        case "NewsAPI":
        
            let paramsAPINews = result.fulfillmentText.split(" ")
            let country = paramsAPINews[0]
            let domain = paramsAPINews[1]
            resFinal = await APINewsTraitement(country, domain);
            console.log(resFinal);

            return resFinal

        case "NetflixVerify" :

            let paramsNetflix = result.fulfillmentText.split(" ")
            let typeFR = paramsNetflix[0]
            let type = convertTypeFilm(typeFR)
            let title = paramsNetflix[1]
            resFinal = await verifyNetflix(title, type);
            return resFinal
    
        case "recipeAPI" :

            let paramsRecipe = result.fulfillmentText.split(" ")
            let recipeNumber = paramsRecipe[0]
            let recipeTime = convertTimeToRecipeAPI(paramsRecipe[1])

            resFinal = await recipeInfos(recipeNumber, recipeTime)
            // console.log(resFinal);
            return resFinal

        default:
            resFinal = {
                answer : "La demande n'a pas été comprise."
            }

        break;
    }
    ////----------END MAIN BLOCK-----------////
    



    //------Fonction utilisés---------//
    
    //------Partie NEWS API-------//
    
    /**
     * 
     * Permet de faire appel à l'API des news qui nous retourne en fonction du pays et du domaine sur lequel on veut avoir des infos la liste des gros titres
     * 
     * @param {string} country 
     * @param {string} domain 
     */
    async function APINewsTraitement(country, domain) {
    
        //on va convertir le pays en code pays
        let countryCode = swapCountryToCodeCountry(country)
        //put your api key
        let url = 'https://newsapi.org/v2/top-headlines?' +
            'category='+ domain +'&' +
            'country='+ countryCode +'&' +
            'apiKey=';

            let response = await axios.get(url, {
                headers : {
                    "Accept-Encoding" : ""
                }
            })
            // console.log(response.data);
            return response.data
    }
    
    /**
     * 
     * Permet de convertir le nom du Pays en français dans le code pays correspondant afin de questionner l'API de News
     * 
     * @param {string} country 
     * @returns 
     */
    function swapCountryToCodeCountry(country) {
        const countryCodes = {
        "Royaume-Uni": "UK",
        "États-Unis": "US",
        "France": "FR",
        "Allemagne": "DE",
        "Espagne": "ES",
        "Italie": "IT",
        "Suède": "SE",
        "Norvège": "NO",
        "Danemark": "DK",
        "Finlande": "FI",
        "Pays-Bas": "NL",
        "Belgique": "BE",
        "Autriche": "AT",
        "Suisse": "CH",
        "Turquie": "TR"
        };
    
        //On retourne le code qui correspond aux pays
        return countryCodes[country]
    }

    //------Partie API Verif Netflix------//
    /**
     * 
     * Permet d'appeler une API contenant la bibliothèthe Netflix pour vérifier en passant le type du film ainsi que son titre si il est présent sur la plateforme.
     * 
     * @param {string} titleFilm 
     * @param {string} typeFilm 
     */
    async function verifyNetflix(titleFilm, typeFilm) {
        const options = {
            method: 'GET',
            url: 'https://unogs-unogs-v1.p.rapidapi.com/search/titles',
            params: {order_by: 'date', title: titleFilm, type: typeFilm},
            headers: { //put your api key
                'Accept-Encoding' : "",
                'X-RapidAPI-Key': '',
              'X-RapidAPI-Host': 'unogs-unogs-v1.p.rapidapi.com'
            }
        };
        let response = await axios.request(options)
        // console.log(response.data);
        return response.data;
    }

    /**
     * 
     * Permet de convertir le type (film ou série) renseigné par l'user en anglais afin de questionner l'API (qui n'accepte que les termes en anglais)
     * 
     * @param {string} type 
     * @returns 
     */
    function convertTypeFilm(type) {
        switch (type) {
            case "film":
                return "movie"
            
            case "serie" :
            case "série" :
                return "series"

            default:
                break;
        }
    }


    //---API recettes----//
    /**
     * 
     * Permet de questionner l'API de recette afin de retourner une liste en fonction du nombre de recettes voulu et du temps max qu'on veut y passer
     * 
     * @param { integer } numberRecipe 
     * @param { integer } timeRecipe 
     */
    async function recipeInfos(numberRecipe, timeRecipe){

        //put your api key
        const options = {
          method: 'GET',
          url: 'https://tasty.p.rapidapi.com/recipes/list',
          params: {from: '0', size: numberRecipe, tags: timeRecipe},
          headers: {
            "Accept-Encoding" : "",
            'X-RapidAPI-Key': '',
            'X-RapidAPI-Host': 'tasty.p.rapidapi.com'
          }
        };
        
        let response = await axios.request(options)

        return response.data

    }

    /**
     * 
     * Permet de convertir le temps renseigner par l'user 
     * 
     * @param {integer} time 
     * @returns 
     */
    function convertTimeToRecipeAPI(time){
        let rgxMinute = /m(in(ute(s)?)?)?/;
        let rgxHeure = /h(eure(s)?)?/;
        if (time.match(rgxHeure)) {
            let timeParam = "under_"+ time.slice(0,1) + "_hour"
            // console.log(timeParam);
            return timeParam
        }
        //on gère que un décimal avec 2 chiffres car il n'existe pas de recette à moins de 10min généralement
        if (time.match(rgxMinute)) {
            let timeParam = "under_"+ time.slice(0,2) + "_minutes"
            return timeParam
        }
    }
}

module.exports = router;
