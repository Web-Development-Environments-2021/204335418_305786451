var context;
var pacman = {
	i:1,
	j:1
};
var board;
var score;
var pac_color;
var start_time;
var time_remaining;
var interval;
var ghostsinterval;
var loggedIn = false;
var activePageId='#page1';
var users=[];
var intervalLength=100;
var activeUser="";
// var playingKeys = [];
// playingKeysSetup(playingKeys);
var activeWalls=[];
var wallsSet= [
	[		
		{i:3,j:3},
		{i:3,j:4},
		{i:3,j:5},
		{i:6,j:1},
		{i:6,j:2}
	],
	[		
		{i:6,j:3},
		{i:6,j:4},
		{i:4,j:5},
		{i:7,j:1},
		{i:7,j:2}
	],
	[		
		{i:4,j:4},
		{i:5,j:4},
		{i:3,j:6},
		{i:4,j:6},
		{i:5,j:6}
	]
]
var maxPoints;
var food_remain;
var chosenPlayingKeys=[];
PlayingKeysSetup(chosenPlayingKeys);
var chosenKey=0;
gameSettings = {
	playingKeys: [],
	ballsAmount: 50,
	ballsSetting: [],
	gameTime: 1,
	monstersAmount: 1,
};

PlayingKeysSetup(gameSettings.playingKeys);
gameSettings.ballsSetting["A"]={color:"#ff0000", points:5};
gameSettings.ballsSetting["B"]={color:"#00fa3e", points:10};
gameSettings.ballsSetting["C"]={color:"#000000", points:15};
users["oded"]={"firstName":"oded", "lasName":"Berkovich", "password":"123"};
users["eilam"]={"firstName":"eilam", "lasName":"gal"};
users["k"]={"firstname":"tester", "lastname":"tester", "password":"k"};

var ammoAmount = 5;
var ammo;
var guns;
var shootSound;
var explosionSound;
var bgSound;
var food;

var ghostImages=[];
var ghosts=[]; //
var ghostsAmount=3; //user's settings
var activeGhosts; //ghosts in game

var direction="left";

var lives = 5

var movingFood = {i:5,j:5,show:true,image:''};

var seenClock=false;
var clock = {i:5, j:6, show:false ,image:'', starTime:0, hit:false};


$(document).ready(function() {
	initListeners();
	initImages();
	initSounds();
});

function playMusic(){
	bgSound.play();
}
function stopMusic(){
	bgSound.sound.currentTime = 0;
	bgSound.stop();
}

function initImages(){
	ghostImages[0] = new Image();
	ghostImages[0].src= "images/blue.png";
	ghostImages[1] = new Image();
	ghostImages[1].src= "images/red.png";
	ghostImages[2] = new Image();
	ghostImages[2].src= "images/green.png";
	ghostImages[3] = new Image();
	ghostImages[3].src= "images/yellow.png";
	
	movingFood.image = new Image();
	movingFood.image.src = "images/burger.png";
	clock.image = new Image();
	clock.image.src = "images/clock.png";

}

function initGhosts(){
	for(var i=0; i<4; i++){ //initialize objects
		ghosts.push(
			{
				i:0,
				j:0,
				image:ghostImages[i],
				show:true
			}
		);
	}
	repositionGhosts();
}

function initSounds(){
	shootSound = new sound("sounds/lasers.mp3");
	shootSound.sound.volume=0.1;
	explosionSound = new sound("sounds/explosion.mp3");
	explosionSound.sound.volume=0.2;
	bgSound= new sound("sounds/music.mp3");
	bgSound.sound.volume=0.5;
	bgSound.sound.loop=true;
}


function repositionGhosts(){
	//positions ghosts in corners
	ghosts[0].i=0; 
	ghosts[0].j=0;
	ghosts[0].show = (activeGhosts>0);

	ghosts[1].i=9; 
	ghosts[1].j=9;
	ghosts[1].show = (activeGhosts>1);
	
	ghosts[2].i=9; 
	ghosts[2].j=0;
	ghosts[2].show = (activeGhosts>2);

	ghosts[3].i=0; 
	ghosts[3].j=9;
	ghosts[3].show = (activeGhosts>3);
}

function drawObject(object){
	context.drawImage(object.image, object.i*60, object.j*60, 60, 60);
}

