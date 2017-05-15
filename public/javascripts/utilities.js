
/*
* Set up the game to begin
*/
function startGame(){
  // Setup player controls
  bindPlayerKeys();

  // Lay out the static sprites
  staticSpriteLayout();

  // Use black audio icons
  audioHelper.blackIcons();

  // Create the timer
  gameTimer = new Timer();

  // Create the scorekeeper
  scoreKeeper = new ScoreKeeper();

  // Instantiate the player with player sprite
  player = new Player();
  player.sprite.displayGroup = interactiveGroup;
  // Turn off invin after a few seconds
  gameTimer.addEvent(3, function(){ player.invin = false; });

  // Create InsectSpawner and initialize the gameboard with spawns
  insectSpawner = new InsectSpawner();
  insectSpawner.initSpawn();

  // Spawn some ripples
  rippleSpawner = new RippleSpawner();
  rippleSpawner.initSpawn();

  // Start the main music
  audioHelper.startGameMusic();

  // Make the correct scenes visible
  titleScene.visible = false;
  gameScene.visible = true;
  gameOverScene.visible = false;
  // Set the background
  renderer.backgroundColor = GAME_BACKGROUND_COLOR;
  // Start the timer and set to play
  gameTimer.start();
  gameState = play;
}

/*
* Set up the game to end
*/
function endGame(){
  // Make the correct scenes visible
  titleScene.visible = false;
  gameScene.visible = false;
  gameOverScene.visible = true;
  // Set the background
  renderer.backgroundColor = GAME_OVER_BACKGROUND_COLOR;
  // Use white audio icons
  audioHelper.whiteIcons();
  // Add the game over message to the end scene
  gameOverMessage = new PIXI.Text(
    "GAME OVER!",
    {fontFamily: GAME_FONT, fontSize: 60, fill: 0xEA212E}
  );
  gameOverMessage.position.set(GAME_WIDTH/2-gameOverMessage.width/2, GAME_HEIGHT/2-gameOverMessage.height);
  gameOverScene.addChild(gameOverMessage);
  // Create a score ScoreSubmitter
  scoreSubmitter = new ScoreSubmitter();
  // Bind the end-game keys
  bindEndKeys();
  // Stop the timer and set to end
  gameTimer.stop();
  gameTimer.whiteText();
  scoreKeeper.whiteText();
  gameState = end;
}

/*
* Initialize the game with the necessary objects
*/
function initGame(){
  // Bind the keys for the title screen
  bindTitleKeys();

  // Initialize the audio helper
  audioHelper = new AudioHelper(audioHelper ? audioHelper.isMuted() : false);

  audioHelper.stopGameMusic();
  // Play the intro music
  audioHelper.startIntroMusic();

  // Setup the title screen
  titleScene.visible = true;
  gameScene.visible = false;
  gameOverScene.visible = false;
  renderer.backgroundColor = GAME_TITLE_BACKGROUND_COLOR;

  // Set the game state
  gameState = title;
}

/*
* Reset the game
*/
function resetGame(){
  // Clear scenes
  gameScene.removeChildren();
  uiScene.removeChildren();
  // Initialize a new game
  initGame();
}

/*
* Player attack animation and hit testing
*/
function playerAttackAnimation(delta){
  let prevAttackCounter = player.attackCounter;
  player.attackCounter += (delta / 1000);
  let t = player.attackCounter / PLAYER_ATTACK_ANIMATION_LENGTH;
  if(prevAttackCounter == 0){
    // Create the two parts of the tongue
    playerTongue = new PIXI.Graphics();
    playerTongueTip = new PIXI.Graphics();
    playerTongue.lineStyle(PLAYER_TONGUE_WIDTH, PLAYER_TONGUE_COLOR, 1);
    playerTongueTip.lineStyle(0, PLAYER_TONGUE_COLOR, 1);
    // Draw the tongue line
    playerTongue.moveTo(PLAYER_MOUTH_X, PLAYER_MOUTH_Y);
    playerTongue.lineTo(PLAYER_MOUTH_X, PLAYER_MOUTH_Y - PLAYER_TONGUE_LENGTH * t);
    // Draw the tongue tip
    playerTongueTip.beginFill(PLAYER_TONGUE_COLOR, 1);
    playerTongueTip.drawCircle(PLAYER_MOUTH_X, PLAYER_MOUTH_Y + 10 - PLAYER_TONGUE_LENGTH * t, 20);
    playerTongueTip.endFill();
    // Add both parts to the player sprite
    player.sprite.addChild(playerTongue);
    player.sprite.addChild(playerTongueTip);
    // Add both parts to the tongue layer
    playerTongue.displayGroup = tongueGroup;
    playerTongueTip.displayGroup = tongueGroup;

  } else if(player.attackCounter > PLAYER_ATTACK_ANIMATION_LENGTH){

    player.sprite.removeChild(playerTongue);
    player.sprite.removeChild(playerTongueTip);
    player.attacking = false;
    player.attackCounter = 0;

  } else {
    // Draw the tongue line
    playerTongue.moveTo(PLAYER_MOUTH_X, PLAYER_MOUTH_Y);
    playerTongue.lineTo(PLAYER_MOUTH_X, PLAYER_MOUTH_Y - PLAYER_TONGUE_LENGTH * t);
    // Move the tongue tip to the end of the tongue
    playerTongueTip.y = -PLAYER_TONGUE_LENGTH * t;
    // Add the new tongue line
    player.sprite.addChild(playerTongue);
    // Add new tongue line to tongue layer
    playerTongue.displayGroup = tongueGroup;
    // Test for a hit between the tongue tip and the insects
    for(let insect of insectSpawner.insects){
      if(hitTestRectangle(playerTongueTip, insect.sprite)){
        player.sprite.removeChild(playerTongue);
        player.sprite.removeChild(playerTongueTip);
        player.attacking = false;
        player.attackCounter = 0;
        player.eat(insect);
      }
    }
  }
}

