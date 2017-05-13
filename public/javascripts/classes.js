/*
* Player Object
*/
class Player {
  constructor(sprite){
    this.sprite = new PIXI.Sprite(
      PIXI.loader.resources["images/player-sprites/frog.png"].texture
    );
    this.vx = 0;
    this.vy = 0;
    this.invin = true;
    this.attacking = false;
    this.attackCounter = 0;
    this.sprite.anchor.set(0.5);
    this.sprite.scale.set(0.35);
    this.sprite.position.set(GAME_WIDTH/2, GAME_HEIGHT/2);
    gameScene.addChild(this.sprite);
  }
  attack(){
    this.attacking = true;
  }
  eat(insect){
    if(insect.isEnemy){
      endGame();
    } else {
      scoreKeeper.addToScore(insect.pointValue);
      gameScene.removeChild(insect.sprite);
      insectSpawner.removeInsect(insect);
    }
  }
}

/*
* Timer Object
*/
class Timer {
  constructor(){
    this._start = (new Date()).getTime();
    this._time = 0;
    this._delta = 0;
    this._events = [];
    this._timerMessage = new PIXI.Text(
      "Time: 00:00",
      {fontFamily: GAME_FONT, fontSize: 32, fill: "black"}
    );
    this._interval = null;
    // Add the timer to the gameScene on creation
    this._timerMessage.position.set(GAME_WIDTH-this._timerMessage.width-10, this._timerMessage.height+20);
    uiScene.addChild(this._timerMessage);

    // Create a custom variant of setInterval to solve the "this" problem
    // Modified from: https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setInterval#The_this_problem
    var __nativeSI__ = window.setInterval;
    this.setInterval = function(vCallback, nDelay) {
      var oThis = this, aArgs = Array.prototype.slice.call(arguments, 2);
      return __nativeSI__(vCallback instanceof Function ? function () {
        vCallback.apply(oThis, aArgs);
      } : vCallback, nDelay);
    };
  }
  getSeconds(){
    return Math.floor(this._time / 1000);
  }
  getDelta(){
    let current = (new Date()).getTime();
    let delta = current - this._delta;
    this._delta = current;
    return delta;
  }
  updateTimer(){
    // Update the externally available time property
    this._time = (new Date()).getTime() - this._start;
    // Obtain the human readable seconds and minutes
    let currentSeconds = Math.floor(this._time / 1000);
    let currentMinutes = Math.floor(currentSeconds / 60);
    currentSeconds = currentSeconds - (currentMinutes * 60);
    // Set the updated message and reposition the timer
    this._timerMessage.text = "Timer: " +
      (currentMinutes < 10 ? "0" + currentMinutes : currentMinutes)
       + ":" +
       (currentSeconds < 10 ? "0" + currentSeconds : currentSeconds);
    this._timerMessage.position.x = GAME_WIDTH-this._timerMessage.width-10;
    this.executeEvents();
  }
  start(){
    this._interval = this.setInterval(this.updateTimer, 100);
    this._delta = (new Date()).getTime();
  }
  stop(){
    clearInterval(this._interval);
  }
  whiteText(){
    this._timerMessage.style = {fontFamily: GAME_FONT, fontSize: 32, fill: "white"};
  }
  blackText(){
    this._timerMessage.style = {fontFamily: GAME_FONT, fontSize: 32, fill: "black"};
  }
  addEvent(secondsFromNow, toExecute){
    this._events.push({created: this._time, seconds: secondsFromNow, toExecute: toExecute, params: Array.prototype.slice.call(arguments, 2)});
  }
  executeEvents(){
    for(let event of this._events){
      if(event.seconds <= ((this._time - event.created) / 1000)){
        event.toExecute.apply(this, event.params);
        this._events.splice(this._events.indexOf(event), 1);
      }
    }
  }
}

/*
* ScoreKeeper Object
*/
class ScoreKeeper {
  constructor(){
    this.score = 0;
    this.scoreMessage = new PIXI.Text(
      "Score: " + this.score,
      {fontFamily: GAME_FONT, fontSize: 32, fill: "black"}
    );
    this.scoreMessage.position.set(GAME_WIDTH-this.scoreMessage.width-10, 10);
    uiScene.addChild(this.scoreMessage);
  }
  addToScore(points){
    this.score += points;
    this.scoreMessage.text = "Score: " + this.score;
    this.scoreMessage.position.x = GAME_WIDTH-this.scoreMessage.width-10;
  }
  whiteText(){
    this.scoreMessage.style = {fontFamily: GAME_FONT, fontSize: 32, fill: "white"};
  }
  blackText(){
    this.scoreMessage.style = {fontFamily: GAME_FONT, fontSize: 32, fill: "black"};
  }
}