function updateCollisions(){
	if (movingFood.i==pacman.i && movingFood.j==pacman.j && movingFood.show){
		score+=50;
		movingFood.show=false;
	}
	if (clock.i==pacman.i && clock.j==pacman.j && clock.show){
		clock.show=false;
		clock.hit=true;
	}
	ghosts.forEach((ghost)=>{
		if (ghost.i==pacman.i && ghost.j==pacman.j && ghost.show){
			getHit();
			return;
		}
	});	
}

function getHit(){
	score-=10;
	lives--;
	repositionGhosts();
	removeFromScreen(pacman);
	repositionPacman();
}

function restart(){
	lives=5;
	score=0;
	movingFood.show=true;
	Start();
}
function repositionPacman() {
	var emptyCell = FindRandomEmptyCell(board);
	pacman.i = emptyCell[0];
	pacman.j = emptyCell[1];
}

function removeFromScreen(drawing){
	context.clearRect(drawing.i*60,drawing.j*60,60,60);
	board[drawing.i][drawing.j] = 0;
}

function moveGhosts(){
	ghosts.forEach((ghost)=>{
		if (ghost.show){
			var move= getBestMove(ghost);
			ghost.i=move[0];
			ghost.j=move[1];
			board[ghost.i][ghost.j]=3;
		}
	});
}

function getBestMove(ghost){
	var manhattan=21;
	var i = ghost.i;
	var j = ghost.j;
	var tempi = 0;
	var tempj = 0;
	if (j > 0 && board[i][j - 1] != 4) {
		if (Math.abs(i-pacman.i)+Math.abs((j-1)-pacman.j)<manhattan){
			tempi = i;
			tempj = j-1;
			manhattan = Math.abs(i-pacman.i)+Math.abs((j-1)-pacman.j);
		}
	}
	if (j < 9 && board[i][j + 1] != 4) {
		if (Math.abs(i-pacman.i)+Math.abs((j+1)-pacman.j)<manhattan){
			tempi = i;
			tempj = j+1;
			manhattan = Math.abs(i-pacman.i)+Math.abs((j+1)-pacman.j);
		}
	}

	if (i > 0 && board[i - 1][j] != 4) {
		if (Math.abs((i-1)-pacman.i)+Math.abs(j-pacman.j)<manhattan){
			tempi = i-1;
			tempj = j;
			manhattan = Math.abs((i-1)-pacman.i)+Math.abs(j-pacman.j);
		}
	}

	if (i < 9 && board[i + 1][j] != 4) {
		if (Math.abs((i+1)-pacman.i)+Math.abs(j-pacman.j)<manhattan){
			tempi = i+1;
			tempj = j;
			manhattan = Math.abs((i+1)-pacman.i)+Math.abs(j-pacman.j);
		}
	}
	return [tempi,tempj];

}

function randomMove(obj){
	i=obj.i;
	j=obj.j;
	var rand = (Math.random()*4);
	if (rand>=0 && rand<=1 && j > 0 && board[i][j - 1] != 4) {
		obj.i = i;
		obj.j = j-1;
		return;
	}
	if (rand>1 && rand<=2 && j < 9 && board[i][j + 1] != 4) {
		obj.i = i;
		obj.j = j+1;
		return;
	}

	if (rand>2 && rand<=3 && i > 0 && board[i - 1][j] != 4) {
		obj.i = i-1;
		obj.j = j;
		return;
	}

	if (rand>3 && rand<=4 && i < 9 && board[i + 1][j] != 4) {
		obj.i = i+1;
		obj.j = j;
		return;
	}
}

function initListeners(){
	initButtons();
	initSignUpForm();
	initLoginForm();
	initSettings();
	initAboutModal();
}

function initShootListener(){
	canvas.addEventListener("mousedown",Shoot);
}

function Shoot(mouse){
	if (ammo==0)
		return;
	ammo--;
	showGuns(ammo);
	for (var i=0 ; i<ghosts.length; i++){
		var startX=ghosts[i].i*60;
		var endX=ghosts[i].i*60+60;
		var startY=ghosts[i].j*60;
		var endY=ghosts[i].j*60+60;

		if (mouse.offsetX >= startX && mouse.offsetX <= endX &&
			mouse.offsetY >= startY && mouse.offsetY <= endY)
		{
				// alert("hit ghost",ghost.image.src);
				ghosts[i].show=false;
				Explosion(mouse);
				removeFromScreen(ghosts[i]);
				activeGhosts--;
				if (ammo==0)
					canvas.removeEventListener("mousedown",Shoot);
				return;
		}
		else
			PewPew();
	}

}