/*
* Static Sprite layout happens here.
* Static sprites are any texture or sprite that just adds flavor to the world.
*/
function staticSpriteLayout(){

  // Lilypads
  for(let n = 0; n < STATIC_SPRITES_LAYOUT.lilypads.length; n++){
    let newLilypad = new PIXI.Sprite(
      PIXI.loader.resources["images/static-sprites/lilypad.png"].texture
    );
    gameScene.addChild(newLilypad);
    newLilypad.anchor.set(0.5);
    newLilypad.scale.set(STATIC_SPRITES_LAYOUT.lilypads[n].scale);
    newLilypad.rotation = STATIC_SPRITES_LAYOUT.lilypads[n].rotation;
    newLilypad.position.set(STATIC_SPRITES_LAYOUT.lilypads[n].x, STATIC_SPRITES_LAYOUT.lilypads[n].y);
    newLilypad.displayGroup = staticGroup;
  }
}

/*
* Functionality for binding keys
* Code taken from: https://github.com/kittykatattack/learningPixi#sprites
*/

function keyboard(keyCode) {
  var key = {};
  key.code = keyCode;
  key.isDown = false;
  key.isUp = true;
  key.press = undefined;
  key.release = undefined;
  //The `downHandler`
  key.downHandler = function(event) {
    if (event.keyCode === key.code) {
      if (key.isUp && key.press) key.press();
      key.isDown = true;
      key.isUp = false;
    }
    event.preventDefault();
  };

  //The `upHandler`
  key.upHandler = function(event) {
    if (event.keyCode === key.code) {
      if (key.isDown && key.release) key.release();
      key.isDown = false;
      key.isUp = true;
    }
    event.preventDefault();
  };

  //Attach event listeners
  key.downEvent = key.downHandler.bind(key);
  key.upEvent = key.upHandler.bind(key);
  window.addEventListener(
    "keydown", key.downEvent, false
  );
  window.addEventListener(
    "keyup", key.upEvent, false
  );

  boundKeys.push(key);

  return key;
}

/*
* Unbind all keys so we can start fresh
*/
function unbindAllKeys(){
  // Remove event listeners from all bound keys
  for(let boundKey of boundKeys){
    window.removeEventListener(
      "keydown", boundKey.downEvent, false
    );
    window.removeEventListener(
      "keyup", boundKey.upEvent, false
    );
  }
  boundKeys = [];
}

/*
* Title Screen key-binding procedure
*/
function bindTitleKeys(){
  unbindAllKeys();

  // Space or enter to start the game
  keyboard(32).press = function() {
    startGame();
  }
  keyboard(13).press = function() {
    startGame();
  }
  // M to mute/unmute audio
  keyboard(77).press = function() {
    audioHelper.isMuted() ? audioHelper.unmute() : audioHelper.mute();
  }
}

/*
* End Screen key-binding procedure
*/
function bindEndKeys(){
  unbindAllKeys();

  // Letters
  for(let i = 65; i <= 90; i++){
    keyboard(i).press = function() {
      scoreSubmitter.typeLetter(i);
    }
  }
  // Numbers
  for(let i = 48; i <= 57; i++){
    keyboard(i).press = function() {
      scoreSubmitter.typeLetter(i);
    }
  }
  // Backspace
  keyboard(8).press = function() {
    scoreSubmitter.eraseLetter();
  }
  // Enter to submit
  keyboard(13).press = function() {
    scoreSubmitter.submit();
    resetGame();
  }
}

