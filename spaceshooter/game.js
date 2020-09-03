var canvas = document.getElementById("myCanvas");
var context = canvas.getContext("2d");
var keymap = {32: false, 37: false, 38: false, 39: false, 40: false};
var player = {
	x : 50,
	y : 550,
	width : 25,
	height : 25,
	sprite : new sprite(25, 25, "sprite.png")
}
var firecooldown=0;
var enemycooldown=100;
var score = 0;

var entitylist = [];
var interval

function laser(xsrc, ysrc, xvel, yvel) {
	this.x = xsrc;
	this.y = ysrc;
	this.xvel = xvel;
	this.yvel = yvel;
	this.type = "laser";
	this.dispose = false;
	this.sprite = new sprite(25, 6, "laser.png");
	this.update = function() {
		this.x+=xvel;
		this.y+=yvel;
		if (this.x < 0 || this.y < 0 || this.x > canvas.width - this.sprite.width || this.y > canvas.height - this.sprite.height) {
			this.dispose = true;
		}
	}
}

function explosion(xsrc, ysrc, duration) {
	this.x = xsrc;
	this.y = ysrc;
	this.type = "explosion";
	this.duration = duration;
	this.dispose = false;
	this.sprite = new sprite(25, 25, "explosion.png");
	this.update = function() {
		this.duration--;
		if (this.duration < 0) {
			this.dispose = true;
		}
	}
}

function enemy(xsrc, ysrc, xvel, yvel) {
	this.x = xsrc;
	this.y = ysrc;
	this.xvel = xvel;
	this.yvel = yvel;
	this.type = "enemy";
	this.dispose = false;
	this.sprite = new sprite(25, 25, "enemy.png");
	this.inbounds = function(x1,y1, x2, y2) {
		if (x1 > this.x+this.sprite.width || this.x > x2) {
			return false;
		}
		if ( y1 > this.y+this.sprite.height || this.y > y2) {
			return false;
		}
		return true;
	}
	this.update = function() {
		this.x+=xvel;
		this.y+=yvel;
		if (this.x < 0) {
			this.x = canvas.width - this.sprite.width;
		}
		if (this.y < 0) {
			this.y = canvas.height - this.sprite.height;
		}
		if (this.x > canvas.width - this.sprite.width) {
			this.x = 0;
		}
		if (this.y > canvas.height - this.sprite.height) {
			this.y = 0;
		}
		for (a in entitylist) {
			if (entitylist[a].type == "laser" && this.inbounds(entitylist[a].x,entitylist[a].y,entitylist[a].x+entitylist[a].sprite.width, entitylist[a].y+entitylist[a].sprite.height)) {
				entitylist[a].dispose = true;
				this.dispose = true;
				score+=100;
				document.getElementById("myScore").innerHTML=score;
			}
		}
	}
}

function sprite(width, height, source) {
	this.type = "image";
	this.image = new Image();
	this.image.src = source;
	this.width = width;
	this.height = height;
}

function startGame()
{
	interval = setInterval(updateGame, 20);
	window.addEventListener('keydown', function (e) {
		if (e.keyCode in keymap) {
			keymap[e.keyCode] = true;
		}
	})
	window.addEventListener('keyup', function (e) {
		if (e.keyCode in keymap) {
			keymap[e.keyCode] = false;
		}
	})
}

function updateGame()
{
	for (e in entitylist) {
		entitylist[e].update();
		console.log(entitylist[e].type+" dispose:"+entitylist[e].dispose);
		if (entitylist[e].type == "enemy" && entitylist[e].inbounds(player.x,player.y,player.x+player.sprite.width, player.y+player.sprite.height)) {
			entitylist.push( new explosion(player.x,player.y, 30));
			drawCanvas();
			alert("You lose");
			clearInterval(interval);
		}
		if (entitylist[e].dispose) {
			if (entitylist[e].type == "laser") {
				//entitylist.push( new explosion(entitylist[e].x,entitylist[e].y, 30));
			}
			if (entitylist[e].type == "enemy") {
				entitylist.push( new explosion(entitylist[e].x,entitylist[e].y, 30));
				firecooldown = 0;
			}
			entitylist.splice(e, 1);
		}
	}
	handleInput();
	drawCanvas();
	if (firecooldown>0) {
		firecooldown--;
	}
	if (enemycooldown>0) {
		enemycooldown--;
	}
	if (enemycooldown==0) {
		entitylist.push( new enemy(Math.floor(Math.random()*600)+50,0,Math.random()*4-2,Math.random()*3) );
		enemycooldown = 150;
	}
}

// left = 37 up = 38 right = 39 down = 40 space = 32

function handleInput() {
	if (keymap[37] && player.x > 0) {
		player.x-=2;
	}
	if (keymap[38] && player.y > 0) {
		player.y-=2;
	}
	if (keymap[39] && player.x < canvas.width - player.sprite.width) {
		player.x+=2;
	}
	if (keymap[40] && player.y < canvas.height - player.sprite.height) {
		player.y+=2;
	}
	if (keymap[32] && firecooldown==0) {
		entitylist.push(new laser(player.x, player.y, 0, -3));
		firecooldown=50;
	}
}

function drawCanvas(){
	clearCanvas();
	context.drawImage(player.sprite.image, player.x, player.y);
	for (e in entitylist) {
		context.drawImage(entitylist[e].sprite.image, entitylist[e].x, entitylist[e].y);
	}
	
}

function clearCanvas(){
	context.clearRect(0, 0, canvas.width, canvas.height);
}
