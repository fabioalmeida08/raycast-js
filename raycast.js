/// <reference path="./global.d.ts" />
const TILE_SIZE = 64;
const MAP_NUM_ROWS = 11;
const MAP_NUM_COLS = 15;
const WINDOW_WIDTH = MAP_NUM_COLS * TILE_SIZE;
const WINDOW_HEIGHT = MAP_NUM_ROWS * TILE_SIZE;

const FOV_ANGLE = 66 * (Math.PI / 180);
const WALL_STRIP_WIDTH = 2;
const NUM_RAYS = WINDOW_WIDTH / WALL_STRIP_WIDTH; // numero de raios depende do wsw

const MINIMAP_SCALE_FACTOR = 0.2;

class Player {
  constructor() {
    this.x = WINDOW_WIDTH / 2;
    this.y = WINDOW_HEIGHT / 2;
    this.radius = 10;
    this.turnDirection = 0; // -1 esquerda +1 direita
    this.walkDirection = 0; // -1 tras, +1 frente
    this.rotationAngle = Math.PI / 2; // angulo que o player nasce virado: 270 graus virado para cima
    this.moveSpeed = 2.0;
    this.rotationSpeed = 2 * (Math.PI / 180); // quantos graus ira rotacionar igual 2 graus por frame aqui
  }

  render() {
    noStroke();
    fill("blue");
    circle(
      MINIMAP_SCALE_FACTOR * this.x,
      MINIMAP_SCALE_FACTOR * this.y,
      MINIMAP_SCALE_FACTOR * this.radius
    );
    stroke("blue")
    line(
      MINIMAP_SCALE_FACTOR * this.x,
      MINIMAP_SCALE_FACTOR * this.y,

      //NOTE: revisar aqui, como 270 aponta para cima isso quer dizer que o x vale 0 e o y vale 1, cos = 0 e sen = 1? por 
      //isso 20px para cima, apontando a seta para norte? 
      MINIMAP_SCALE_FACTOR * this.x + Math.cos(this.rotationAngle) * 20, // entao a formula é cos = ca / h , logo  20 * cos = ca horizontal _
      MINIMAP_SCALE_FACTOR * this.y + Math.sin(this.rotationAngle) * 20, // representa a distancia da origem até o final do vetor da seta  |
    );
  }

  update() {
    this.rotationAngle += this.rotationSpeed * this.turnDirection;
    var moveStep = this.moveSpeed * this.walkDirection;
    var newPlayerPosX = this.x + Math.cos(this.rotationAngle) * moveStep;
    var newPlayerPosY = this.y + Math.sin(this.rotationAngle) * moveStep;
    if (!grid.hasWall(newPlayerPosX, newPlayerPosY)) {
      this.x = newPlayerPosX;
      this.y = newPlayerPosY;
    }
  }
}

class Map {
  constructor() {
    this.grid = [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
      [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ];
  }

  hasWall(x, y) {
    if (x < 0 || x > WINDOW_WIDTH || y < 0 || y > WINDOW_HEIGHT)
      return false;
    var mapPosX = Math.floor(x / TILE_SIZE);
    var mapPosY = Math.floor(y / TILE_SIZE);
    return this.grid[mapPosY][mapPosX] != 0;
  }

  render() {
    for (var i = 0; i < MAP_NUM_ROWS; i++) { // linha, vertical , eixo y
      for (var j = 0; j < MAP_NUM_COLS; j++) { // coluna , horizontal, eixo x
        var tileX = j * TILE_SIZE;
        var tileY = i * TILE_SIZE;
        var tileColor = this.grid[i][j] == 1 ? "#222" : "#fff"
        stroke("#223")
        fill(tileColor)
        rect(
          MINIMAP_SCALE_FACTOR * tileX,
          MINIMAP_SCALE_FACTOR * tileY,
          MINIMAP_SCALE_FACTOR * TILE_SIZE,
          MINIMAP_SCALE_FACTOR * TILE_SIZE);
      }
    }
  }
}

class Ray {
  constructor(rayAngle) {
    this.rayAngle = normalizeAngle(rayAngle);
    this.wallHitX = 0;
    this.wallHitY = 0;
    this.distance = 0;

    this.wasHitVertical = false;

    this.isFacingDown = this.rayAngle > 0 && this.rayAngle < Math.PI;
    this.isFacingUp = !this.isFacingDown;

    this.isFacingRight = this.rayAngle < Math.PI / 2 || this.rayAngle > (3 * Math.PI) / 2;
    this.isFacingLeft = !this.isFacingRight;
  }

