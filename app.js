var context;
var shape = new Object();
var board;
var score;
var pac_color;
var start_time;
var time_elapsed;
var interval;
var login = false;
var activePageId='#page1';
var users=[];
var activeUser="";
var playingKeys = [];
playingKeysSetup(playingKeys);
var chosenPlayingKeys=[];
playingKeysSetup(chosenPlayingKeys);
var chosenKey=0;

users["oded"]={"firstName":"oded", "lasName":"Berkovich", "password":"123"};
users["eilam"]={"firstName":"eilam", "lasName":"gal"};

$(document).ready(function() {
	initListeners();
});

function initListeners(){
	$(".pageButton").click(function(e){
		var id = e.target.getAttribute("page");
		showScreen(id);
	});
	initSignUpForm();
	initLoginForm();
	initSettings();
}

function initSignUpForm(){
	$("#signUp").validate(
		{
			rules: {
				fname: {
					required:true,
					pattern: "^[a-zA-Z]*$"
				},
				lname:{
					required:true,
					minlength:4,
					pattern: "^[a-zA-Z]*$"
				},
				password: {
					required:true,
					checkPassword: true,
					minlength:6
				}
			},
			messages : {
				password:{
					checkPassword:"Please enter at least one character and one digit"
				}
			}
			
		}
	);
	$.validator.addMethod("checkPassword", function (value) {
	return /[a-zA-Z]/.test(value) && /\d/.test(value); // constains a letter and a digit
	});
}
function initLoginForm(){
	$("#Login").submit(function(e){
		e.preventDefault();
		var screen;
		if(validateLogin(e.target)){
			screen=2;
		}
		else{
			screen=4;
		}
		e.target.reset();
		showScreen(screen);
	});
}

function initSettings(){
	

	$("#setPlayingKeys").submit(function(e){
		e.preventDefault();
		
		if(validateChoosenKeys()){
			copyPlayingKeysDicts(chosenPlayingKeys, playingKeys);
		}
		else{
			copyPlayingKeysDicts(playingKeys, chosenPlayingKeys);

			alert("You have chosen the same key twice. Please try again");
		}
		resetSetPlayingKeysForm();
		// var tmp = document.getElementById("#upKey").value;
		// alert(""+tmp);
		e.target.reset();
		showScreen(5);
	});
	$("#upKey").blur(function(e){
		insertChoosenKey(e.target,"up");
		document.removeEventListener('keydown',chooseKey);
	});
	$("#upKey").focus(function(e){
		document.addEventListener('keydown' ,chooseKey);
	});
	$("#downKey").blur(function(e){
		insertChoosenKey(e.target,"down");
		document.removeEventListener('keydown',chooseKey);
	});
	$("#downKey").focus(function(e){
		document.addEventListener('keydown' ,chooseKey);
	});
	$("#leftKey").blur(function(e){
		insertChoosenKey(e.target,"left");
		document.removeEventListener('keydown',chooseKey);
	});
	$("#leftKey").focus(function(e){
		document.addEventListener('keydown' ,chooseKey);
	});
	$("#rightKey").blur(function(e){
		insertChoosenKey(e.target,"right");
		document.removeEventListener('keydown',chooseKey);
	});
	$("#rightKey").focus(function(e){
		document.addEventListener('keydown' ,chooseKey);
	});
}


// function initPages() {
// 	for (var i = 2; i <= 6; i++) {
// 		var id = "#page" + i;
// 		$(id).hide();
// 	}
// }
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
function insertChoosenKey(targetButton, keyType){
	if(keyType=="left"){
		chosenPlayingKeys["left"].keyCode=chosenKey;
		chosenPlayingKeys["left"].keyName=targetButton.value;
	}
	else if(keyType=="right"){
		chosenPlayingKeys["right"].keyCode=chosenKey;
		chosenPlayingKeys["right"].keyName=targetButton.vale;
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
function copyPlayingKeysDicts(copyFrom, copyTo){
	copyTo["left"].keyCode=copyFrom["left"].keyCode;
	copyTo["left"].keyName=copyFrom["left"].keyName;
	copyTo["right"].keyCode=copyFrom["right"].keyCode;
	copyTo["right"].keyName=copyFrom["right"].keyName;
	copyTo["up"].keyCode=copyFrom["up"].keyCode;
	copyTo["up"].keyName=copyFrom["up"].keyName;
	copyTo["down"].keyCode=copyFrom["down"].keyCode;
	copyTo["down"].keyName=copyFrom["down"].keyName;
}
function resetSetPlayingKeysForm(){
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
function playingKeysSetup(keysArray){
	keysArray["left"]={"keyCode":37, "keyName":"ArrowLeft"};
	keysArray["right"]={"keyCode":39, "keyName":"ArrowRight"};
	keysArray["up"]={"keyCode":38, "keyName":"ArrowUp"};
	keysArray["down"]={"keyCode":40, "keyName":"ArrowDown"};
}
function showScreen(pageId){
	if(pageId==2)
	{
		Start();
	}
	var id ="#page"+pageId;
	$(activePageId).hide();
	$(id).show();
	activePageId=id;
}

function validateLogin(form){
	var username = form["username"].value;
	var password = form["password"].value;
	var loginSuccess = false;
	if(username in users)
		loginSuccess= users[username].password==password;
	if(loginSuccess){
		login=true;
		activeUser=username;
	}
	else{
		alert("You entered an incorrect username or password.\n Please try again.");
	}
	return loginSuccess;
}

function Start() {
	context = canvas.getContext("2d");
	board = new Array();
	score = 0;
	pac_color = "yellow";
	var cnt = 100;
	var food_remain = 50;
	var pacman_remain = 1;
	start_time = new Date();
	for (var i = 0; i < 10; i++) {
		board[i] = new Array();
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
					shape.i = i;
					shape.j = j;
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
		var emptyCell = findRandomEmptyCell(board);
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
	interval = setInterval(UpdatePosition, 100);
}

function findRandomEmptyCell(board) {
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
				context.arc(center.x, center.y, 30, 0.15 * Math.PI, 1.85 * Math.PI); // half circle
				context.lineTo(center.x, center.y);
				context.fillStyle = pac_color; //color
				context.fill();
				context.beginPath();
				context.arc(center.x + 5, center.y - 15, 5, 0, 2 * Math.PI); // circle
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
}

function UpdatePosition() {
	board[shape.i][shape.j] = 0;
	var x = GetKeyPressed();
	if (x == 1) {
		if (shape.j > 0 && board[shape.i][shape.j - 1] != 4) {
			shape.j--;
		}
	}
	if (x == 2) {
		if (shape.j < 9 && board[shape.i][shape.j + 1] != 4) {
			shape.j++;
		}
	}
	if (x == 3) {
		if (shape.i > 0 && board[shape.i - 1][shape.j] != 4) {
			shape.i--;
		}
	}
	if (x == 4) {
		if (shape.i < 9 && board[shape.i + 1][shape.j] != 4) {
			shape.i++;
		}
	}
	if (board[shape.i][shape.j] == 1) {
		score++;
	}
	board[shape.i][shape.j] = 2;
	var currentTime = new Date();
	time_elapsed = (currentTime - start_time) / 1000;
	if (score >= 20 && time_elapsed <= 10) {
		pac_color = "green";
	}
	if (score == 50) {
		window.clearInterval(interval);
		window.alert("Game completed");
	} else {
		Draw();
	}
}
