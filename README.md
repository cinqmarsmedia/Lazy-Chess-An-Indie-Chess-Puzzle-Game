# Lazy-Chess-An-Indie-Chess-Puzzle-Game

Another non-profit game by the creator of <a href="https://www.cinqmarsmedia.com/devilscalculator/">The Devil's Calculator </a> and <a href="https://www.cinqmarsmedia.com/synonymy/">Synonymy</a>. Open source under the GPLv3 license like all our projects. The project was built in Ionic 3 and should compile out of the box, though if you wish to integrate firebase, you'll need to generate your own credentials and put them in constants.ts. We'd love to hear from you with your ideas on the project, so shoot us an email anytime at <a HREF="mailto:info@cinqmarsmedia.com">info@cinqmarsmedia.com</a> or open up an issue if you're having any trouble running the code.<br>

Lazy Chess is made by <a href="https://github.com/cinqmarsmedia">@cinqmarsmedia</a> a volunteer run 501(c)3 non-profit. No members of the organization are paid a salary, and all proceeds go toward funding expenses for our educational and humanitarian projects. For more info, check out <a href="https://cinqmarsmedia.com">cinqmarsmedia.org</a>.

Lazy Chess was just soft released a week or so ago awaiting feedback. We're in the midst of adding continuous integration in this project as well as our others so apologies for the current state of our code, we will have better documentation and cleaner, organized code pushed shortly. With our new system, our private repos will auto push with redacted sensitive info to our public repos. 

Shout out and special thanks to the following libraries that are integrated in the project: 

- @loicmarie - https://github.com/loicmarie/ng2-chessboard
- @jhlywa - https://github.com/jhlywa/chess.js
- @nmrugg - https://github.com/nmrugg/stockfish.js
- @niklasf - https://github.com/niklasf/eco
- @official-stockfish - https://github.com/official-stockfish/Stockfish

<a href="https://www.cinqmarsmedia.com/lazychess/">Official Site</a> - For gameplay instructions, check out the <a href="https://www.cinqmarsmedia.com/lazychess/guide/">User Guide</a>.

# Build Instructions
1. Download the code, cd into the directory, and do an "npm install". 
2. Run the project using the command "ionic serve".
3. Open up a browser to localhost:8000 (where ionic serve defaults to)
4. Any breaking issues you might encounter later are likely because of firebase or other credentials that have been removed. Make a firebase account and enter your information in fbConfig under constants.ts or remove "public db: AngularFireDatabase" from the constructor in home.ts and any references to it in the code below. 


I will continue to document this further as soon as I get the chance, please email us at <a href="https://cinqmarsmedia.com">cinqmarsmedia.org</a> with any questions or feel free to open up issues and I'll get to them asap. Thanks!
