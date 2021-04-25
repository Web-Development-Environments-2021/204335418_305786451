var context;
var pacman = {
	i:1,
	j:1
};
var board;
var score;
var pac_color;
var start_time;
var time_elapsed;
var interval;
var intervalSet = false;
var loggedIn = true;
var activePageId='#page1';
var users=[];
var intervalLength=150;
var activeUser="";
var maxPoints=50;
var playingKeys = [];
PlayingKeysSetup(playingKeys);
var chosenPlayingKeys=[];
PlayingKeysSetup(chosenPlayingKeys);
var chosenKey=0;

var ghostImages=[];
var ghosts=[]; //
var ghostsAmount=3; //user's settings
var activeGhosts=ghostsAmount; //ghosts in game

var direction="left";

var lives = 5

users["k"]={"firstname":"tester", "lastname":"tester", "password":"k"};
users["eilam"]={"firstName":"eilam", "lastname":"gal", "password":"eilamtheking"};

$(document).ready(function() {
	initListeners();
	initImages();
});

function initImages(){
	ghostImages[0] = new Image();
	ghostImages[0].src= "images/blue.png";
	ghostImages[1] = new Image();
	ghostImages[1].src= "images/red.png";
	ghostImages[2] = new Image();
	ghostImages[2].src= "images/green.png";
	ghostImages[3] = new Image();
	ghostImages[3].src= "images/yellow.png";
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

function repositionGhosts(){
	//update starting positions to corners
	ghosts[0].i=0; 
	ghosts[0].j=0;
	ghosts[0].show = (activeGhosts>1);

	ghosts[1].i=0; 
	ghosts[1].j=9;
	ghosts[1].show = (activeGhosts>1);
	
	ghosts[2].i=9; 
	ghosts[2].j=0;
	ghosts[2].show = (activeGhosts>2);

	ghosts[3].i=9; 
	ghosts[3].j=9;
	ghosts[3].show = (activeGhosts>3);
}

function drawGhost(ghost){
	context.drawImage(ghost.image, ghost.i*60, ghost.j*60, 60, 60);
}

function updateCollisions(){
	ghosts.forEach((ghost)=>{
		if (ghost.i==pacman.i && ghost.j==pacman.j && ghost.show)
			getHit();
			return;
	});
}

function getHit(){
	score-=10;
	lives--;
	if (lives==0){
		gameOver();
	}
	repositionGhosts();
	removeFromScreen(pacman);
	repositionPacman();
}

function gameOver(){
	alert("You Lost!");
	restart();
}

function restart(){
	lives=5;
	score=0;
	activeGhosts=ghostsAmount;
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
			// var i = ghost.i;
			// var j = ghost.j;
			// var before = board[i][j];

			var move= getBestMove(ghost);
			// removeFromScreen(ghost);
			ghost.i=move[0];
			ghost.j=move[1];
			// board
			board[move[0]][move[1]]=3;

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
function initListeners(){
	initButtons();
	initSignUpForm();
	initLoginForm();
	initSettings();
	initAboutModal();
}

function initButtons(){
	$(".pageButton").click(function(e){
		var id = e.target.getAttribute("page");
		ShowScreen(id);
	});
}

function initAboutModal() {
	var about = document.getElementById("about");
	$(".aboutButton").click(function () {
		about.style.display = "block";
	});
	var span = document.getElementsByClassName("close")[0];
	span.onclick = function () {
		about.style.display = "none";
	};
	window.onclick = function (e) {
		if (e.target == document.getElementById("about")) {
			about.style.display = "none";
		}
	};
	window.onkeyup = function(e) {
		if(e.keyCode==27) 
			about.style.display = "none" ;
	}
	
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
					pattern:"No digits allowed"
				},
				lname:{
					pattern:"No digits allowed"
				},
				password:{
					checkPassword:"Please enter at least one character and one digit"
				},
				username:{
					checkUsername:"Username already exists, please choose another one"
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
	
	$("#setPlayingKeys").submit(function(e){
		e.preventDefault();
		
		if(validateChoosenKeys()){
			CopyPlayingKeysDicts(chosenPlayingKeys, playingKeys);
		}
		else{
			CopyPlayingKeysDicts(playingKeys, chosenPlayingKeys);

			alert("You have chosen the same key twice. Please try again");
		}
		ResetSetPlayingKeysForm();
		// var tmp = document.getElementById("#upKey").value;
		// alert(""+tmp);
		e.target.reset();
		ShowScreen(5);
	});
	$("#upKey").blur(function(e){
		InsertChosenKey(e.target,"up");
		document.removeEventListener('keydown',chooseKey);
	});
	$("#upKey").focus(function(e){
		document.addEventListener('keydown' ,chooseKey);
	});
	$("#downKey").blur(function(e){
		InsertChosenKey(e.target,"down");
		document.removeEventListener('keydown',chooseKey);
	});
	$("#downKey").focus(function(e){
		document.addEventListener('keydown' ,chooseKey);
	});
	$("#leftKey").blur(function(e){
		InsertChosenKey(e.target,"left");
		document.removeEventListener('keydown',chooseKey);
	});
	$("#leftKey").focus(function(e){
		document.addEventListener('keydown' ,chooseKey);
	});
	$("#rightKey").blur(function(e){
		InsertChosenKey(e.target,"right");
		document.removeEventListener('keydown',chooseKey);
	});
	$("#rightKey").focus(function(e){
		document.addEventListener('keydown' ,chooseKey);
	});
}

function chooseKey(e){
	chosenKey=e.keyCode;
	// e.target.value=e.keyCode;
	if(chosenKey>=65 && chosenKey<=90)
		e.target.value=String.fromCharCode(chosenKey);
	else{
		e.target.value=e.key;
	}
}
function validateChoosenKeys(){
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

	// if(chosenKey==playingKeys["left"].keyCode && key!="left"){
	// 	targetButton.value=leftKeyName;
	// 	alert("This key is already used.");
	// } 
	// else if(chosenKey==playingKeys["right"].keyCode && key!="right"){
	// 	targetButton.value=rightKeyName;
	// 	alert("This key is already used.");
	// }
	// else if(chosenKey==playingKeys["up"].keyCode && key!="up"){
	// 	targetButton.value=upKeyName;
	// 	alert("This key is already used.");
	// } 
	// else if(chosenKey==playingKeys["down"].keyCode && key!="down"){
	// 	targetButton.value=downKeyName;
	// 	alert("This key is already used.");
	// }
	// else{
	// 	if(key=="left"){
	// 		playingKeys["left"].keyCode=choosenKey;
	// 		playingKeys["left"].keyName=targetButton.value;
	// 	}
	// 	else if(key=="right"){
	// 		playingKeys["right"].keyCode=choosenKey;
	// 		playingKeys["right"].keyName=targetButton.vale;
	// 	}	
	// 	else if(key=="up"){
	// 		playingKeys["up"].keyCode=choosenKey;
	// 		playingKeys["up"].keyName=targetButton.value;
	// 	}
	// 	else{
	// 		playingKeys["down"].keyCode=choosenKey;
	// 		playingKeys["down"].keyName=targetButton.value;
	// 	}
	// }
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
	if (activePageId==2 && pageId!=2){
		window.clearInterval(interval);
		window.clearInterval(ghostsinterval);

	}
	if(pageId==2)
	{
		if (!loggedIn){
			alert("You must be logged in to play the game!");
			ShowScreen(4);
			return;

			// Start();
			// return;
		}
		// else {
		// 	alert("You must be logged in to play the game!");
		// 	ShowScreen(4);
		// 	return;
		// }
	}
	var id ="#page"+pageId;
	$(activePageId).hide();
	$(id).show();
	activePageId=id;
	if(pageId==2)
		Start();
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
var ghostsinterval;
function Start() {
	ghosts=[];
	context = canvas.getContext("2d");
	board = new Array();
	score = 0;
	pac_color = "yellow";
	var cnt = 100;
	var food_remain = 50;
	var pacman_remain = 1;
	var ghosts_remain = ghostsAmount;

	start_time = new Date();
	for (var i = 0; i < 10; i++) {
		board[i] = new Array();
		board[0][0]=3;
		//put obstacles in (i=3,j=3) and (i=3,j=4) and (i=3,j=5), (i=6,j=1) and (i=6,j=2)
		for (var j = 0; j < 10; j++) {
			if (
				(i == 3 && j == 3) ||
				(i == 3 && j == 4) ||
				(i == 3 && j == 5) ||
				(i == 6 && j == 1) ||
				(i == 6 && j == 2)
			) {
				board[i][j] = 4;
			} else {
				var randomNum = Math.random();
				if (randomNum <= (1.0 * food_remain) / cnt) {
					food_remain--;
					board[i][j] = 1;
				} else if (randomNum < (1.0 * (pacman_remain + food_remain)) / cnt) {
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
	while (food_remain > 0) {
		var emptyCell = FindRandomEmptyCell(board);
		board[emptyCell[0]][emptyCell[1]] = 1;
		food_remain--;
	}
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

	if(!interval){
		interval = setInterval(UpdatePosition, intervalLength);
		ghostsinterval = setInterval(moveGhosts, intervalLength+75);

	}


}

function FindRandomEmptyCell(board) { //INSERT GHOSTS LOCATIONS
	var i = Math.floor(Math.random() * 9 + 1);
	var j = Math.floor(Math.random() * 9 + 1);
	while (board[i][j] != 0) {
		i = Math.floor(Math.random() * 9 + 1);
		j = Math.floor(Math.random() * 9 + 1);
	}
	return [i, j];
}

function GetKeyPressed() {
	// if (keysDown[38]) {
	// 	return 1;
	// }
	// if (keysDown[40]) {
	// 	return 2;
	// }
	// if (keysDown[37]) {
	// 	return 3;
	// }
	// if (keysDown[39]) {playingKeys
	// 	return 4;
	// }
	if (keysDown[playingKeys["up"].keyCode]) {
		return 1;
	}
	if (keysDown[playingKeys["down"].keyCode]) {
		return 2;
	}
	if (keysDown[playingKeys["left"].keyCode]) {
		return 3;
	}
	if (keysDown[playingKeys["right"].keyCode]) {
		return 4;
	}
}

function Draw() {
	canvas.width = canvas.width; //clean board
	lblScore.value = score;
	lblTime.value = time_elapsed;
	for (var i = 0; i < 10; i++) {
		for (var j = 0; j < 10; j++) {
			var center = new Object();
			center.x = i * 60 + 30;
			center.y = j * 60 + 30;
			if (board[i][j] == 2) {
				context.beginPath();
				var eyePos= GetEyePosition(center.x,center.y);
				var faceAngle= GetFaceAngle(center.x, center.y);
				context.arc(center.x, center.y, 30, faceAngle * Math.PI, (faceAngle+1.75) * Math.PI);
				context.lineTo(center.x, center.y);
				context.fillStyle = pac_color; //color
				context.fill();
				context.beginPath();
				context.arc(eyePos[0], eyePos[1], 5, 0, 2 * Math.PI); // eye
				context.fillStyle = "black"; //color
				context.fill();
			} else if (board[i][j] == 1) {
				context.beginPath();
				context.arc(center.x, center.y, 15, 0, 2 * Math.PI); // circle
				context.fillStyle = "black"; //color
				context.fill();
			} else if (board[i][j] == 4) {
				context.beginPath();
				context.rect(center.x - 30, center.y - 30, 60, 60);
				context.fillStyle = "grey"; //color
				context.fill();
			}
		}
	}
	for(var i=0; i<activeGhosts; i++)
		drawGhost(ghosts[i]);
}

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
	if (board[pacman.i][pacman.j] == 1) {
		score++;
	}
	board[pacman.i][pacman.j] = 2;
	updateCollisions();
	// moveGhosts();
	var currentTime = new Date();
	time_elapsed = (currentTime - start_time) / 1000;
	if (score >= 20 && time_elapsed <= 10) {
		pac_color = "green";
	}
	if (score == maxPoints) {
		window.clearInterval(interval);
		window.clearInterval(ghostsinterval);
		interval=undefined;
		window.alert("Game completed");
	} else {
		Draw();
	}
}
