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
  // Remove event listeners
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

  //Find the half-widths and half-heights of each sprite
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
