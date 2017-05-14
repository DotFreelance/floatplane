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
    audioHelper.tongueSound();
    if(insect.isEnemy){
      audioHelper.waspHitSound();
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
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/highscores", true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.onreadystatechange = function(){
      if(xhr.readyState == XMLHttpRequest.DONE){
        updateScoreboard();
      }
    };
    xhr.send(JSON.stringify({
      playerName: this.name.length > 1 ? this.name.substring(0, this.name.length-1) : PLAYER_NO_NAME,
      playerScore: scoreKeeper.score,
      playerTime: gameTimer.getSeconds()
    }));
  }
}

/*
* AudioHelper Object
*/
class AudioHelper {
  constructor(muteState){
    // Music
    this.introMusic = sounds['audio/music/BogBrunchIntroSong.mp3'];
    this.introMusic.loop = true;
    this.introMusic.volume = 0.2;

    this.gameMusic = sounds['audio/music/BBGameMusic.mp3'];
    this.gameMusic.loop = true;
    this.gameMusic.volume = 0.5;

    this.gameBgAudio = sounds['audio/music/coolcrickets.mp3'];
    this.gameBgAudio.loop = true;
    this.gameBgAudio.volume = 0.5;

    // Sound Effects
    this.tongue = sounds['audio/sound-effects/tongue-sound.mp3'];
    this.tongue.volume = 0.6;

    this.waspHit = sounds['audio/sound-effects/wasp-hit-sound.mp3'];

    // Mute/Unmute button-icon
    this.whiteOn = new PIXI.Sprite(
      PIXI.loader.resources["images/ui-sprites/audio-on-white.png"].texture
    );
    this.whiteOff = new PIXI.Sprite(
      PIXI.loader.resources["images/ui-sprites/audio-off-white.png"].texture
    );
    this.blackOn = new PIXI.Sprite(
      PIXI.loader.resources["images/ui-sprites/audio-on-black.png"].texture
    );
    this.blackOff = new PIXI.Sprite(
      PIXI.loader.resources["images/ui-sprites/audio-off-black.png"].texture
    );

    this.whiteOn.anchor.set(0.5);
    this.whiteOff.anchor.set(0.5);
    this.blackOn.anchor.set(0.5);
    this.blackOff.anchor.set(0.5);

    this.whiteOn.scale.set(0.2);
    this.whiteOff.scale.set(0.2);
    this.blackOn.scale.set(0.2);
    this.blackOff.scale.set(0.2);

    this.whiteOn.position.set(GAME_WIDTH/2, 30);
    this.whiteOff.position.set(GAME_WIDTH/2, 30);
    this.blackOn.position.set(GAME_WIDTH/2, 30);
    this.blackOff.position.set(GAME_WIDTH/2, 30);

    // Make the buttons clickable
    this.whiteOn.interactive = true;
    this.whiteOn.buttonMode = true;
    this.whiteOn.on("pointerdown", function(){ audioHelper.mute(); });
    this.whiteOff.interactive = true;
    this.whiteOff.buttonMode = true;
    this.whiteOff.on("pointerdown", function(){ audioHelper.unmute(); });
    this.blackOn.interactive = true;
    this.blackOn.buttonMode = true;
    this.blackOn.on("pointerdown", function(){ audioHelper.mute(); });
    this.blackOff.interactive = true;
    this.blackOff.buttonMode = true;
    this.blackOff.on("pointerdown", function(){ audioHelper.unmute(); });

    uiScene.addChild(this.whiteOn);
    uiScene.addChild(this.whiteOff);
    uiScene.addChild(this.blackOn);
    this.blackOn.visible = false;
    uiScene.addChild(this.blackOff);
    this.blackOff.visible = false;

    // Default to white icons
    this.audioOnButton = this.whiteOn;
    this.audioOffButton = this.whiteOff;

    let isAlreadyMuted = muteState == null ? false : muteState;
    if(isAlreadyMuted){
      this.audioOnButton.visible = false;
      this.audioOffButton.visible = true;
    } else {
      this.audioOnButton.visible = true;
      this.audioOffButton.visible = false;
    }
    this._mute = isAlreadyMuted;
  }
  mute(){
    this.gameMusic.pause();
    this.gameBgAudio.pause();
    this.introMusic.pause();
    this._mute = true;
    this.audioOnButton.visible = false;
    this.audioOffButton.visible = true;
  }
  unmute(){
    switch (gameState) {
      case play:
      case end:
        this.gameMusic.play();
        this.gameBgAudio.play();
        break;
      case title:
        this.introMusic.play();
        break;
    }
    this._mute = false;
    this.audioOnButton.visible = true;
    this.audioOffButton.visible = false;
  }
  whiteIcons(){
    // Set the white icons to visible or not depending on mute state
    this.whiteOn.visible = this.audioOnButton.visible;
    this.whiteOff.visible = this.audioOffButton.visible;
    // Assign the audiobuttons to be the white icons
    this.audioOnButton = this.whiteOn;
    this.audioOffButton = this.whiteOff;
    // Hide the black icons
    this.blackOn.visible = false;
    this.blackOff.visible = false;
  }
  blackIcons(){
    // Set the black icons to visible or not depending on mute state
    this.blackOn.visible = this.audioOnButton.visible;
    this.blackOff.visible = this.audioOffButton.visible;
    // Assign the audiobuttons to be the black icons
    this.audioOnButton = this.blackOn;
    this.audioOffButton = this.blackOff;
    // Hide the white icons
    this.whiteOn.visible = false;
    this.whiteOff.visible = false;
  }
  isMuted(){
    return this._mute;
  }
  startGameMusic(){
    if(!this._mute){
      // Fade out intro audio, fade in game audio
      this.introMusic.fadeOut(2);
      this.gameMusic.volume = 0.1;
      this.gameMusic.playFrom(0);
      this.gameMusic.fade(0.5, 2);
      this.gameBgAudio.playFrom(0);
    }
  }
  stopGameMusic(){
    this.gameMusic.pause();
    this.gameBgAudio.pause();
  }
  startIntroMusic(){
    if(!this._mute){
      this.introMusic.playFrom(0);
    }
  }
  stopIntroMusic(){
    this.introMusic.pause();
  }
  tongueSound(){
    if(!this._mute){
      this.tongue.play();
    }
  }
  waspHitSound(){
    if(!this._mute){
      this.waspHit.play();
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
/*
* Ripple Spawner
*/
class RippleSpawner{
  constructor(){
    this.ripples = [];
  }
  initSpawn(){
    gameTimer.addEvent(3, function(){
      rippleSpawner.rippleMonitor();
    });
  }
  rippleMonitor(){
    let numToSpawn = getRandomInt(0,3);

    for(let i = 0; i <= numToSpawn; i++){
      let randomX = getRandomInt(1,10);
      let randomY = getRandomInt(1,10);
      this.ripples.push(new Ripple(randomX/10*GAME_WIDTH, randomY/10*GAME_HEIGHT));
    }

    gameTimer.addEvent(3, function(){
      rippleSpawner.rippleMonitor();
    });
  }
  removeRipple(ripple){
    let index = this.ripples.indexOf(ripple);
    if(index > -1){
      this.ripples.splice(index, 1);
    }
  }
  animateAll(delta){
    for(let ripple of this.ripples){
      ripple.animate(delta);
    }
  }
}
/*
* Ripple Spawner
*/
class Ripple{
  constructor(posX, posY){
    this.x = posX;
    this.y = posY;
    this.innerRadius = 2;
    this.outerRadius = 8;
    this.alpha = 1;
    this.doneAnimating = false;
    this.circles = new PIXI.Graphics();
    this.circles.lineStyle(2, 0xFFFFFF, this.alpha);
    this.circles.drawCircle(this.x, this.y, this.innerRadius);
    this.circles.lineStyle(1, 0xFFFFFF, this.alpha);
    this.circles.drawCircle(this.x, this.y, this.outerRadius);
    this.circles.displayGroup = rippleGroup;
    gameScene.addChild(this.circles);
  }
  animate(delta){
    this.circles.clear();
    this.innerRadius += 50 * (delta/1000);
    this.outerRadius += 55 * (delta/1000);
    this.alpha -= 0.35 * (delta/1000);
    if(this.alpha > 0){
      this.circles.lineStyle(2, 0xFFFFFF, this.alpha);
      this.circles.drawCircle(this.x, this.y, this.innerRadius);
      this.circles.lineStyle(1, 0xFFFFFF, this.alpha);
      this.circles.drawCircle(this.x, this.y, this.outerRadius);
    } else {
      rippleSpawner.removeRipple(this);
    }
  }
}
