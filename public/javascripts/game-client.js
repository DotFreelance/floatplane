// Globals
var stats = new Stats();

// Global Groups
var tongueGroup = null;
var interactiveGroup = null;
var staticGroup = null;

/*
* The PIXI game assets loader
*/
PIXI.loader
  .add("images/player-sprites/frog.png")
  .add("images/insect-sprites/fly.png")
  .add("images/insect-sprites/ladybug.png")
  .add("images/insect-sprites/bee.png")
  .add("images/static-sprites/cattail.png")
  .add("images/static-sprites/grass.png")
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

  //Create a container object called the 'stage'
  stage = new PIXI.Container();

  // Instantiate the player with player sprite
  player = new Player();

  // Create the scorekeeper
  scoreKeeper = new ScoreKeeper();

  // Set up the layers
  stage.displayList = new PIXI.DisplayList();
  tongueGroup = new PIXI.DisplayGroup(0, true);
  interactiveGroup = new PIXI.DisplayGroup(1, true);
  staticGroup = new PIXI.DisplayGroup(-1, true);
  // Player is in the interactive group
  player.sprite.displayGroup = interactiveGroup;

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

  // Test insect
  testInsect = new Fly(new PIXI.Sprite(
    PIXI.loader.resources["images/insect-sprites/fly.png"].texture
  ));
  stage.addChild(testInsect.sprite);
  testInsect.sprite.scale.set(0.1);
  testInsect.sprite.position.set(GAME_WIDTH/3, GAME_HEIGHT/3);
  testInsect.sprite.displayGroup = interactiveGroup;

  // Lay out the static sprites like the grass and cattails
  staticSpriteLayout();

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

  // Run attack sequence
  if(player.attacking){
    playerAttackAnimation();
  }
  // Apply movement and rotation, checking that we're within game bounds
  else if(!contain(player.sprite, MAP_CONTAINER)){
    // Apply player direction
    player.sprite.rotation = player.vx == 0 && player.vy == 0 ? player.sprite.rotation : Math.atan2(player.vx, -player.vy);
    // Move player
    player.sprite.x += player.vx;
    player.sprite.y += player.vy
  }

  spawnInsects();
}

/*
* Player attack animation
*/
function playerAttackAnimation(){
  player.attackCounter++;
  var t = player.attackCounter / PLAYER_ATTACK_ANIMATION_LENGTH;
  if(player.attackCounter == 1){
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
    // Test for a hit between the tongue tip and the fly
    if(hitTestRectangle(playerTongueTip, testInsect.sprite)){
      player.sprite.removeChild(playerTongue);
      player.sprite.removeChild(playerTongueTip);
      player.attacking = false;
      player.attackCounter = 0;
      player.eat(testInsect);
    }
  }
}

/*
* Static Sprite layout happens here.
* Static sprites are any texture or sprite that just adds flavor to the world.
*/
function staticSpriteLayout(){
  // Generate a few in predictable locations

  // Cattail 1
  let cattail = new PIXI.Sprite(
    PIXI.loader.resources["images/static-sprites/cattail.png"].texture
  );
  stage.addChild(cattail);
  cattail.scale.set(0.5);
  cattail.alpha = 0.7;
  cattail.position.set(GAME_WIDTH*3/4, GAME_HEIGHT-cattail.height);
  cattail.displayGroup = staticGroup;
  // Cattail 2
  cattail = new PIXI.Sprite(
    PIXI.loader.resources["images/static-sprites/cattail.png"].texture
  );
  stage.addChild(cattail);
  cattail.scale.set(0.5);
  cattail.alpha = 0.7;
  cattail.position.set(0, GAME_HEIGHT/2);
  cattail.displayGroup = staticGroup;
  // Grass 1
  let grass = new PIXI.Sprite(
    PIXI.loader.resources["images/static-sprites/grass.png"].texture
  );
  stage.addChild(grass);
  grass.scale.set(0.25);
  grass.alpha = 0.7;
  grass.position.set(GAME_WIDTH/2, 0);
  grass.displayGroup = staticGroup;
  // Grass 2
  grass = new PIXI.Sprite(
    PIXI.loader.resources["images/static-sprites/grass.png"].texture
  );
  stage.addChild(grass);
  grass.scale.set(0.25);
  grass.alpha = 0.7;
  grass.position.set(0, GAME_HEIGHT/3);
  grass.displayGroup = staticGroup;

  // Generate a few randoms
  var numCattails = getRandomInt(2, 7);
  var numGrass = getRandomInt(2, 7);
  for(let n = 0; n < numCattails; n++){
    let cattail = new PIXI.Sprite(
      PIXI.loader.resources["images/static-sprites/cattail.png"].texture
    );
    stage.addChild(cattail);
    cattail.scale.set(0.5);
    cattail.alpha = 0.7;
    cattail.position.set(getRandomInt(cattail.width, GAME_WIDTH-cattail.width), getRandomInt(cattail.height, GAME_HEIGHT-cattail.height));
    cattail.displayGroup = staticGroup;
  }
  for(let n = 0; n < numGrass; n++){
    let grass = new PIXI.Sprite(
      PIXI.loader.resources["images/static-sprites/grass.png"].texture
    );
    stage.addChild(grass);
    grass.scale.set(0.25);
    grass.alpha = 0.7;
    grass.position.set(getRandomInt(grass.width, GAME_WIDTH-grass.width), getRandomInt(grass.height, GAME_HEIGHT-grass.height));
    grass.displayGroup = staticGroup;
  }
}

function spawnInsects(){
}