function sound(src) {
	this.sound = document.createElement("audio");
	this.sound.src = src;
	this.sound.setAttribute("preload", "auto");
	this.sound.setAttribute("controls", "none");
	this.sound.style.display = "none";
	document.body.appendChild(this.sound);
	this.play = function(){
	  this.sound.play();
	}
	this.stop = function(){
	  this.sound.pause();
	}
}

function Explosion(event){
	//PLAY AN EXPLOSION SOUND/ ANIMATION AT E.OFFSET
	explosionSound.play();
}

function PewPew(){
	shootSound.play();
}
function initButtons(){
	$(".pageButton").click(function(e){
		var id = e.target.getAttribute("page");
		ShowScreen(id);
	});
}
function DisabledPages(disabled){
	Array.from(document.getElementsByClassName("pageButton")).forEach(
		function(button) {
			button.disabled=disabled;
		}
	);
}
function initAboutModal() {
	var about = document.getElementById("about");
	$(".aboutButton").click(function () {
		about.style.display = "block";
		DisabledPages(true);
	});
	var span = document.getElementsByClassName("close")[0];
	span.onclick = function () {
		hideAboutModal(about);

	};
	window.onclick = function (e) {
		if (e.target == document.getElementById("about")) {
			about.style.display = "none";
			hideAboutModal(about);
		}
	};
	window.onkeyup = function(e) {
		if(e.keyCode==27){ 
			about.style.display = "none" ;
			hideAboutModal(about);
		}
	}
	
}

function hideAboutModal(about) {
	about.style.display = "none";
	DisabledPages(false);
}

function initSignUpForm(){
	$("#signUp").validate(
		{
			rules: {
				username: {
					required: true,
					checkUsername: true
				},
				fname: {
					required:true,
					pattern: "^[a-zA-Z]*$"
				},
				lname:{
					required:true,
					pattern: "^[a-zA-Z]*$"
				},
				password: {
					required:true,
					checkPassword: true,
					minlength:6
				},
				email:"required",
				bday :"required"
			},
			messages : {
				fname:{
					pattern:" No digits allowed"
				},
				lname:{
					pattern:" No digits allowed"
				},
				password:{
					checkPassword:" Please enter at least one character and one digit"
				},
				username:{
					checkUsername:" Username already exists, please choose another one"
				}
			}	
		}
	);
	$.validator.addMethod("checkPassword", function (value) {
	return /[a-zA-Z]/.test(value) && /\d/.test(value); // constains a letter and a digit
	});
	$.validator.addMethod("checkUsername", function (value) {
		return !(value in users); // username already exists
	});
	
}

function addNewUser(){
	var form =  document.getElementById("signUp");
	var newUser = {
		fname: form.fname.value,
		lname: form.lname.value,
		password: form.password.value,
		email: form.email.value,
		bday : form.bday.value
	};
	users[form.username.value]=newUser;
	form.reset();
}

function initLoginForm(){
	$("#Login").submit(function(e){
		e.preventDefault();
		var screen;
		if(ValidateLogin(e.target)){
			ShowScreen(5);
		}
		e.target.reset();
	});
}