/*
* Player key-binding procedure
*/
function bindPlayerKeys(){
  unbindAllKeys();

  var left = keyboard(37),
      up = keyboard(38),
      right = keyboard(39),
      down = keyboard(40),
      attack = keyboard(32);

  left.press = function() {
    player.vx = -PLAYER_VELOCITY;
  };
  left.release = function() {
    if (!right.isDown) {
      player.vx = 0;
    }
  };

  up.press = function() {
    player.vy = -PLAYER_VELOCITY;
  };
  up.release = function() {
    if (!down.isDown) {
      player.vy = 0;
    }
  };

  right.press = function() {
    player.vx = PLAYER_VELOCITY;
  };
  right.release = function() {
    if (!left.isDown) {
      player.vx = 0;
    }
  };

  down.press = function() {
    player.vy = PLAYER_VELOCITY;
  };
  down.release = function() {
    if (!up.isDown) {
      player.vy = 0;
    }
  };

  attack.press = function() {
    player.attack();
  }
  // M to mute/unmute audio
  keyboard(77).press = function() {
    audioHelper.isMuted() ? audioHelper.unmute() : audioHelper.mute();
  }
}

/*
* Functionality for containing a sprite within bounds
* Code taken from: https://github.com/kittykatattack/learningPixi#sprites
*/
function contain(sprite, container) {

  var collision = undefined;

  //Left
  if (sprite.x - sprite.width * sprite.anchor.x < container.x) {
    sprite.x = container.x + sprite.width * sprite.anchor.x;
    collision = "left";
  }

  //Top
  if (sprite.y - sprite.height * sprite.anchor.y < container.y) {
    sprite.y = container.y + sprite.height * sprite.anchor.y;
    collision = "top";
  }

  //Right
  if (sprite.x + sprite.width * sprite.anchor.x > container.width) {
    sprite.x = container.width - sprite.width * sprite.anchor.x;
    collision = "right";
  }

  //Bottom
  if (sprite.y + sprite.height * sprite.anchor.y > container.height) {
    sprite.y = container.height - sprite.height * sprite.anchor.y;
    collision = "bottom";
  }

  //Return the `collision` value
  return collision;
}

/*
* Simple random integer generator
* Code taken from: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
*/
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

/*
* Rectangle hit test function.
* Code modified from: https://github.com/kittykatattack/learningPixi#casestudy
*/
function hitTestRectangle(r1, r2) {

  //Define the variables we'll need to calculate
  var hit, combinedHalfWidths, combinedHalfHeights, vx, vy, globalZero;

  //hit will determine whether there's a collision
  hit = false;

  //Find the center points of each sprite
  globalZero = new PIXI.Point(0, 0);
  r1.centerX = r1.toGlobal(globalZero).x;
  r1.centerY = r1.toGlobal(globalZero).y;
  r2.centerX = r2.toGlobal(globalZero).x;
  r2.centerY = r2.toGlobal(globalZero).y;

  // Find the half-widths and half-heights of each sprite
  // note: modiified the width and height by a descale factor found in globals.js
  r1.halfWidth = r1.width*HITBOX_SIZE_FACTOR / 2;
  r1.halfHeight = r1.height*HITBOX_SIZE_FACTOR / 2;
  r2.halfWidth = r2.width*HITBOX_SIZE_FACTOR / 2;
  r2.halfHeight = r2.height*HITBOX_SIZE_FACTOR / 2;

  //Calculate the distance vector between the sprites
  vx = r1.centerX - r2.centerX;
  vy = r1.centerY - r2.centerY;

  //Figure out the combined half-widths and half-heights
  combinedHalfWidths = r1.halfWidth + r2.halfWidth;
  combinedHalfHeights = r1.halfHeight + r2.halfHeight;

  //Check for a collision on the x axis
  if (Math.abs(vx) < combinedHalfWidths) {

    //A collision might be occuring. Check for a collision on the y axis
    if (Math.abs(vy) < combinedHalfHeights) {

      //There's definitely a collision happening
      hit = true;
    } else {

      //There's no collision on the y axis
      hit = false;
    }
  } else {

    //There's no collision on the x axis
    hit = false;
  }

  //`hit` will be either `true` or `false`
  return hit;
};
/*
* Update Scoreboard makes an XHR request to the back end to retrieve a partial and inject it to live update
*/
function updateScoreboard() {
  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function(){
    if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
      document.getElementById("scores-insert").innerHTML = JSON.parse(this.responseText).rendered;
    }
  };
  xhr.open("GET", "/api/highscores", true);
  xhr.send();
};
