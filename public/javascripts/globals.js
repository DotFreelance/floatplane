const GAME_WIDTH = 900,
      GAME_HEIGHT = 900,
      GAME_TITLE_BACKGROUND_COLOR = 0x000000,
      GAME_BACKGROUND_COLOR = 0xCEEAE9,
      GAME_OVER_BACKGROUND_COLOR = 0x000000,
      GAME_FONT = "BadMedicine-Regular",
      HITBOX_SIZE_FACTOR = 0.7, // Decreasing this makes the hit-registry less sensitive
      PLAYER_NO_NAME = "unnamed",
      PLAYER_VELOCITY = 200,
      PLAYER_TONGUE_COLOR = 0xFF9999,
      PLAYER_TONGUE_WIDTH = 24,
      PLAYER_TONGUE_LENGTH = 400,
      PLAYER_MOUTH_Y = -105,
      PLAYER_MOUTH_X = -8,
      PLAYER_ATTACK_ANIMATION_LENGTH = 0.3,
      INSECT_DEFAULT_POINTS = 25,
      INSECT_VELOCITY = 200,
      INSECT_START_FLY = 3,
      INSECT_START_LADYBUG = 2,
      INSECT_START_WASP = 2,
      INSECT_LADYBUG_SPAWN_CHANCE = 2, // out of 10
      MAP_CONTAINER = {
        x: 0,
        y: 0,
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
      },
      // Add or remove the lilypads here
      STATIC_SPRITES_LAYOUT = {
        lilypads: [
          {x: GAME_WIDTH*2/10, y: GAME_HEIGHT/10, scale: 0.2, rotation: 0.0},
          {x: GAME_WIDTH*1.2/10, y: GAME_HEIGHT/10, scale: 0.13, rotation: 1.57},
          {x: GAME_WIDTH*3/10, y: GAME_HEIGHT*2/10, scale: 0.13, rotation: 3.75},
          {x: GAME_WIDTH*7/10, y: GAME_HEIGHT*2/10, scale: 0.2, rotation: 5.00},
          {x: GAME_WIDTH*2.5/10, y: GAME_HEIGHT*8/10, scale: 0.2, rotation: 5.00},
          {x: GAME_WIDTH*7.5/10, y: GAME_HEIGHT*8/10, scale: 0.2, rotation: 6.00},
          {x: GAME_WIDTH*8/10, y: GAME_HEIGHT*8.7/10, scale: 0.13, rotation: 4.10},
        ]
      },
      // At the time specified, sets the max number allowable of each insect type
      // Generally wasps go up while food goes down
      STAGES_OF_DIFFICULTY = [
        {time: 15, flies: 3, ladybugs: 2, wasps: 3},
        {time: 30, flies: 4, ladybugs: 2, wasps: 4},
        {time: 45, flies: 4, ladybugs: 1, wasps: 4},
        {time: 60, flies: 3, ladybugs: 1, wasps: 5},
      ];

// Game object Globals
var renderer, stage, titleScene, uiScene, gameScene, gameOverScene, gameOverMessage, gameState, player, scoreKeeper,
    scoreSubmitter, gameTimer, insectSpawner, playerTongue, playerTongueTip, testInsect, audioHelper, rippleSpawner;
var boundKeys = [];
var loaderChecklist = {
  graphics: false,
  audio: false
};
var stats = new Stats();

// Global Groups
var tongueGroup = null;
var interactiveGroup = null;
var staticGroup = null;