function initSettings(){
	$("#settings").validate(
		{
			rules: {
				upKey: {
					required: true,
					checkUpKey: true,
				},
				downKey: {
					required: true,
					checkDownKey: true,
				},
				leftKey: {
					required: true,
					checkLeftKey: true,
				},
				rightKey: {
					required: true,
					checkRightKey: true,
				},
				ballsAmount: {
					required:true,
					checkBallsAmount: true,
				},
				ballA:{
					required: true,
					checkBallPoints: true,
					validtionGamePoints: true,
					// pattern: "^[0-9]*$",
				},
				ballB:{
					required: true,
					checkBallPoints: true,
					validtionGamePoints: true,
					// pattern: "^[0-9]*$",
				},
				ballC:{
					required: true,
					checkBallPoints: true,
					validtionGamePoints: true,

					// pattern: "^[0-9]*$",
				},
				gameTime:{
					required: true,
					checkGameTime: true,
					// pattern: "^[0-9]*$",
				},
			},
			messages : {
				upKey:{
					checkUpKey:"You have chosen this key all ready. Please try again"
				},
				downKey:{
					checkDownKey:"You have chosen this key all ready. Please try again"
				},
				leftKey:{
					checkLeftKey:"You have chosen this key all ready. Please try again"
				},
				rightKey:{
					checkRightKey:"You have chosen this key all ready. Please try again"
				},
				ballsAmount:{
					checkBallsAmount:"The balls amount need to be between 60 to 90 balls."
				},
				ballA:{
					checkBallsPoints:"Please enter a value greater or equal to 1.",
					validtionGamePoints: "A points should be less than the B points",
					// pattern:"Digits only",
				},
				ballB:{
					checkBallsPoints:"Please enter a value greater or equal to 1.",
					validtionGamePoints: "B points should be less than the C points and greater than the A points.",
					// pattern:"Digits only",
				},
				ballC:{
					checkBallsPoints:"Please enter a value greater or equal to 1.",
					validtionGamePoints: "C greater than the B points",
					// pattern:"Digits only",
				},
				// ballColor:{
				// 	checkPassword:"Please enter at least one character and one digit"
				// },
				gameTime:{
					checkGameTime:"The minimum time for a game is 1 minute",
					pattern:"Digits only",
				}
			}
			
		});
	$.validator.addMethod("checkBallsAmount", function (value) {
		return value>=50 && value<=90; 
	});
	$.validator.addMethod("checkUpKey", function (value) {
		return validateChoosenKeys(value,"up"); 
	});
	$.validator.addMethod("checkDownKey", function (value) {
		return validateChoosenKeys(value,"down"); 
	});
	$.validator.addMethod("checkLeftKey", function (value) {
		return validateChoosenKeys(value,"left"); 
	});
	$.validator.addMethod("checkRightKey", function (value) {
		return validateChoosenKeys(value,"right"); 
	});
	$.validator.addMethod("checkGameTime", function (value) {
		return value>=1; 
	});
	$.validator.addMethod("checkBallPoints", function (value) {
		return value>=1; 
	});
	$.validator.addMethod("validtionGamePoints", function(){
		var form = document.getElementById("settings");
		return parseInt(form.ballA.value)<parseInt(form.ballB.value) && parseInt(form.ballB.value)<parseInt(form.ballC.value);
	});
	$(".ballPoints").change(function(e){
		var validator = $( "#settings" ).validate();
		validator.resetForm();
	});
	
	$(".playingKeySettings").blur(function(e){
		InsertChosenKey(e.target,e.target.id);
		document.removeEventListener('keydown',chooseKey);
	});
	$(".playingKeySettings").focus(function(e){
		document.addEventListener('keydown' ,chooseKey);
	});
	$("#randomSettings").click(function(e){
		var form = document.getElementById("settings");
		form.up.value="ArrowUp";
		form.down.value="ArrowDown";
		form.left.value="ArrowLeft";
		form.right.value="ArrowRight";
		PlayingKeysSetup(chosenPlayingKeys);
		var randomBallsAmount = Math.floor(Math.floor(Math.random() * 41))+50;
		form.ballsAmount.value=randomBallsAmount;
		form.ballsAmountOutput.value=randomBallsAmount;
		var randomGameTime=Math.floor(Math.floor(Math.random() * 10))+1;
		form.gameTime.value=randomGameTime;
		// form.gameTimeOutput.value= randomGameTime;
		form.monstersAmount.value=Math.floor(Math.floor(Math.random() * 4))+1;
		form.colorA.value="#"+Math.floor(Math.random()*16777215).toString(16);
		form.pointsA.value=Math.floor(Math.floor(Math.random() * 10))+1;
		form.colorB.value="#"+Math.floor(Math.random()*16777215).toString(16);
		form.pointsB.value=Math.floor(Math.floor(Math.random() * 15))+11;
		form.colorC.value="#"+Math.floor(Math.random()*16777215).toString(16);
		form.pointsC.value=Math.floor(Math.floor(Math.random() * 20))+26;
		var validator = $( "#settings" ).validate();
		validator.resetForm();
	});
}

