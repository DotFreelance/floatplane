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
    this._events = [];
    this._timerMessage = new PIXI.Text(
      "Time: 00:00",
      {fontFamily: "Arial", fontSize: 32, fill: "black"}
    );
    this._interval = null;
    // Add the timer to the gameScene on creation
    this._timerMessage.position.set(GAME_WIDTH-this._timerMessage.width-10, this._timerMessage.height+20);
    stage.addChild(this._timerMessage);

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
  }
  stop(){
    clearInterval(this._interval);
  }
  whiteText(){
    this._timerMessage.style = {fontFamily: "Arial", fontSize: 32, fill: "white"};
  }
  blackText(){
    this._timerMessage.style = {fontFamily: "Arial", fontSize: 32, fill: "black"};
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
      {fontFamily: "Arial", fontSize: 32, fill: "black"}
    );
    this.scoreMessage.position.set(GAME_WIDTH-this.scoreMessage.width-10, 10);
    stage.addChild(this.scoreMessage);
  }
  addToScore(points){
    this.score += points;
    this.scoreMessage.text = "Score: " + this.score;
    this.scoreMessage.position.x = GAME_WIDTH-this.scoreMessage.width-10;
  }
  whiteText(){
    this.scoreMessage.style = {fontFamily: "Arial", fontSize: 32, fill: "white"};
  }
  blackText(){
    this.scoreMessage.style = {fontFamily: "Arial", fontSize: 32, fill: "black"};
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
    this.flies = INSECT_START_FLY;
    this.ladybugs = INSECT_START_LADYBUG;
    this.wasps = INSECT_START_WASP;
  }
  initSpawn(){
    // Spawn initial flies
    for(let i = 0; i < this.flies; i++){
      this.spawn(new Fly());
    }
    // Spawn initial ladybugs
    for(let i = 0; i < this.ladybugs; i++){
      this.spawn(new Ladybug());
    }
    // Spawn initial wasps
    for(let i = 0; i < this.wasps; i++){
      this.spawn(new Wasp());
    }
    // Initiate the spawn monitor
    gameTimer.addEvent(5, function(){
      insectSpawner.spawnMonitor();
    });
  }
  spawnMonitor(){
    console.log("Spawnitor");

    gameTimer.addEvent(5, function(){
      insectSpawner.spawnMonitor();
    });
  }
  spawn(newInsect){
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
      this.insects.splice(index, 1);
    }
  }
}
