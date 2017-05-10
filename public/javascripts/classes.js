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
    this.attacking = false;
    this.attackCounter = 0;
    this.sprite.anchor.set(0.5);
    this.sprite.scale.set(0.35, 0.35);
    this.sprite.position.set(GAME_WIDTH/2, GAME_HEIGHT/2);
    stage.addChild(this.sprite);
  }
  attack(){
    this.attacking = true;
  }
  eat(insect){
    scoreKeeper.addToScore(insect.pointValue);
    stage.removeChild(insect);
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
      {fontFamily: "Arial", fontSize: 32, fill: "black"}
    );
    this.scoreMessage.position.set(GAME_WIDTH-this.scoreMessage.width-10, 10);
    stage.addChild(this.scoreMessage);
  }
  addToScore(points){
    this.score += points;
    this.scoreMessage.text = "Score: " + this.score;
    this.scoreMessage.position.x = GAME_WIDTH-this.scoreMessage.width-10;
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
    console.log(this.name + " moves randomly.");
  }
}
/*
* Fly Object
*/
class Fly extends Insect {
  constructor(sprite){
    super("Fly", sprite, 25);
  }
}
/*
* Ladybug Object
*/
class Ladybug extends Insect {
  constructor(sprite){
    super("Ladybug", sprite, 50);
  }
}
/*
* Wasp Object
*/
class Wasp extends Insect {
  constructor(sprite){
    super("Wasp", sprite, 0);
    this.isEnemy = true;
  }
}