function setSettings(){
	var form = document.getElementById("settings");
	CopyPlayingKeysDicts(chosenPlayingKeys, gameSettings.playingKeys);
	gameSettings.ballsAmount = form.ballsAmount.value;
	gameSettings.gameTime = form.gameTime.value;
	gameSettings.ballsSetting["A"].color=form.colorA.value;
	gameSettings.ballsSetting["A"].points=form.pointsA.value;
	gameSettings.ballsSetting["B"].color=form.colorB.value;
	gameSettings.ballsSetting["B"].points=form.pointsB.value;
	gameSettings.ballsSetting["C"].color=form.colorC.value;
	gameSettings.ballsSetting["C"].points=form.pointsC.value;
	gameSettings.monstersAmount=form.monstersAmount.value;
	document.getElementById("ballCellA").style.backgroundColor=form.colorA.value;
	document.getElementById("ballCellB").style.backgroundColor=form.colorB.value;
	document.getElementById("ballCellC").style.backgroundColor=form.colorC.value;
	document.getElementById("ballAPoints").textContent=form.pointsA.value;
	document.getElementById("ballBPoints").textContent=form.pointsB.value;
	document.getElementById("ballCPoints").textContent=form.pointsC.value;
	ShowScreen("2");
}
function chooseKey(e){
	chosenKey=e.keyCode;
	// e.target.value=e.keyCode;
	if(chosenKey>=65 && chosenKey<=90)
		e.target.value=String.fromCharCode(chosenKey);
	else if(chosenKey==32)
		e.target.value="Space";
	else
		e.target.value=e.key;
}
function validateChoosenKeys(value, keyType){
	
	for(var key in chosenPlayingKeys){
		if(keyType!=key && value==chosenPlayingKeys[key].keyName){
			return false;
		}	
	}
	return true;
}
function absulotValdateKeys(){
	for(var key1 in chosenPlayingKeys){
		for(var key2 in chosenPlayingKeys){
			if(key1!=key2 && chosenPlayingKeys[key1].keyCode==chosenPlayingKeys[key2].keyCode){
				return false;
			}
		}
	}
	return true;
}
function InsertChosenKey(targetButton, keyType){
	if(keyType=="left"){
		chosenPlayingKeys["left"].keyCode=chosenKey;
		chosenPlayingKeys["left"].keyName=targetButton.value;
	}
	else if(keyType=="right"){
		chosenPlayingKeys["right"].keyCode=chosenKey;
		chosenPlayingKeys["right"].keyName=targetButton.value;
	}	
	else if(keyType=="up"){
		chosenPlayingKeys["up"].keyCode=chosenKey;
		chosenPlayingKeys["up"].keyName=targetButton.value;
	}
	else{
		chosenPlayingKeys["down"].keyCode=chosenKey;
		chosenPlayingKeys["down"].keyName=targetButton.value;
	}
	if(absulotValdateKeys()){
		var validator = $( "#settings" ).validate();
		validator.resetForm();
	}
}
function CopyPlayingKeysDicts(copyFrom, copyTo){
	copyTo["left"].keyCode=copyFrom["left"].keyCode;
	copyTo["left"].keyName=copyFrom["left"].keyName;
	copyTo["right"].keyCode=copyFrom["right"].keyCode;
	copyTo["right"].keyName=copyFrom["right"].keyName;
	copyTo["up"].keyCode=copyFrom["up"].keyCode;
	copyTo["up"].keyName=copyFrom["up"].keyName;
	copyTo["down"].keyCode=copyFrom["down"].keyCode;
	copyTo["down"].keyName=copyFrom["down"].keyName;
}
function resetSettingForm(){
	var form = document.getElementById("settings");
	form.up.value=gameSettings.playingKeys["up"].keyName;
	form.down.value=gameSettings.playingKeys["down"].keyName;
	form.left.value=gameSettings.playingKeys["left"].keyName;
	form.right.value=gameSettings.playingKeys["right"].keyName;
	form.ballsAmount.value=gameSettings.ballsAmount;
	form.gameTime.value=gameSettings.gameTime;
	form.monstersAmount.value=gameSettings.monstersAmount;
	form.colorA.value=gameSettings.ballsSetting["A"].color;
	form.pointsA.value=gameSettings.ballsSetting["A"].points;
	form.colorB.value=gameSettings.ballsSetting["B"].color;
	form.pointsB.value=gameSettings.ballsSetting["B"].points;
	form.colorC.value=gameSettings.ballsSetting["C"].color;
	form.pointsC.value=gameSettings.ballsSetting["C"].points;
}
function ResetSetPlayingKeysForm(){
	// var tmp = document.getElementById("#upKey").value;
	// alert(""+tmp);
	$("#upKey")[0].value=playingKeys["up"].keyName;
	$("#downKey")[0].value=playingKeys["down"].keyName;
	$("#leftKey")[0].value=playingKeys["left"].keyName;
	$("#rightKey")[0].value=playingKeys["right"].keyName;

	// document.getElementById("#upKey").value=playingKeys["up"].keyName;
	// document.getElementById("#downKey").value=playingKeys["down"].keyName;
	// document.getElementById("#leftKey").value=playingKeys["left"].keyName;
	// document.getElementById("#rightKey").value=playingKeys["right"].keyName;
}
function PlayingKeysSetup(keysArray){
	keysArray["left"]={"keyCode":37, "keyName":"ArrowLeft"};
	keysArray["right"]={"keyCode":39, "keyName":"ArrowRight"};
	keysArray["up"]={"keyCode":38, "keyName":"ArrowUp"};
	keysArray["down"]={"keyCode":40, "keyName":"ArrowDown"};
	// e.target.value=e.key;
}
function ShowScreen(pageId){
	// 
	if (activePageId=="#page5" && pageId!=5){
		resetSettingForm();
	}
	if (activePageId=="#page2" && pageId!=2){
		stopMusic();
		window.clearInterval(interval);
		window.clearInterval(ghostsinterval);
		interval=undefined;
		ghostsinterval=undefined
	}
	if (activePageId=="#page3" && pageId!=3){
		document.getElementById("signUp").reset();
	}
	if(pageId==2 && !loggedIn)
	{
		alert("You must be logged in to play the game!");
		ShowScreen(4);
		return;
	}
	var id ="#page"+pageId;
	$(activePageId).hide();
	$(id).show();
	activePageId=id;
	if(pageId==2)
		restart();
}

