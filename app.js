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
	$("#upKey").blur(function(){
		document.removeEventListener('keydown',chooseKey);
	});
	$("#upKey").focus(function(e){
		document.addEventListener('keydown' ,chooseKey);
	});
	$("#downKey").blur(function(){
		document.removeEventListener('keydown',chooseKey);
	});
	$("#downKey").focus(function(e){
		document.addEventListener('keydown' ,chooseKey);
	});
	$("#leftKey").blur(function(){
		document.removeEventListener('keydown',chooseKey);
	});
	$("#leftKey").focus(function(e){
		document.addEventListener('keydown' ,chooseKey);
	});
	$("#rightKey").blur(function(){
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
	e.target.value=event.key;
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
	var username = form["userName"].value;
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
	if (keysDown[38]) {
		return 1;
	}
	if (keysDown[40]) {
		return 2;
	}
	if (keysDown[37]) {
		return 3;
	}
	if (keysDown[39]) {
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
