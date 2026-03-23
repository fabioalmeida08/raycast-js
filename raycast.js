/// <reference path="./global.d.ts" />
const TILE_SIZE = 32;
const MAP_NUM_ROWS = 11;
const MAP_NUM_COLS = 15;
const WINDOW_WIDTH = MAP_NUM_COLS * TILE_SIZE;
const WINDOW_HEIGHT = MAP_NUM_ROWS * TILE_SIZE;

class Player {
  constructor() {
    this.x = WINDOW_WIDTH / 2;
    this.y = WINDOW_HEIGHT / 2;
    this.radius = 6;
    this.turnDirection = 0; // -1 esquerda +1 direita
    this.walkDirection = 0; // -1 tras, +1 frente
    this.rotationAngle = 3 * Math.PI / 2; // angulo que o player nasce virado: 270 graus virado para cima
    this.moveSpeed = 2.0;
    this.rotationSpeed = 2 * (Math.PI / 180); // quantos graus ira rotacionar igual 2 graus por frame aqui
  }

  render() {
    noStroke();
    fill("red");
    circle(this.x, this.y, this.radius);
    stroke("red")
    line(
      this.x,
      this.y,
      //TODO: revisar aqui, como 270 aponta para cima isso quer dizer que o x vale 0 e o y vale 1, cos = 0 e sen = 1? por 
      //isso 20px para cima, apontando a seta para norte? 
      this.x + Math.cos(this.rotationAngle) * 20, // entao a formula é cos = ca / h , logo  20 * cos = ca horizontal _
      this.y + Math.sin(this.rotationAngle) * 20, // representa a distancia da origem até o final do vetor da seta  |
    );
  }

  update() {
    this.rotationAngle += this.rotationSpeed * this.turnDirection;
    var moveStep = this.moveSpeed * this.walkDirection;
    this.x += Math.cos(this.rotationAngle) * moveStep;
    this.y += Math.sin(this.rotationAngle) * moveStep;
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

  render() {
    for (var i = 0; i < MAP_NUM_ROWS; i++) { // linha, vertical , eixo y
      for (var j = 0; j < MAP_NUM_COLS; j++) { // coluna , horizontal, eixo x
        var tileX = j * TILE_SIZE;
        var tileY = i * TILE_SIZE;
        var tileColor = this.grid[i][j] == 1 ? "#222" : "#fff"
        stroke("#223")
        fill(tileColor)
        rect(tileX, tileY, TILE_SIZE, TILE_SIZE);
      }
    }
  }
}

var grid = new Map();
var player = new Player();

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

function setup() {
  //inicilizar os objetos
  createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);
}

function draw() {
  update();
  grid.render();
  player.render();
}

function update() {
  //rendereizar objetos frame por frame
  player.update();

}
