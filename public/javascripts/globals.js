const GAME_WIDTH = 900,
      GAME_HEIGHT = 900,
      GAME_TITLE_BACKGROUND_COLOR = 0x000000,
      GAME_BACKGROUND_COLOR = 0xCEEAE9,
      GAME_OVER_BACKGROUND_COLOR = 0x000000,
      PLAYER_VELOCITY = 3,
      PLAYER_TONGUE_COLOR = 0xFF9999,
      PLAYER_TONGUE_WIDTH = 24,
      PLAYER_TONGUE_LENGTH = 400,
      PLAYER_MOUTH_Y = -105,
      PLAYER_MOUTH_X = -8,
      PLAYER_ATTACK_ANIMATION_LENGTH = 15,
      INSECT_DEFAULT_POINTS = 25,
      INSECT_VELOCITY = 3,
      INSECT_START_FLY = 3,
      INSECT_START_LADYBUG = 2,
      INSECT_START_WASP = 2,
      MAP_CONTAINER = {
        x: 0,
        y: 0,
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
      },
      STATIC_SPRITES_LAYOUT = {
        ripples: [],
        lilypads: [
          {x: GAME_WIDTH*2/10, y: GAME_HEIGHT/10, scale: 0.2, rotation: 0.0},
          {x: GAME_WIDTH*1.2/10, y: GAME_HEIGHT/10, scale: 0.13, rotation: 1.57},
          {x: GAME_WIDTH*3/10, y: GAME_HEIGHT*2/10, scale: 0.13, rotation: 3.75},
          {x: GAME_WIDTH*7/10, y: GAME_HEIGHT*2/10, scale: 0.2, rotation: 5.00},
          {x: GAME_WIDTH*2.5/10, y: GAME_HEIGHT*8/10, scale: 0.2, rotation: 5.00},
          {x: GAME_WIDTH*7.5/10, y: GAME_HEIGHT*8/10, scale: 0.2, rotation: 6.00},
          {x: GAME_WIDTH*8/10, y: GAME_HEIGHT*8.7/10, scale: 0.13, rotation: 4.10},
        ]
      };

// Game object Globals
var renderer, stage, titleScene, gameScene, gameOverScene, gameOverMessage, gameState, player, scoreKeeper,
    gameTimer, insectSpawner, playerTongue, playerTongueTip, testInsect;

// Global Groups
var tongueGroup = null;
var interactiveGroup = null;
var staticGroup = null;