  render() {
    stroke("rgba(255,0,0,0.3)");
    // stroke("red");
    line(
      MINIMAP_SCALE_FACTOR * player.x,
      MINIMAP_SCALE_FACTOR * player.y,
      MINIMAP_SCALE_FACTOR * this.wallHitX,
      MINIMAP_SCALE_FACTOR * this.wallHitY,
    );
  }

  cast(columnId) {
    var xintercept, yintercept
    var xstep, ystep

    // console.log("is this facing Right", this.isFacingRight);
    console.log(`rayAngle: ${(this.rayAngle * 180 / Math.PI).toFixed(1)}° | facingRight: ${this.isFacingRight} | cos: ${Math.cos(this.rayAngle).toFixed(3)}`);

    //////////////////////////////////////////
    // HORIZONTAL
    //////////////////////////////////////////
    var foundHorzWallHit = false;
    var horzWallHitX = 0;
    var horzWallHitY = 0;

    // achar a coordenada y do primeiro cruzamento horizontal (linha de tile) HORIZONTAL
    yintercept = Math.floor(player.y / TILE_SIZE) * TILE_SIZE;
    yintercept += this.isFacingDown ? TILE_SIZE : 0;
    // achar a coordernada x o do primeiro cruzamento (linha) HORIZONTAL
    xintercept = player.x + (yintercept - player.y) / Math.tan(this.rayAngle);

    // calcular o incremento do ystep e x step
    //REFACTOR: refatorar essa parte com:
    // HORIZONTAL
    // ystep = TILE_SIZE * (this.isFacingUp ? -1 : 1);
    // xstep = ystep / Math.tan(this.rayAngle);
    // VERTICAL
    // xstep = TILE_SIZE * (this.isFacingLeft ? -1 : 1);
    // ystep = xstep * Math.tan(this.rayAngle);
    ystep = TILE_SIZE;
    ystep *= (this.isFacingUp) ? -1 : 1;
    xstep = TILE_SIZE / Math.tan(this.rayAngle);
    xstep *= (this.isFacingLeft && xstep > 0) ? -1 : 1;
    xstep *= (this.isFacingRight && xstep < 0) ? -1 : 1;

    var nextHorzTouchX = xintercept;
    var nextHorzTouchY = yintercept;

    //FIX: ajustado para fazer a verificacao dento do loop do hasWall
    //sem realmente fazer o offset na hora de achar a coordenada do raio
    // if (this.isFacingUp)
    //   nextHorzTouchY--;

    while (nextHorzTouchX >= 0 && nextHorzTouchX <= WINDOW_WIDTH && nextHorzTouchY >= 0 && nextHorzTouchY <= WINDOW_HEIGHT) {
      if (grid.hasWall(nextHorzTouchX, nextHorzTouchY - (this.isFacingUp ? 1 : 0))) {
        foundHorzWallHit = true;
        horzWallHitX = nextHorzTouchX;
        horzWallHitY = nextHorzTouchY;
        break;
      } else {
        nextHorzTouchX += xstep;
        nextHorzTouchY += ystep;
      }
    }

    //////////////////////////////////////////
    // VERTICAL
    //////////////////////////////////////////
    var foundVertWallHit = false;
    var vertWallHitX = 0;
    var vertWallHitY = 0;

    // achar a coordenada x do primeiro cruzamento vertical (coluna) VERTICAL
    xintercept = Math.floor(player.x / TILE_SIZE) * TILE_SIZE;
    xintercept += this.isFacingRight ? TILE_SIZE : 0;
    // achar a coordernada y o do primeiro cruzamento (coluna) VERTICAL
    yintercept = player.y + (xintercept - player.x) * Math.tan(this.rayAngle);

    // calcular o incremento do ystep e x step
    //TODO: refatorar essa parte com xstep = ystep / tan(a) 
    xstep = TILE_SIZE;
    xstep *= (this.isFacingLeft) ? -1 : 1;
    ystep = TILE_SIZE * Math.tan(this.rayAngle);
    ystep *= (this.isFacingUp && ystep > 0) ? -1 : 1;
    ystep *= (this.isFacingDown && ystep < 0) ? -1 : 1;

    var nextVertTouchX = xintercept;
    var nextVertTouchY = yintercept;

    //FIX: ajustado para fazer a verificacao dento do loop do hasWall
    //sem realmente fazer o offset na hora de achar a coordenada do raio
    // if (this.isFacingLeft)
    //   nextVertTouchX--;

    while (
      nextVertTouchX >= 0 
      && nextVertTouchX <= WINDOW_WIDTH 
      && nextVertTouchY >= 0 
      && nextVertTouchY <= WINDOW_HEIGHT
    ) {
      if (grid.hasWall(nextVertTouchX - (this.isFacingLeft ? 1 : 0), nextVertTouchY)) {
        foundVertWallHit = true;
        vertWallHitX = nextVertTouchX;
        vertWallHitY = nextVertTouchY;
        break;
      } else {
        nextVertTouchX += xstep;
        nextVertTouchY += ystep;
      }
    }

    //INFO: achar a hipotenuza, assim pegar a menor distancia
    var horzHitDist = (foundHorzWallHit)
      ? distanceBetweenPoints(player.x, player.y, horzWallHitX, horzWallHitY)
      : Number.MAX_VALUE; //REFACTOR: refatorar em c para size_t - 1, para ficar com o maior valor possivel
    var vertHitDist = (foundVertWallHit)
      ? distanceBetweenPoints(player.x, player.y, vertWallHitX, vertWallHitY)
      : Number.MAX_VALUE;

    // guarda somente a menor das distancias
    this.wallHitX = (horzHitDist < vertHitDist) ? horzWallHitX : vertWallHitX;
    this.wallHitY = (horzHitDist < vertHitDist) ? horzWallHitY : vertWallHitY;
    this.distance = (horzHitDist < vertHitDist) ? horzHitDist : vertHitDist;
    this.wasHitVertical = (vertHitDist < horzHitDist);
  }

}

var grid = new Map();
var player = new Player();
var rays = [];

function distanceBetweenPoints(x1, y1, x2, y2) {
  var dx, dy;
  dx = x2 - x1;
  dy = y2 - y1;
  return Math.sqrt((dx*dx) + (dy*dy));
}

function keyPressed() {
  if (keyCode === LEFT_ARROW) {
    player.turnDirection = -1;
  } else if (keyCode === RIGHT_ARROW) {
    player.turnDirection = 1;
  } else if (keyCode === UP_ARROW) {
    player.walkDirection = 1;
  } else if (keyCode === DOWN_ARROW) {
    player.walkDirection = -1;
  }
}

function keyReleased() {
  if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) {
    player.turnDirection = 0;
  }
  if (keyCode === UP_ARROW || keyCode === DOWN_ARROW) {
    player.walkDirection = 0;
  }
}

function normalizeAngle(angle) {
  angle = angle % (2 * Math.PI)
  if (angle < 0)
    angle += (2 * Math.PI)
  return angle
}

function castAllRays() {
  var columnId = 0;
  var rayAngle = player.rotationAngle - (FOV_ANGLE / 2);

  rays = [];

  for (var i = 0; i < NUM_RAYS; i++) {
  // for (var i = 0; i < 1; i++) {
    var ray = new Ray(rayAngle);
    ray.cast(columnId);
    rays.push(ray);
    rayAngle += (FOV_ANGLE) / NUM_RAYS;
    columnId++;
  }
}

//roda primeiro
function setup() {
  //inicilizar os objetos
  createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);
}

//roda segundo
function draw() {
  update();
  grid.render();
  for (x of rays)
    x.render();
  player.render();
}

function update() {
  //rendereizar objetos frame por frame
  castAllRays();
  player.update();
}

//TODO:
//FIX:
//WARNING:
//PERF:
//TEST:
//HACK:
//INFO:
//NOTE:
//NOTE:
//INFO:
//REFACTOR:
