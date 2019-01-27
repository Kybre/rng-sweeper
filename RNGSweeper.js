//Board:
let mines = new Array(); //list of all mines
let highlightedCells = new Array();
let level = 1;
let firstClick = true;
//Timer:
duration = 300;
function startTimer(g){
  document.getElementById("time").innerHTML = '<strong>Time Remaining:</strong><br />05:00';
  duration--; //buffer for actual time
  let timer = setInterval(function(){
    let min = parseInt(duration / 60, 10);
    if(min < 10) min = '0' + min;
    else if (min <= 0) min = '00'
    let sec = parseInt(duration % 60, 10);
    if(sec < 10) sec = '0' + sec;
    else if (sec <= 0) sec = '00'
    document.getElementById("time").innerHTML = '<strong>Time Remaining:</strong><br />' + min + ':' + sec;
    if(duration == 0){
      gameOver();
      clearInterval(timer);
    }
    if(g.end == false){
      duration--;
    }
  }, 1000);
}
//game state controller
function Game(bSize, diff){
  this.BOARD_X = bSize;
  this.BOARD_Y = bSize;
  this.DIFF = 0.25;
  this.revealed = 0;
  this.end = false;
}

let g = new Game(8, 0.25);

var tiles = new Array(g.BOARD_X);
var bg = new Array(g.BOARD_X);
for(let i = 0; i < tiles.length; i++){
  tiles[i] = new Array(g.BOARD_Y);
  bg[i] = new Array(g.BOARD_Y);
  for(let j = 0; j < tiles[i].length; j++){
    tiles[i][j] = {
      revealed: false,
      flagged: false,
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

function initNew(game){
  //add new row/column
  let playboard = document.getElementById("playboard");
  let bgboard = document.getElementById("bgboard");
  let x = game.BOARD_X-1;
  let y = game.BOARD_Y-1;
  for(let i = 0; i < playboard.rows.length; i++){
    playboard.rows[i].insertCell(x);
  }
  for(let i = 0; i < bgboard.rows.length; i++){
    bgboard.rows[i].insertCell(x);
  }
  let pbrow = playboard.insertRow(y);
  let bgrow = bgboard.insertRow(y);
  for(let i = 0; i < game.BOARD_X; i++){
      pbrow.insertCell(i);
      bgrow.insertCell(i);
  }
  resetTiles(game);
  defaultBoardInit(); //reset mines
  firstClick = true;
}

function resetTiles(game){
  //redeclare variables
  tiles = new Array(game.BOARD_X);
  bg = new Array(game.BOARD_X);
  for(let i = 0; i < tiles.length; i++){
    tiles[i] = new Array(game.BOARD_Y);
    bg[i] = new Array(game.BOARD_Y);
    for(let j = 0; j < tiles[i].length; j++){
      tiles[i][j] = {
        revealed: undefined,
        flagged: undefined,
        cell: undefined,
        mine: undefined,
        img: undefined,
      }
      bg[i][j] = {
        cell: undefined,
        mine: undefined,
      }
    }
  }
  //redeclare tile contents
  for(let y = 0; y < game.BOARD_Y; y++){
    let prow = playboard.rows[y];
    let brow = bgboard.rows[y];
    for(let x = 0; x < game.BOARD_X; x++){
      let pcell = prow.cells[x];
      let bcell = brow.cells[x];
      let cW = 70/game.BOARD_Y; //cell width
      let cH = 87.5/game.BOARD_X; // cell height
      /* console.log('cell width: ' + cW); //debugging
      console.log('cell height: ' + cH); */
      pcell.style.width = cW + 'vh';
      pcell.style.height = cH + 'vh';
      bcell.style.width = cW + 'vh';
      bcell.style.height = cH + 'vh';
      //playboard
      setPlayCell(pcell,x,y);
      //bg
      setBGCell(bcell,x,y);
      /* bg[x][y].cell = bcell;
      bcell.classList.add('bg');//set color
      bcell.id = x+','+y; */
    }
  }
}

function setBGCell(cell,x,y){
  //formatting background cell
  bg[x][y].cell = cell;
  cell.classList.add('bg');//set color
  cell.id = x+','+y;
}

function setPlayCell(cell,x,y){
  //formatting playboard cell
  tiles[x][y].cell = cell;
  tiles[x][y].cell.className = ''; //remove all classes
  tiles[x][y].cell.classList.add('bg');
  tiles[x][y].revealed = false;
  tiles[x][y].flagged = false;
  cell.id = x+','+y;
    cell.onmousedown = function(e){ //mouse event listener
      if(g.end == false){ //if game hasn't ended
        if(e.which == 3 || e.button == 2){ // on right click
          flagPiece(x,y);
        }
        else {
          if(firstClick == true){
            tiles[x][y].mine = undefined;
            firstClick = false;
          }
          revealPiece(x,y,true);
        }
      }
  }
}

//- Display
function makeBGBoard(){
  let boardTable = document.getElementById("bgboard"); //currently empty table
  for(let y = 0; y < g.BOARD_Y; y++){
    let row = boardTable.insertRow(y); //create row in table
    for(let x = 0; x < g.BOARD_X; x++){
      let cell = row.insertCell(x); //add cells to row
      setBGCell(cell,x,y);
    }
  }
}

function makePlayBoard(){
  let boardTable = document.getElementById("playboard"); //currently empty table
  for(let y = 0; y < g.BOARD_Y; y++){
    let row = boardTable.insertRow(y); //create row in table
    for(let x = 0; x < g.BOARD_X; x++){
      let cell = row.insertCell(x); //add cells to row
      setPlayCell(cell,x,y);
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
  this.flagged = false;
}

function defaultBoardInit(){
  mines = new Array(); //array that holds all active pieces
  turns = 0;
  let mineX, mineY;
  let mineCount = g.BOARD_X * g.BOARD_Y * g.DIFF;
  for(let i = 0; i <= mineCount; i++){
    mineX = Math.floor(Math.random()*g.BOARD_X);
    mineY = Math.floor(Math.random()*g.BOARD_Y);
    if(tiles[mineX][mineY].mine == undefined){
      tiles[mineX][mineY].mine = new Mine(mineY, mineX);
      mines.push(tiles[mineX][mineY].mine);
      replaceImages();
    }
    else {
      i--;
    }
  }
  replaceImages();
}

function setMine(mine,x,y){
  /* console.log('mine:');
  console.log('mine.column:' + mine.column);
  console.log('mine.row:' + mine.row);
  console.log('x:' + x);
  console.log('y:' + y);
  console.log('tiles[x][y].mine:' + mine.column);*/
  mine.column = x;
  mine.row = y;
  tiles[x][y].mine = mine;
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
      if(tiles[x][y].revealed == true && checkAdj(x,y) != 0 && tiles[x][y].flagged == false){
        let img = new Image();
        img.src = 'assets/' + checkAdj(x,y) +'.png';
        tiles[x][y].img = img;
      }
      else if(checkAdj(x,y) == 0 && tiles[x][y].flagged == false) tiles[x][y].img = undefined;
      if(tiles[x][y].img != undefined) tile.appendChild(tiles[x][y].img);
    }
  }
  document.getElementById("currentscore").innerHTML = '<strong>Current Score: </strong><br /> Level ' + level + ' - Tiles Revealed: ' + countRevealed(); //set current score text
  if (typeof(Storage) !== "undefined") { //if browser supports localStorage
    let text = '';
    if(localStorage.rnglevel == undefined) text = 'None';
    else if(level < localStorage.rnglevel) text = 'Level ' + localStorage.rnglevel + ' - Tiles Revealed: ' + localStorage.rngrevealed;
    else if(level == localStorage.rnglevel && countRevealed() < localStorage.rngrevealed) text = 'Level ' + localStorage.rnglevel + ' - Tiles Revealed: ' + localStorage.rngrevealed;
    else text = 'Level ' + level + ' - Tiles Revealed: ' + countRevealed();
    document.getElementById("highscore").innerHTML = '<strong>High Score: </strong><br />' + text;
  } else { //if browser doesnt support localStorage
    document.getElementById("highscore").innerHTML = '<strong>High Score: </strong><br /> Browser Not Supported, Sorry!';
  }
}

function revealPiece(x,y,m){ //reveals single tile
  replaceImages();
  let tile = tiles[x][y];
  if(tile.mine != undefined){
    tile.revealed = true;
    tile.mine.visible = true;
    tile.cell.classList.remove('bg');
    tile.cell.classList.add('trip');
    gameOver();
  }
  else if(tile.flagged == false && tile.cell.classList.contains('reveal') == false && tile.mine == undefined){
    tile.revealed = true;
    tile.cell.classList.remove('bg');
    tile.cell.classList.add('reveal');
    if(m == true){
      //randomly move mines
      let moveCount = 0;
      for(let i = 0; i < mines.length; i++){ //loop for all mines
      mineX = Math.floor(Math.random()*g.BOARD_X); //pick random coordinates
      mineY = Math.floor(Math.random()*g.BOARD_Y);
        if(mines[i].flagged == false){
          if(g.BOARD_X * g.BOARD_Y - countRevealed() - mines.length > moveCount){ //bypass infinite loop - if there are no tiles to move to, don't move the mines
            if(x == mineX && y == mineY) i--; //cannot pick the tile clicked
            else if (tiles[mineX][mineY].mine != undefined)i--; //cannot have an existing mine
            else if(tiles[mineX][mineY].revealed == true)i--; //cannot be previously revealed tile
            else{
                tiles[mines[i].column][mines[i].row].mine = undefined; //set the mine on its previous tile to undefined
                setMine(mines[i],mineX,mineY); //move mine
                moveCount++;
              }
            replaceImages();
          }
        }
      }
    }
    replaceImages();
    //reveal adjacent
    if(checkAdj(x,y) == 0 && m == true){
      for(let i = x-1; i < x+2; i++){
        for(let j = y-1; j < y+2; j++){
          if(tiles[i] != undefined){
            if(tiles[i][j] != undefined){
              if(tiles[i][j].mine == undefined){ //if there are no adjacent mines, reveal surroundings
                revealPiece(i,j,false);
                replaceImages();
              }
            }
          }
        }
      }
    }
    if(g.BOARD_X * g.BOARD_Y - mines.length == countRevealed())progress();
  }
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
  if(level > localStorage.rnglevel) saveScore();
  else if (level == localStorage.rnglevel && countRevealed() > localStorage.rngrevealed) saveScore();
}

function saveScore(){
  localStorage.setItem("rnglevel", level);
  localStorage.setItem("rngrevealed", countRevealed());
}

function gameWin(){
  alert('You Win!');
  g.end = true;
}

function progress(){
  let bSize = g.BOARD_X += 1;
  let diff = g.DIFF;
  g = new Game(bSize,diff);
  level++;
  initNew(g);
  duration += 20;
}

function toggleHide(){ //toggles if mines are hidden, debugging
  for(let i = 0; i < mines.length; i++){
    mines[i].visible = true;
    replaceImages();
  }
}

function checkAdj(x,y){
  let adjMineCount = 0;
    for(let i = x-1; i < x+2; i++){
      for(let j = y-1; j < y+2; j++){
        if(tiles[i] != undefined){
          if(tiles[i][j] != undefined){
            if(tiles[i][j].mine != undefined){
              adjMineCount++;
            }
          }
        }
      }
    }
  return adjMineCount;
}

function clearScore(){ //debugging, clears high scores
  localStorage.setItem("rnglevel", undefined);
  localStorage.setItem("rngrevealed", undefined);
}

function flagPiece(x,y){ // flags single tile
  let tile = tiles[x][y];
  if(tile.cell.classList.contains('flag')){
    tile.cell.classList.remove('flag');
    tile.cell.classList.add('bg');
    if(tile.mine != undefined) tile.mine.flagged = false;
    tiles[x][y].img = undefined;
  }
  else {
    tile.cell.classList.remove('bg');
    tile.cell.classList.add('flag');
    if(tile.mine != undefined) tile.mine.flagged = true;
    let img = new Image();
    img.src = 'assets/Flag.png';
    tiles[x][y].img = img;
  }
  replaceImages();
}

window.onload = function(){ //when screen loads
  makeBGBoard();
  makePlayBoard();
  defaultBoardInit();
  startTimer(g);
  replaceImages();
}