function ValidateLogin(form){
	var username = form["username"].value;
	var password = form["password"].value;
	var loginSuccess = false;
	if(username in users)
		loginSuccess= users[username].password==password;
	if(loginSuccess){
		loggedIn=true;
		activeUser=username;
	}
	else{
		alert("You entered an incorrect username or password.\n Please try again.");
	}
	return loginSuccess;
}

function showGuns(amount){
	// document.getElementsByClassName("gun");
	Array.from(document.getElementsByClassName("gun")).forEach(
		function(gun,i) {
			if (i<amount)
				gun.style.opacity=1;
			else
				gun.style.opacity=0;
		}
	);
}
function Start() {
	playMusic();
	initShootListener();
	showGuns(ammoAmount);
	// document.getElementById("lblTime").style.color="black";
	ghosts=[];
	context = canvas.getContext("2d");
	board = new Array();
	food = new Array();
	score = 0;
	ammo = ammoAmount;
	activeGhosts=gameSettings.monstersAmount;
	pac_color = "yellow";
	movingFood.i=5;
	movingFood.j=5;
	clock.i=5; 
	clock.j=6; 
	clock.show=false;
	clock.starTime=0;
	clock.hit=false;
	seenClock=false;
	var cnt = 100;
	food_remain = gameSettings.ballsAmount;
	var aBalls = Math.round(food_remain*0.6);
	var bBalls = Math.round(food_remain*0.3);
	var cBalls = Math.round(food_remain*0.1);
	if (aBalls+bBalls+cBalls < food_remain)
		aBalls+=food_remain-(aBalls+bBalls+cBalls);
	maxPoints= 50 + (aBalls*(parseInt(gameSettings.ballsSetting['A'].points)) +
					 bBalls*(parseInt(gameSettings.ballsSetting['B'].points)) +
					 cBalls*(parseInt(gameSettings.ballsSetting['C'].points)));
	var pacman_remain = 1;
	resetArray(food);
	resetArray(board);
	setWalls();
	for (var i = 0; i < 10; i++) {
		// board[i] = new Array();
		for (var j = 0; j < 10; j++) {
			if (i==5 && j==5)
				continue;	
			if (isWall(i, j)) {
				board[i][j] = 4;
			} else {
				var randomNum = Math.random();
				if (randomNum < (1.0 * pacman_remain) / cnt && i>1 && i<9 && j>1 && j<9) {
					pacman.i = i;
					pacman.j = j;
					pacman_remain--;
					board[i][j] = 2;
				} else {
					board[i][j] = 0;
				}
				cnt--;
			}
		}
	}
	spreadFood(aBalls,bBalls,cBalls);
	food_remain=parseInt(gameSettings.ballsAmount);
	keysDown = {};
	addEventListener(
		"keydown",
		function(e) {
			keysDown[e.keyCode] = true;
		},
		false
	);
	addEventListener(
		"keyup",
		function(e) {
			keysDown[e.keyCode] = false;
		},
		false
	);
	initGhosts();
	window.alert("Press OK to start playing!\nUse your keyboard to move,\nand your mouse to SHOOT THE MONSTERS!");
	start_time = new Date();

	if(!interval){
		interval = setInterval(UpdatePosition, intervalLength);
		ghostsinterval = setInterval(moveGhosts, intervalLength+150);
	}


}
function setWalls(){
	var index = Math.floor(Math.random()*3);
	activeWalls = wallsSet[index];
}

