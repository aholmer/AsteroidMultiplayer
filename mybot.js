var socket = require('socket.io-client')('http://localhost:2000');
var gameData;

socket.on("connect", function(){
  socket.emit("play", {name: "Hyperion (Anders)"});
});
socket.on("update", function (data) {
  gameData = data;
});

function getLengthInfoFromShip(otherObject, myShip) {
  var xDifference = otherObject.pos.x - myShip.pos.x;
  var yDifference = otherObject.pos.y - myShip.pos.y;
  var length = Math.sqrt(Math.pow(xDifference, 2) + Math.pow(yDifference, 2));
  return {xDiff: xDifference, yDiff: yDifference, length: length, enemy: otherObject};
}

function findClosestEnemy(myShip) {
  var closestEnemyInfo = null;
  for(key in gameData.players) {
    var enemyShip = gameData.players[key].ship;
    if(enemyShip && key !== socket.id) {
      var enemyInfo = getLengthInfoFromShip(enemyShip, myShip);
      if (closestEnemyInfo === null || enemyInfo.length < closestEnemyInfo.length) {
        closestEnemyInfo = enemyInfo;
      }
    }
  }
  return closestEnemyInfo;
}

function isAsteroidCloseToImpact(myShip) {
  var closestEnemyInfo = null;
  for(key in gameData.asteroids) {
    var asteroid = gameData.asteroids[key];
    var asteroidInfo = getLengthInfoFromShip(asteroid, myShip);
    if (asteroidInfo.length < 10) {
      return asteroidInfo;
    }
  }
  return null;
}

function handleShip(myShip) {
  var length = 9999;
  var newBearing = 0;
  var target = isAsteroidCloseToImpact(myShip);
  if(target === null) {
    target = findClosestEnemy(myShip);
  }
  if(target !== null) {
    newBearing = Math.atan2(target.yDiff, target.xDiff);
    if (newBearing > myShip.heading) {
      socket.emit("rotateClockwise");
    }
    else {
      socket.emit("rotateCounterClockwise");
    }
  }
  socket.emit("fire");
}

setInterval(function(){
  if(gameData){
    var myShip;
    if(gameData.players[socket.id])
    {
      myShip = gameData.players[socket.id].ship;
    }
    if(myShip) // ship is alive
    {
      handleShip(myShip);
    }
  }
}, 1);
