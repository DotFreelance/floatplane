
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
  .add("images/ui-sprites/play-button2.png")
  .add("images/ui-sprites/audio-on-black.png")
  .add("images/ui-sprites/audio-off-black.png")
  .add("images/ui-sprites/audio-on-white.png")
  .add("images/ui-sprites/audio-off-white.png")
  .on('progress', loadProgressHandler)
  .load(function(){
    // This loader sets itself to ready = true, then checks the others, if
    // the others aren't ready, it does nothing
    // This way the last loader is the one that ends up calling setup
    loaderChecklist.graphics = true;
    let ready = true;
    for(let key in loaderChecklist){
      if(!loaderChecklist[key]) ready = false;
    }
    if(ready) setup();
  });

/*
* kittykatattack sounds loader
*/
sounds.load([
  'audio/music/BogBrunchIntroSong.mp3',
  'audio/music/BBGameMusic.mp3',
  'audio/music/coolcrickets.mp3',
  'audio/sound-effects/tongue-sound.mp3',
  'audio/sound-effects/wasp-hit-sound.mp3'
]);
sounds.whenLoaded = function(){
  // This loader sets itself to ready = true, then checks the others, if
  // the others aren't ready, it does nothing
  // This way the last loader is the one that ends up calling setup
  loaderChecklist.audio = true;
  let ready = true;
  for(let key in loaderChecklist){
    if(!loaderChecklist[key]) ready = false;
  }
  if(ready) setup();
};

/*
* Loading Progress
*
* PIXI loading progress handler.
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

  // Create the UI scene
  uiScene = new PIXI.Container();

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
  titleLogo.position.set(GAME_WIDTH/2+20, GAME_HEIGHT/2.5-titleLogo.height/2);
  titleScene.addChild(titleLogo);

  // Play button
  var playButton = new PIXI.MovieClip([
    PIXI.loader.resources["images/ui-sprites/play-button.png"].texture,
    PIXI.loader.resources["images/ui-sprites/play-button2.png"].texture
  ]);
  playButton.interactive = true;
  playButton.buttonMode = true;
  stage.interactive = true;
  playButton.mouseover = function(data) {
    //Display the hover texture
    playButton.gotoAndStop(1);
  }
  playButton.mouseout = function(data) {
    //Display the normal texture
    playButton.gotoAndStop(0);
  }
  playButton.on("pointerdown", startGame);
  playButton.anchor.set(0.5);
  playButton.position.set(GAME_WIDTH/2, GAME_HEIGHT/2.3+playButton.height/2);
  titleScene.addChild(playButton);

  // Add the scenes to the stage
  stage.addChild(titleScene);
  stage.addChild(gameScene);
  stage.addChild(gameOverScene);
  stage.addChild(uiScene);

  // Set up the visual layers
  gameScene.displayList = new PIXI.DisplayList();
  tongueGroup = new PIXI.DisplayGroup(0, true);
  interactiveGroup = new PIXI.DisplayGroup(1, true);
  staticGroup = new PIXI.DisplayGroup(-1, true);
  rippleGroup = new PIXI.DisplayGroup(-2, true);

  //Create the renderer
  renderer = PIXI.autoDetectRenderer(GAME_WIDTH, GAME_HEIGHT);
  renderer.backgroundColor = GAME_BACKGROUND_COLOR;
  renderer.view.style.border = "1px dashed black";

  //Add the canvas to the HTML document
  document.getElementById("gameContainer").appendChild(renderer.view);

  // Add the stats panel over the renderer
  document.getElementById("stats-overlay").appendChild(stats.dom);
  stats.dom.style.position = "absolute";
  stats.dom.style.left = "4px";
  stats.dom.style.top = "4px";

  // Start the scoreboard refresher
  window.setInterval(updateScoreboard, 10000);

  // Initialize the game
  initGame();

  // Begin running the game render loop
  renderLoop();
}

/*
* Primary rendering loop
*
* This is where the game actually runs
*/
function renderLoop(){
  //Loop this function at <refresh_rate> frames per second
  requestAnimationFrame(renderLoop);
  // Record stats panel info (fps)
  stats.begin();

  // May be: title(), play(), or end()
  gameState();

  //Render the stage to see the animation
  renderer.render(stage);
  stats.end();
}




/*
* STATE: The title intro
*/
function title(){
  // Title scene has no rendering tasks
}

/*
* STATE: The play-state action loop
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
  * Insects
  */
  for(let insect of insectSpawner.insects){
    // Check for collision between player and enemy
    if(insect.isEnemy){
      if(hitTestRectangle(player.sprite, insect.sprite) && !player.invin){
        audioHelper.waspHitSound();
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
  /*
  * Ripples
  */
  rippleSpawner.animateAll(delta);
}

/*
* STATE: The game-end action loop
*/
function end(){
  // End game scene has no rendering tasks
}