function resetArray(array){
	for (var i = 0; i < 10; i++) {
		array[i] = new Array();
		for (var j = 0; j < 10; j++) {
			array[i][j]=0;
		}
	}
}

function spreadFood(aBalls,bBalls,cBalls){
	while (aBalls > 0) {
		var emptyCell = FindRandomEmptyCell(board);
		food[emptyCell[0]][emptyCell[1]] = 1;
		aBalls--;
	}
	while (bBalls > 0) {
		var emptyCell = FindRandomEmptyCell(board);
		food[emptyCell[0]][emptyCell[1]] = 2;
		bBalls--;
	}
	while (cBalls > 0) {
		var emptyCell = FindRandomEmptyCell(board);
		food[emptyCell[0]][emptyCell[1]] = 3;
		cBalls--;
	}
}

function isWall(x, y) {
	for (var k =0; k<activeWalls.length ; k++)
		if (activeWalls[k].i == x && activeWalls[k].j == y)
			return true;
}

function FindRandomEmptyCell(board) { //find places for pacman and food
	var i = Math.floor(Math.random() * 10);
	var j = Math.floor(Math.random() * 10);
	while (board[i][j] != 0 || food[i][j] != 0) {
		i = Math.floor(Math.random() * 10);
		j = Math.floor(Math.random() * 10);
	}
	return [i, j];
}

function GetKeyPressed() {
	if (keysDown[gameSettings.playingKeys["up"].keyCode]) {
		return 1;
	}
	if (keysDown[gameSettings.playingKeys["down"].keyCode]) {
		return 2;
	}
	if (keysDown[gameSettings.playingKeys["left"].keyCode]) {
		return 3;
	}
	if (keysDown[gameSettings.playingKeys["right"].keyCode]) {
		return 4;
	}
}
function strip(number) {
    return (parseFloat(number).toPrecision(3));
}

function Draw() {
	canvas.width = canvas.width; //clean board
	lblScore.value = score;
	lblTime.value = strip(time_remaining);
	lblLives.value = lives;
	lblUser.value = activeUser;	
	for (var i = 0; i < 10; i++) {
		for (var j = 0; j < 10; j++) {
			var center = new Object();
			center.x = i * 60 + 30;
			center.y = j * 60 + 30;
			if (board[i][j] == 2) { // draw pacman
				context.beginPath();
				var eyePos= GetEyePosition(center.x,center.y);
				var faceAngle= GetFaceAngle(center.x, center.y);
				var arc= openMouth? 1.75: 2;
				context.arc(center.x, center.y, 30, faceAngle * Math.PI, (faceAngle+arc) * Math.PI);
				context.lineTo(center.x, center.y);
				context.fillStyle = pac_color; //color
				context.fill();
				context.beginPath();
				context.arc(eyePos[0], eyePos[1], 5, 0, 2 * Math.PI); // eye
				context.fillStyle = "black"; //color
				context.fill();
			} else if (food[i][j] == 1 || food[i][j] == 2 || food[i][j] == 3) {
				context.beginPath();
				context.arc(center.x, center.y, 15, 0, 2 * Math.PI); // circle

				if (food[i][j] == 1)
					context.fillStyle = gameSettings.ballsSetting["A"].color;
				else if (food[i][j] == 2)
					context.fillStyle = gameSettings.ballsSetting["B"].color;
				else if (food[i][j] == 3)
					context.fillStyle = gameSettings.ballsSetting["C"].color;

				context.fill();
			} else if (board[i][j] == 4) {
				context.beginPath();
				context.rect(center.x - 30, center.y - 30, 60, 60);
				context.fillStyle = "grey"; //color
				context.fill();
			}
		}
	}
	for(var i=0; i<4; i++)
		if(ghosts[i].show)
			drawObject(ghosts[i]);
	if (movingFood.show) 
		drawObject(movingFood);
	if (clock.show) 
		drawObject(clock);
}