/*
* ScoreSubmitter Object
*/
class ScoreSubmitter {
  constructor(){
    this.name = "_";
    this.submitted = false;
    this.nameEntryMessage = new PIXI.Text(
      "Name: " + this.name,
      {fontFamily: GAME_FONT, fontSize: 32, fill: "white"}
    );
    this.nameEntryMessage.position.set(GAME_WIDTH/2-this.nameEntryMessage.width/2, GAME_HEIGHT/2-this.nameEntryMessage.height/2+50);
    uiScene.addChild(this.nameEntryMessage);
  }
  typeLetter(asciiCode){
    if(this.name.length >= 21) return;
    this.name = this.name.substring(0, this.name.length-1) + String.fromCharCode(asciiCode) + "_";
    this.nameEntryMessage.text = "Name: " + this.name;
    this.nameEntryMessage.position.x = GAME_WIDTH/2-this.nameEntryMessage.width/2;
  }
  eraseLetter(){
    this.name = this.name.substring(0, this.name.length-2) + "_";
    this.nameEntryMessage.text = "Name: " + this.name;
    this.nameEntryMessage.position.x = GAME_WIDTH/2-this.nameEntryMessage.width/2;
  }
  submit(){
    if(!this.submitted){
      this.submitted = true;
      let xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/highscores", true);
      xhr.setRequestHeader("Content-type", "application/json");
      xhr.send(JSON.stringify({
        playerName: this.name.length > 1 ? this.name.substring(0, this.name.length-1) : PLAYER_NO_NAME,
        playerScore: scoreKeeper.score,
        playerTime: gameTimer.getSeconds()
      }));
    }
  }
}

/*
* Insect Object
*/
class Insect{
  constructor(name, sprite, points) {
    this.name = name ? name : "Insect";
    this.sprite = sprite ? sprite : null;
    this.vx = 0;
    this.vy = 0;
    this.pointValue = points ? points : INSECT_DEFAULT_POINTS;
    this.isEnemy = false;
    if(this.sprite){
      this.sprite.anchor.set(0.5);
    }
  }
  moveRandom(){
    // Prevent the insect from unluckily generating 0 movement
    while(this.vx == 0 && this.vy == 0){
      this.vx = getRandomInt(-INSECT_VELOCITY, INSECT_VELOCITY);
      this.vy = getRandomInt(-INSECT_VELOCITY, INSECT_VELOCITY);
    }
  }
}
/*
* Fly Object
*/
class Fly extends Insect {
  constructor(){
    super("Fly", new PIXI.Sprite(
      PIXI.loader.resources["images/insect-sprites/fly.png"].texture
    ), 25);
    this.sprite.scale.set(0.1);
  }
}
/*
* Ladybug Object
*/
class Ladybug extends Insect {
  constructor(){
    super("Ladybug", new PIXI.Sprite(
      PIXI.loader.resources["images/insect-sprites/ladybug.png"].texture
    ), 50);
    this.sprite.scale.set(0.1);
  }
}
/*
* Wasp Object
*/
class Wasp extends Insect {
  constructor(){
    super("Wasp", new PIXI.Sprite(
      PIXI.loader.resources["images/insect-sprites/bee.png"].texture
    ), 0);
    this.isEnemy = true;
    this.sprite.scale.set(0.1);
  }
}
/*
* InsectSpawner Object
* Maintains the number of insects in play
*/

class InsectSpawner {
  constructor(){
    this.insects = [];
    this.flies = 0;
    this.ladybugs = 0;
    this.wasps = 0;
    this.fliesMax = INSECT_START_FLY;
    this.ladybugsMax = INSECT_START_LADYBUG;
    this.waspsMax = INSECT_START_WASP;
  }
  initSpawn(){
    // Spawn initial flies
    for(let i = 0; i < this.fliesMax; i++){
      this.spawn(new Fly());
    }
    // Spawn initial ladybugs
    for(let i = 0; i < this.ladybugsMax; i++){
      this.spawn(new Ladybug());
    }
    // Spawn initial wasps
    for(let i = 0; i < this.waspsMax; i++){
      this.spawn(new Wasp());
    }
    // Initiate the spawn monitor
    gameTimer.addEvent(5, function(){
      insectSpawner.spawnMonitor();
    });
    // Add all of the difficulty stages to the event list
    for(let difficulty of STAGES_OF_DIFFICULTY){
      gameTimer.addEvent(difficulty.time, function(spawner, difficultyStage){
        spawner.fliesMax = difficultyStage.flies;
        spawner.ladybugsMax = difficultyStage.ladybugs;
        spawner.waspsMax = difficultyStage.wasps;
      }, this, difficulty);
    }
  }
  spawnMonitor(){
    let ladybugChance = getRandomInt(1, 10);
    if(ladybugChance <= INSECT_LADYBUG_SPAWN_CHANCE && this.ladybugs < this.ladybugsMax){
      this.spawn(new Ladybug());
    } else if(this.flies < this.fliesMax){
      this.spawn(new Fly());
    }
    if(this.wasps < this.waspsMax){
      this.spawn(new Wasp());
    }

    gameTimer.addEvent(3, function(){
      insectSpawner.spawnMonitor();
    });
  }
  spawn(newInsect){
    if(newInsect instanceof Fly){
      this.flies++;
    } else if(newInsect instanceof Ladybug){
      this.ladybugs++;
    } else if(newInsect instanceof Wasp){
      this.wasps++;
    }
    gameScene.addChild(newInsect.sprite);
    newInsect.sprite.position.set(GAME_WIDTH*getRandomInt(2, 9)/10, GAME_HEIGHT*getRandomInt(2, 9)/10);
    newInsect.sprite.displayGroup = interactiveGroup;
    this.insects.push(newInsect);
    newInsect.moveRandom();
  }
  removeInsect(insect){
    // Remove from insects array
    let index = this.insects.indexOf(insect);
    if(index > -1){
      if(insect instanceof Fly){
        this.flies--;
      } else if(insect instanceof Ladybug){
        this.ladybugs--;
      }
      this.insects.splice(index, 1);
    }
  }
}
