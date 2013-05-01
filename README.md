Colosseum
=========

### Group name: ###
Colosseum

### Group members: ###
Dylan Mikus <dmikus>
Nathan Hamal <nhamal>
Zach Matarasso <zim>


Description
------------

Be a gladiator of debate, rap battling, and tic-tac-toe, held to the mercy of the crowd-sourced Commodus.

Description of settings.json:
'host' describes which machine is hosting the files.
'host' is primarily responsible for dynamically changing

How to Run
-----------

To run, check the file mustacheView.js.
You can set the `simple_name` variable to either "dylan", "nathan", or "local".
* "dylan" cooresponds to  "http://198.199.85.62:3000"
* "nathan" cooresponds to "http://198.199.82.58:3000"
* "local" cooresponds to  "http://localhost:3000"

If you want to run the machine locally, set the `simple_name` to "local", and then
type `node app.js` and navigate to localhost:3000.
Otherwise, both the Nathan and Dylan servers should be running and you can just
test on those.

If you are running locally, you might need to install some dependencies. Make
sure you have npm installed, and then in the directory where `package.json`
resides, type `npm install`.


Required Elements
-----------------

1. Javascript is clearly evident in the project. The best example of the
advanced javascript techniques we learned is the webRTC object in app.js which
contains functions for accessing and broadcasting streams.

2. The draw game uses canvas. It can be found in drawgame.html/drawgame.js.

3. We used forms(desktop-create.html), buttons(everywhere), header (on every
page), and a bunch of other html techniques including iframes.

4. We used CSS to create a fixed size layout, and we used several
pseudoselectors like hover and active as well as javascript to dynamically
change css. Literally any css file.

5. DOM manipulation is happening any time any type of chat appears, or any time
something is hidden like voting statistics and for displaying the arenas in the
browse arenas view.

6. We use Jquery for any type of DOM access. We use the hide and show functions
in arena.js to display voting statistics. Pretty much for any form submission
(chat or arena creation) jquery is used to access the DOM.

7. We consume an ajax API for getting the list of arenas in the findarena.js file.

8. We provide that same API in app.js.

9. We use node.js to serve all of our files. We also detect on our node.js
server whether the client is a mobile or desktop device, and serve the right
file for it.

10. We use websockets to set up the gameplay environment for our arenas. This
allows the movements to be reactive in the game while not forcing the server to
spam requests.

11. We used d3.js to visualize the voting data after each game. It makes a
beautiful pie chart.

12. We created a sandboxed javascript environment and an entire API for creating
games to be played on our website. The iframe can be found in arena.js, and the
secure code that runs the API is found in the socket server code in app.js.

13. We partially implemented WebRTC, which is a real-time communications
framework that communicates through web browsers. We used it for video
streaming. We only got two-way streaming between two peers working and could not
manage to broadcast the streams to the remaining spectators. It got too
complicated for our time frame to implement the network of peer connections and
peer handshakes to make broadcasting to spectators work.



Evidence of Iterative Design:
-----------------------------

The most major changes are found in two places. Our splash page did not really
have any real explanation of our site. We found that our users needed more
information then we were giving them. We improved the splash page graphicaly
with a picture which helped set the stage for the app, and also created another
page that explained what the website was used for.


We also received a large amount of feedback who said they wanted more
information in game. These users understood the purpose, but found the gameplay
confusing because it was not always clear whether they were part of audience or
competing, and if they had won or lost, and so on and so forth. We added data
visualizations of the game's voting outcome, and we created an alert bar on the
top that always displays the current phase of the game, which we believe helps
users understand what is going on. We also added a timer, which counts down to
when the game ends, which we also think is useful for similar reasons.

We also fixed a large number of small things, like fonts not matching and other
similar visual flaws.
