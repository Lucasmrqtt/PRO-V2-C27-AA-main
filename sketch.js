const Engine = Matter.Engine;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Constraint = Matter.Constraint;

var isGameOver = false
var isLaught = false
var engine, world, backgroundImg;
var canvas, angle, tower, ground, cannon;
var balls = [];
var boats = [];
var score = 0;
var boatAnimation = [];
var boatSpritedata, boatSpritesheet;
var brokenAnimation = [];
var brokenSpritedata,brokenSpritesheet;
var bgMsc, explosionMsc, waterMsc, laughtMsc

var waterSplashAnimation = [];
var waterSplashSpritedata, waterSplashSpritesheet;

function preload() {
  backgroundImg = loadImage("./assets/background.gif");
  towerImage = loadImage("./assets/tower.png");
  boatSpritedata = loadJSON("./assets/boat/boat.json");
  boatSpritesheet = loadImage("./assets/boat/boat.png");
  brokenSpritedata = loadJSON('./assets/boat/brokenBoat.json')
  brokenSpritesheet = loadImage('./assets/boat/brokenBoat.png')
  waterSplashSpritedata = loadJSON("./assets/waterSplash/waterSplash.json");
  waterSplashSpritesheet = loadImage("./assets/waterSplash/waterSplash.png");
  bgMsc = loadSound ('./assets/sounds/background_music.mp3')
  explosionMsc = loadSound ('./assets/sounds/cannon_explosion.mp3')
  waterMsc = loadSound ('./assets/sounds/cannon_water.mp3')
  laughtMsc = loadSound ('./assets/sounds/pirate_laugh.mp3')
}

function setup() {
  canvas = createCanvas(1200, 600);
  engine = Engine.create();
  world = engine.world;
   angleMode(DEGREES)
  angle = 15


  ground = Bodies.rectangle(0, height - 1, width * 2, 1, { isStatic: true });
  World.add(world, ground);

  tower = Bodies.rectangle(160, 350, 160, 310, { isStatic: true });
  World.add(world, tower);

  cannon = new Cannon(180, 110, 130, 100, angle);

  var boatFrames = boatSpritedata.frames;
  for (var i = 0; i < boatFrames.length; i++) {
    var pos = boatFrames[i].position;
    var img = boatSpritesheet.get(pos.x, pos.y, pos.w, pos.h);
    boatAnimation.push(img);
  }

  var brokenFrames = brokenSpritedata.frames;
  for (let i = 0; i < brokenFrames.length; i++) {
    var pos = brokenFrames[i].position;
    var img = brokenSpritesheet.get(pos.x, pos.y, pos.w, pos.h);
    brokenAnimation.push(img)
  }

  var waterSplashFrames = waterSplashSpritedata.frames;
  for (var i = 0; i < waterSplashFrames.length; i++) {
    var pos = waterSplashFrames[i].position;
    var img = waterSplashSpritesheet.get(pos.x, pos.y, pos.w, pos.h);
    waterSplashAnimation.push(img);
  }
}

function draw() {
  if (!bgMsc.isPlaying()) {
    bgMsc.play();
    bgMsc.setVolume(0.4)
  }
  background(189);
  image(backgroundImg, 0, 0, width, height);

  Engine.update(engine);

  push();
  translate(ground.position.x, ground.position.y);
  fill("brown");
  rectMode(CENTER);
  rect(0, 0, width * 2, 1);
  pop();

  push();
  translate(tower.position.x, tower.position.y);
  rotate(tower.angle);
  imageMode(CENTER);
  image(towerImage, 0, 0, 160, 310);
  pop();

  showBoats();

  for (var i = 0; i < balls.length; i++) {
    showCannonBalls(balls[i], i);
    collisionWithBoat(i);
  }

  cannon.display();

  fill ('black')
  textSize (40)
  text('Score:'+ score,width-230,50)

}

function collisionWithBoat(index) {
  for (var i = 0; i < boats.length; i++) {
    if (balls[index] !== undefined && boats[i] !== undefined) {
      var collision = Matter.SAT.collides(balls[index].body, boats[i].body);

      if (collision.collided && !boats[i].isBroken) {
          boats[i].remove(i);
          score +=5

        Matter.World.remove(world, balls[index].body);
        delete balls[index];
      }
    }
  }
}

function keyPressed() {
  if (keyCode === DOWN_ARROW) {
    var cannonBall = new CannonBall(cannon.x, cannon.y);
    cannonBall.trajectory = [];
    Matter.Body.setAngle(cannonBall.body, cannon.angle);
    balls.push(cannonBall);
  }
}

function showCannonBalls(ball, index) {
  if (ball) {
    ball.display();
    ball.animate();
    if (ball.body.position.x >= width) {
      World.remove(world,balls[index])
      balls.splice(index,1)
    }
    if (ball.body.position.y >= height-50) {
      ball.remove(index)
      if (!ball.isSink) {
        waterMsc.play();
      }
      
    }
  }
}

function showBoats() {
  if (boats.length > 0) {
    if (
      boats[boats.length - 1] === undefined ||
      boats[boats.length - 1].body.position.x < width - 300
    ) {
      var positions = [-40, -60, -70, -20];
      var position = random(positions);
      var boat = new Boat(
        width,
        height - 100,
        170,
        170,
        position,
        boatAnimation
      );

      boats.push(boat);
    }

    for (var i = 0; i < boats.length; i++) {
      if (boats[i]) {
        Matter.Body.setVelocity(boats[i].body, {
          x: -0.9,
          y: 0
        });

        boats[i].display();
        boats[i].animate();
        var collision = Matter.SAT.collides(tower,boats[i].body)
        if (collision.collided && !boats[i].isBroken) {
          isGameOver = true;
          gameOver();
          if (!isLaught ) {
            laughtMsc.play();
            isLaught = true
          }
        }
        
    }
    }
  } else {
    var boat = new Boat(width, height - 60, 170, 170, -60, boatAnimation);
    boats.push(boat);
  }
}

function keyReleased() {
  if (keyCode === DOWN_ARROW) {
    balls[balls.length - 1].shoot();
    explosionMsc.play();
  }
}

function gameOver() {
  swal(
    {
      title: `Fim de Jogo!!!`,
      text: "Obrigada por jogar!!",
      imageUrl:
        "https://raw.githubusercontent.com/whitehatjr/PiratesInvasion/main/assets/boat.png",
      imageSize: "150x150",
      confirmButtonText: "Jogar Novamente"
    },
    function(isConfirm) {
      if (isConfirm) {
        location.reload();
      }
    }
  );
}