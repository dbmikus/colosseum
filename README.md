Colosseum
=========

Be a gladiator of debate, rap battling, and tic-tac-toe, held to the mercy of the crowd-sourced Commodus.

Description of settings.json:
'host' describes which machine is hosting the files.
'host' is primarily responsible for dynamically changing


Required Elements

1. Javascript is clearly evident in the project. The best example of the advanced javascript techniques we learned is the webRTC object in app.js which contains functions for accessing and broadcasting streams.

2. The draw game uses canvas. It can be found in drawgame.html/drawgame.js.

3. We used forms(desktop-create.html), buttons(everywhere), header (on every page), and a bunch of other html techniques including iframes.

4. We used CSS to create a fixed size layout, and we used several pseudoselectors like hover and active as well as javascript to dynamically change css. Literally any css file.

5. DOM manipulation is happening any time any type of chat appears, or any time something is hidden like voting statistics and for displaying the arenas in the browse arenas view. 

6. We use Jquery for any type of DOM access. We use the hide and show functions in arena.js to display voting statistics. Pretty much for any form submission (chat or arena creation) jquery is used to access the DOM.

7. We used PhoneGap to make a native app.

8. We consume an ajax API for getting the list of arenas in the findarena.js file.

9. We provide that same API in app.js.

10. We use node.js to serve all of our files. We also detect on our node.js server whether the client is a mobile or desktop device, and serve the right file for it.

11. We use websockets to set up the gameplay environment for our arenas. This allows the movements to be reactive in the game while not forcing the server to spam requests.

12. We used d3.js to visualize the voting data after each game. It makes a beautiful pie chart.

13. We created a sandboxed javascript environment and an entire API for creating games to be played on our website. The iframe can be found in arena.js, and the secure code that runs the API is found in the socket server code in app.js.



Evidence of Iterative Design:

The most major changes are found in two places. Our splash page did not really have any real explanation of our site. We found that our users needed more information then we were giving them. We improved the splash page graphicaly with a picture which helped set the stage for the app, and also created another page that explained what the website was used for. 


We also received a large amount of feedback who said they wanted more information in game. These users understood the purpose, but found the gameplay confusing because it was not always clear whether they were part of audience or competing, and if they had won or lost, and so on and so forth. We added data visualizations of the game's voting outcome, and we created an alert bar on the top that always displays the current phase of the game, which we believe helps users understand what is going on. We also added a timer, which counts down to when the game ends, which we also think is useful for similar reasons.

We also fixed a large number of small things, like fonts not matching and other similar visual flaws.