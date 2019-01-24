//Board:
let mines = new Array(); //list of all mines
let highlightedCells = new Array();

//game state controller
function Game(bSize, diff){
  this.BOARD_X = bSize;
  this.BOARD_Y = bSize;
  this.DIFF = 0.25;
  this.revealed = 0;
  this.end = false;
}

  let g = new Game(8, 0.25)

var tiles = new Array(g.BOARD_X);
var bg = new Array(g.BOARD_X);
for(let i = 0; i < tiles.length; i++){
  tiles[i] = new Array(g.BOARD_Y);
  bg[i] = new Array(g.BOARD_Y);
  for(let j = 0; j < tiles[i].length; j++){
    tiles[i][j] = {
      revealed: false,
      cell: undefined,
      mine: undefined,
      img: undefined,
    }
    bg[i][j] = {
      cell: undefined,
      mine: undefined,
    }
  }
} //2d array of length boardSize for holding the tile and mine in each position, tiles[x][y].

//- Display
function makeBGBoard(){
  let boardTable = document.getElementById("bgboard"); //currently empty table
  for(let y = 0; y < g.BOARD_Y; y++){
    let row = boardTable.insertRow(y); //create row in table
    for(let x = 0; x < g.BOARD_X; x++){
      let cell = row.insertCell(x); //add cells to row
      bg[x][y].cell = cell;
      cell.classList.add('bg');//set color
      cell.id = x+','+y;
    }
  }
}

function makePlayBoard(){
  let boardTable = document.getElementById("playboard"); //currently empty table
  for(let y = 0; y < g.BOARD_Y; y++){
    let row = boardTable.insertRow(y); //create row in table
    for(let x = 0; x < g.BOARD_X; x++){
      let cell = row.insertCell(x); //add cells to row
      tiles[x][y].cell = cell;
      cell.id = x+','+y;
        cell.onmousedown = function(e){ //mouse event listener
          if(g.end == false){ //if game hasn't ended
            if(e.which == 3 || e.button == 2){ // on right click
              flagPiece(x,y);
            }
            else {
              revealPiece(x,y);
              if(checkAdj(x,y) == 0) revealAdj(x,y);
            }
          }
      }
    }
  }
}

//- Mine Data:
function Mine(row, column){ //mine class, contains image, position
  let img = new Image();
  img.src = 'assets/Mine.png';
  this.img = img;
  this.row = row;
  this.column = column;
  this.visible = false;
}

function defaultBoardInit(){
  mines = new Array(); //array that holds all active pieces
  turns = 0;
  let mineX, mineY;
  let mineCount = g.BOARD_X * g.BOARD_Y * g.DIFF;
  for(let i = 0; i <= mineCount; i++){
    mineX = Math.floor(Math.random()*g.BOARD_X + 1);
    mineY = Math.floor(Math.random()*g.BOARD_Y + 1);
    try{
      if(tiles[mineX][mineY].mine == undefined){
        tiles[mineX][mineY].mine = new Mine(mineY, mineX);
        mines.push(tiles[mineX][mineY].mine);
        replaceImages();
      }
      else {
        i--;
      }
    }catch(e){}
  }
  replaceImages();
}

function moveMines(){
  /*  for(let i = 0; i < mines.length; i++){
    tiles[mines[i].column][mines[i].row].mine = mines[i]; //add the piece to the tile object
    let tile = tiles[mines[i].column][mines[i].row].cell; //html element

    while(tile.hasChildNodes()){ //get rid of all current elements to add image
      tile.removeChild(tile.lastChild);
    }
    if(tiles[mines[i].column][mines[i].row].mine.visible == true){
      //console.log(mines[i].img); //debug
      tile.appendChild(mines[i].img); //add the current piece image to the tile
    }
  }
  */
  for(let i = 0; i < mines.length; i++){
    let tile = tiles[mines[i].column][mines[i].row].cell;
    if(tile.classList.contains('flag') == false){
      mineX = Math.floor(Math.random()*g.BOARD_X + 1);
      mineY = Math.floor(Math.random()*g.BOARD_Y + 1);
      mines[i].row = mineY;
      mines[i].column = mineX;
   }
  }
}

function replaceImages(){
  for(let x = 0; x < tiles.length; x++){
    for(let y = 0; y < tiles[x].length; y++){
      let tile = tiles[x][y].cell;

      while(tile.hasChildNodes()){ //get rid of all current elements to add image
        tile.removeChild(tile.lastChild);
      }
      try{
        if(tiles[x][y].mine.visible == true){
          //console.log(mines[i].img); //debug
          tile.appendChild(tiles[x][y].mine.img); //add the current piece image to the tile
        }
      } catch(e){}
      if(tiles[x][y].revealed == true && checkAdj(x,y) != 0){
        let img = new Image();
        img.src = 'assets/' + checkAdj(x,y) +'.png';
        tiles[x][y].img = img;
        tile.appendChild(tiles[x][y].img);
      }
    }
  }
}

function revealPiece(x,y){ //reveals single tile
  let tile = tiles[x][y];
  tile.revealed = true;
  if(tile.mine != undefined){
    tile.mine.visible = true;
    tile.cell.classList.remove('bg');
    tile.cell.classList.add('trip');
    gameOver();
  }
  else if(tile.cell.classList.contains('flag') == false && tile.mine == undefined){
    tile.cell.classList.remove('bg');
    tile.cell.classList.add('reveal');
    moveMines();
    if(g.BOARD_X * g.BOARD_Y - mines.length == countRevealed())gameWin();
  }
  replaceImages();
}

function countRevealed(){
  let r = 0;
  for(let x = 0; x < tiles.length; x++){
    for(let y = 0; y < tiles[x].length; y++){
      if(tiles[x][y].revealed == true)r++;
    }
  }
  return r;
}

function gameOver(){
  alert('Game Over!');
  toggleHide();
  g.end = true;
}

function gameWin(){
  alert('You Win!');
  g.end = true;
}

function progress(){
  loadGame();
}

function toggleHide(){ //toggles if mines are hidden, debugging
  for(let i = 0; i < mines.length; i++){
    mines[i].visible = true;
    replaceImages();
  }
}

function checkAdj(x,y){
  let adjMineCount = 0;
  try{
    for(let i = x-1; i < x+2; i++){
      if(i < 0)i++;
      for(let j = y-1; j < y+2; j++){
        if(j < 0)j++;
        if(tiles[i][j].mine != undefined){
          adjMineCount++;
        }
      }
    }
  } catch(e){}
  return adjMineCount;
}

function revealAdj(x,y){ //reveals adjacent tiles
  try{ //used because last row will be revealed before console error is shown
    for(let i = x-1; i < x+2; i++){
      if(i < 0)i++;
      for(let j = y-1; j < y+2; j++){
        if(j < 0)j++;
        if(tiles[i][j].mine == undefined){ //if there are no adjacent mines, reveal surroundings
          revealPiece(i,j);
        }
      }
    }
  } catch(e){}
}

function flagPiece(x,y){ // flags single tile
  let tile = tiles[x][y];
  if(tile.cell.classList.contains('flag')){
    tile.cell.classList.remove('flag');
    tile.cell.classList.add('bg');
  }
  else {
    tile.cell.classList.remove('bg');
    tile.cell.classList.add('flag');
  }
  replaceImages();
}

window.onload = function(){ //when screen loads
  loadGame();
}

function loadGame(){
  //delete existing table
  makeBGBoard();
  makePlayBoard();
  defaultBoardInit();
  replaceImages();
}
