# dialogflow_IA_BackEnd
Communication of a JS BackEnd with DialogFlow and APIs to ask questions and get answers in connection with the APis

In context of a course on communication with an AI in NodeJS, I developed a BackEnd in JS allowing me to communicate and ask questions to DialogFlow in relation to the APIs I have retrieved (news API, recipe API, avialable movies on Netflix API) to retrieve the key elements that will then allow me to communicate to my APIs the right information and get an answer in return

For example :
I want 3 recipes to make in less than 15 minutes
I ask the question in my url,
I get the question and I send it to DialogFlow which analyzes the key elements that interest me (here the number of recipes and the maximum duration) and I send this information to my BackEnd.
I take this information and I ask the recipe API, which returns a list of 3 recipes to do in less than 15 minutes.

Communication of a BackEnd with DialogFlow and APIs to ask questions and get answers in connection with the APis

To test the code you can :

- add API keys for your Dialogflow
- add others APIs keys that you gonna ask
- train your Dialogflow to get the datas that you need
- call the API that you asked with the needed informations

You have the result in the terminal or in your Apiman app.