var openMouth = true;
function GetFaceAngle(x,y){
	var startAngle = 0.15;
	switch(direction){ //rotate face
		case "right":
			break;
		case "down":
			startAngle+=0.5;
			break;
		case "left":
			startAngle+=1;
			break;
		case "up":
			startAngle+=1.5;
			break;
	}
	return startAngle;
}

function GetEyePosition(x,y){
	switch(direction){ //return relative eye position
		case "right":
			return [x+5,y-15];
		case "down":
			return [x+15,y+5];
		case "left":
			return [x-5,y-15];
		case "up":
			return [x-15,y-5];
	}
}

function UpdatePosition() {
	updateCollisions();
	randomMove(movingFood);
	randomMove(clock);
	board[pacman.i][pacman.j] = 0;
	var x = GetKeyPressed();
	if (x == 1) { //Go up
		if (pacman.j > 0 && board[pacman.i][pacman.j - 1] != 4) {
			pacman.j--;
			direction="up";
		}
	}
	if (x == 2) { //Go down
		if (pacman.j < 9 && board[pacman.i][pacman.j + 1] != 4) {
			pacman.j++;
			direction="down";
		}
	}
	if (x == 3) { //Go left
		if (pacman.i > 0 && board[pacman.i - 1][pacman.j] != 4) {
			pacman.i--;
			direction="left";
		}
	}
	if (x == 4) { //Go right
		if (pacman.i < 9 && board[pacman.i + 1][pacman.j] != 4) {
			pacman.i++;
			direction="right";
		}
	}
	if (food[pacman.i][pacman.j] == 1) {
		score+= parseInt(gameSettings.ballsSetting["A"].points);
		food[pacman.i][pacman.j]=0;
		food_remain--;
	}
	if (food[pacman.i][pacman.j] == 2) {
		score+= parseInt(gameSettings.ballsSetting["B"].points);
		food[pacman.i][pacman.j]=0;
		food_remain--;
	}
	if (food[pacman.i][pacman.j] == 3) {
		score+= parseInt(gameSettings.ballsSetting["C"].points);
		food[pacman.i][pacman.j]=0;
		food_remain--;
	}
	openMouth=!openMouth;
	board[pacman.i][pacman.j] = 2;
	
	if (lives==0){
		alert("Loser!");
		restart();
	}
	var currentTime = new Date();
	time_remaining = (gameSettings.gameTime*60)-(currentTime - start_time) / 1000;
	if(clock.hit)
		time_remaining+=15;

	if (seenClock==false){
		var rand = Math.floor(Math.random()*1000);
		if (rand < 20){
			clock.show=true;
			seenClock=true;
			clock.starTime=time_remaining;
		}
	}
	if (clock.show==true && clock.starTime > time_remaining+10){
		clock.show=false;
	}
	if (score >= 20 && time_remaining >= 50) {
		pac_color = "green";
	}
	if (time_remaining<=0){
		window.clearInterval(interval);
		window.clearInterval(ghostsinterval);
		interval=undefined;
		document.getElementById("lblTime").style.color="black";
		if (score<100){
			window.alert("You are better than "+score+" points!");
			restart();
		}
		else {
			window.alert("Winner!");
			restart();
		}
	}
	
	if (time_remaining<10){
		document.getElementById("lblTime").style.color="red";
	}
	if (score == maxPoints) {
		window.clearInterval(interval);
		window.clearInterval(ghostsinterval);
		interval=undefined;
		window.alert("You won with maximum score! Well done!");
		restart();
	} else if (food_remain==0){
		window.clearInterval(interval);
		window.clearInterval(ghostsinterval);
		interval=undefined;
		window.alert("No more food! Nice job!");
		restart();
 	} else {
		Draw();
	}
	
}
