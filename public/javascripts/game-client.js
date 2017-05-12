// Globals
var stats = new Stats();

/*
* The PIXI game assets loader
*/
PIXI.loader
  .add("images/player-sprites/frog.png")
  .add("images/insect-sprites/fly.png")
  .add("images/insect-sprites/ladybug.png")
  .add("images/insect-sprites/bee.png")
  .add("images/static-sprites/lilypad.png")
  .add("images/ui-sprites/bog-brunch-title.png")
  .add("images/ui-sprites/play-button.png")
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

  // Create the stage
  stage = new PIXI.Container();

  // Create the title scene
  titleScene = new PIXI.Container();

  // Create the main gameScene
  gameScene = new PIXI.Container();

  // Create the gameOverScene
  gameOverScene = new PIXI.Container();

  // Title Logo
  let titleLogo = new PIXI.Sprite(
    PIXI.loader.resources["images/ui-sprites/bog-brunch-title.png"].texture
  );
  titleLogo.anchor.set(0.5);
  titleLogo.position.set(GAME_WIDTH/2, GAME_HEIGHT/2-titleLogo.height/2);
  titleScene.addChild(titleLogo);

  // Play button
  let playButton = new PIXI.Sprite(
    PIXI.loader.resources["images/ui-sprites/play-button.png"].texture
  );
  playButton.interactive = true;
  playButton.buttonMode = true;
  playButton.on("pointerdown", startGame);
  playButton.anchor.set(0.5);
  playButton.position.set(GAME_WIDTH/2, GAME_HEIGHT/2+playButton.height/2);
  titleScene.addChild(playButton);

  // Add the game over message to the end scene
  gameOverMessage = new PIXI.Text(
    "GAME OVER!",
    {fontFamily: "Arial", fontSize: 60, fill: "white"}
  );
  gameOverMessage.position.set(GAME_WIDTH/2-gameOverMessage.width/2, GAME_HEIGHT/2-gameOverMessage.height/2);
  gameOverScene.addChild(gameOverMessage);

  // Add the scenes to the stage
  stage.addChild(titleScene);
  stage.addChild(gameScene);
  stage.addChild(gameOverScene);

  // Set up the layers
  gameScene.displayList = new PIXI.DisplayList();
  tongueGroup = new PIXI.DisplayGroup(0, true);
  interactiveGroup = new PIXI.DisplayGroup(1, true);
  staticGroup = new PIXI.DisplayGroup(-1, true);

  //Create the renderer
  renderer = PIXI.autoDetectRenderer(GAME_WIDTH, GAME_HEIGHT);
  renderer.backgroundColor = GAME_BACKGROUND_COLOR;
  renderer.view.style.border = "1px dashed black";

  //Add the canvas to the HTML document
  document.body.appendChild(renderer.view);

  // Add the stats panel over the renderer
  document.body.appendChild(stats.dom);
  stats.dom.style.left = "60px";
  stats.dom.style.top = "135px";

  // Setup player controls
  bindPlayerKeys();

  // Set the game state
  gameState = title;

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
* The title intro
*/
function title(){
  titleScene.visible = true;
  gameScene.visible = false;
  gameOverScene.visible = false;
  renderer.backgroundColor = GAME_TITLE_BACKGROUND_COLOR;
}

/*
* The play-state action loop
*/
function play(){
  // Frame delta
  let delta = gameTimer.getDelta();
  /*
  * Player
  */
  // Run attack sequence
  if(player.attacking){
    playerAttackAnimation(delta);
  }
  // Apply movement and rotation, checking that we're within game bounds
  else if(!contain(player.sprite, MAP_CONTAINER)){
    // Apply player direction
    player.sprite.rotation = player.vx == 0 && player.vy == 0 ? player.sprite.rotation : Math.atan2(player.vx, -player.vy);
    // Move player
    player.sprite.x += player.vx * (delta / 1000);
    player.sprite.y += player.vy * (delta / 1000);
  }
  /*
  * insects
  */
  for(let insect of insectSpawner.insects){
    // Check for collision between player and enemy
    if(insect.isEnemy){
      if(hitTestRectangle(player.sprite, insect.sprite) && !player.invin){
        endGame();
      }
    }
    // Constrain/Move insects
    let insectCollision = contain(insect.sprite, MAP_CONTAINER);
    if(insectCollision === "top" || insectCollision === "bottom"){
      insect.vy *= -1;
    } else if(insectCollision === "left" || insectCollision === "right"){
      insect.vx *= -1;
    } else {
      // Move insect
      insect.sprite.x += insect.vx * (delta / 1000);
      insect.sprite.y += insect.vy * (delta / 1000);
    }
    // Apply insect direction
    insect.sprite.rotation = insect.vx == 0 && insect.vy == 0 ? insect.sprite.rotation : Math.atan2(insect.vx, -insect.vy);
  }
}

/*
* The game-end action loop
*/
function end(){
  // Just displays the existing message
}

/*
* Player attack animation
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
* Set up the game to begin
*/
function startGame(){
  // Lay out the static sprites
  staticSpriteLayout();

  // Create the scorekeeper
  scoreKeeper = new ScoreKeeper();

  // Create the timer
  gameTimer = new Timer();

  // Instantiate the player with player sprite
  player = new Player();
  player.sprite.displayGroup = interactiveGroup;
  // Turn off invin after a few seconds
  gameTimer.addEvent(3, function(){ player.invin = false; });

  // Create InsectSpawner and initialize the gameboard with spawns
  insectSpawner = new InsectSpawner();
  insectSpawner.initSpawn();

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
  // Stop the timer and set to end
  gameTimer.stop();
  gameTimer.whiteText();
  scoreKeeper.whiteText();
  gameState = end;
}
