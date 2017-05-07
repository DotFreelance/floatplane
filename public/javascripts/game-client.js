// Globals
var stats = new Stats();
var GAME_WIDTH = 768, GAME_HEIGHT = 768,
    PLAYER_VELOCITY = 3;
var renderer, stage, gameState;

/*
* Player Object
*/
var player = {
  sprite: null,
  vx: 0,
  vy: 0,
};

/*
* The PIXI game assets loader
*/
PIXI.loader
  .add("images/player-sprites/prototype-frog.png")
  .on('progress', loadProgressHandler)
  .load(setup);

  /*
  * Loading Progress
  *
  * Performs an action whenever a resource is loaded.
  */
function loadProgressHandler(loader, resource) {
  console.log("loading... (" + loader.progress + "%)");
}

/*
* Initial Game Setup
*
* Called once the game is loaded and ready.
*/
function setup(){
  // Setup the stats monitor
  stats.showPanel(0);

  // Create sprites
  player.sprite = new PIXI.Sprite(
    PIXI.loader.resources["images/player-sprites/prototype-frog.png"].texture
  );

  //Create the renderer
  renderer = PIXI.autoDetectRenderer(GAME_WIDTH, GAME_HEIGHT);
  renderer.backgroundColor = 0xFFFFFF;
  renderer.view.style.border = "1px dashed black";

  //Add the canvas to the HTML document
  document.body.appendChild(renderer.view);

  // Add the stats panel over the renderer
  document.body.appendChild(stats.dom);
  stats.dom.style.left = "60px";
  stats.dom.style.top = "193px";

  //Create a container object called the 'stage'
  stage = new PIXI.Container();

  // Place sprites onto the stage
  stage.addChild(player.sprite);
  player.sprite.scale.set(0.25, 0.25);
  player.sprite.anchor.set(0.5, 0.5);
  player.sprite.position.set(GAME_WIDTH/2, GAME_HEIGHT/2);

  // Setup player controls
  bindPlayerKeys();

  // Set the game state
  gameState = play;

  // Begin running the game
  renderLoop();
}

/*
* Primary rendering loop
*/
function renderLoop(){
  //Loop this function at 60 frames per second
  requestAnimationFrame(renderLoop);
  // Show the stats panel
  stats.begin();

  gameState();

  //Render the stage to see the animation
  renderer.render(stage);
  stats.end();
}

/*
* The play-state action loop
*/
function play(){
  // Apply player direction
  player.sprite.rotation = player.vx == 0 && player.vy == 0 ? player.sprite.rotation : Math.atan2(player.vx, -player.vy);
  // Apply player movement action
  player.sprite.x += player.vx;
  player.sprite.y += player.vy
}

/*
* Player key-binding procedure
*/

function bindPlayerKeys(){
  var left = keyboard(37),
      up = keyboard(38),
      right = keyboard(39),
      down = keyboard(40);

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
}
