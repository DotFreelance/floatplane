const GAME_WIDTH = 768,
      GAME_HEIGHT = 768,
      PLAYER_VELOCITY = 3,
      PLAYER_TONGUE_COLOR = 0xFF9999,
      PLAYER_TONGUE_WIDTH = 24,
      PLAYER_TONGUE_LENGTH = 400,
      PLAYER_MOUTH_Y = -105,
      PLAYER_MOUTH_X = -8,
      PLAYER_ATTACK_ANIMATION_LENGTH = 15,
      INSECT_DEFAULT_POINTS = 25,
      INSECT_VELOCITY = 3,
      MAP_CONTAINER = {
        x: 0,
        y: 0,
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
      };

// Game object Globals
var renderer, stage, gameState, player, scoreKeeper, playerTongue, playerTongueTip, testInsect;
