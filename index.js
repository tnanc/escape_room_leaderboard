//Server at 10.11.40.129

class entry{
    constructor(team,time){
        this.team = team;
        this.time = time;
    }
    toString(){
        return this.team+" "+this.time;
    }
};

//window height / 2 - height of #leaderboard

//ghostly, game, remote, teacher, elevate, forensic
var roomArray = [[],[],[],[],[],[]];
var roomToShow = 1;

fetch('./resources/leaderboard.json')
.then(response => response.json())
.then(data => {
    for(let index in data){
        var roomNum;
        switch(data[index].Room){
            case "Ghostly Figures":
                roomNum = 0;
                break;
            case "Game On":
                roomNum = 1;
                break;
            case "Where's The Remote":
                roomNum = 2;
                break;
            case "Teacher's Pet":
                roomNum = 3;
                break;
            case "Elevated Terror":
                roomNum = 4;
                break;
            case "":
                roomNum = 5;
                break;
            default:
                roomNum = -1;
                break;
        }
        
        if(roomNum == -1) {
            console.log("Index "+ index+ ": " + data[index].Room+" is not a real room")
        } else {
            window.roomArray[roomNum].push(new entry(data[index].Team,data[index].Time));
        }
        
    }
    
    for(let arrNum in roomArray){
        window.roomArray[arrNum] = mergeSort(window.roomArray[arrNum]);
    }

    displayRoom("Ghostly Figures");

})
.catch(err => console.log(err));


function mergeSort(arr) {
    if (arr.length <= 1) { return arr; }

    const middle = Math.floor(arr.length / 2);
    const left = arr.slice(0, middle);
    const right = arr.slice(middle);

    const sortedLeft = mergeSort(left);
    const sortedRight = mergeSort(right);

    return merge(sortedLeft, sortedRight);
}

function merge(left, right) {
    let result = [];
    let leftIndex = 0;
    let rightIndex = 0;

    while (leftIndex < left.length && rightIndex < right.length) {
        if (left[leftIndex].time < right[rightIndex].time) {
            result.push(left[leftIndex]);
            leftIndex++;
        } else {
            result.push(right[rightIndex]);
            rightIndex++;
        }
    }

    return result.concat(left.slice(leftIndex)).concat(right.slice(rightIndex));
}

var open = false;
function toggleNav(){
	if(open){
    	document.getElementById("nav").style.width = "0";
  		document.getElementById("open").style.marginRight= "0";
        open = false;
    } else {
    	document.getElementById("nav").style.width = "250px";
  		document.getElementById("open").style.marginRight= "250px";
        open = true;
    }
}

function toggleRoomDrop() {
    document.getElementById("roomsList").classList.toggle("show");
  }
  
function roomFilter() {
    var input, filter, ul, li, a, i;
    input = document.getElementById("roomSearch");
    filter = input.value.toUpperCase();
    div = document.getElementById("roomsList");
    a = div.getElementsByTagName("a");
    for (i = 0; i < a.length; i++) {
        txtValue = a[i].textContent || a[i].innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
        a[i].style.display = "";
        } else {
        a[i].style.display = "none";
        }
    }
}

function displayRoom(roomName){
    let roomLogos = document.getElementsByClassName("roomLogo");
    let title = document.getElementById("roomTitle");
    switch(roomName){
        case "Ghostly Figures":
            roomLogos[0].src = "./resources/images/GhostlyFigures.jpg";
            roomLogos[1].src = "./resources/images/GhostlyFigures.jpg";
            title.textContent = "Ghostly Figures";
            roomToShow = 0;
            break;
        case "Game On":
            roomLogos[0].src = "./resources/images/GameOn.jpg";
            roomLogos[1].src = "./resources/images/GameOn.jpg";
            title.textContent = "Game On";
            roomToShow = 1;
            break;
        case "Where's The Remote":
            roomLogos[0].src = "./resources/images/WheresTheRemote.jpg";
            roomLogos[1].src = "./resources/images/WheresTheRemote.jpg";
            title.textContent = "Where's The Remote";
            roomToShow = 2;
            break;
        case "Teacher's Pet":
            roomLogos[0].src = "./resources/images/TeachersPet.jpg";
            roomLogos[1].src = "./resources/images/TeachersPet.jpg";
            title.textContent = "Teacher's Pet";
            roomToShow = 3;
            break;
        case "Elevated Terror":
            roomToShow = 4;
            break;
        case "":
            roomToShow = 5;
            break;
        default:
            r.src = "./resources/images/testImage.jpg";
            break;
    }

    let ranks = document.getElementsByClassName("rank");
    let teams = document.getElementsByClassName("team");
    let times = document.getElementsByClassName("time");
    let room = window.roomArray[window.roomToShow];
    for(let j=1; j<=room.length; j++){
        if(j<=5){
            ranks[j-1].textContent = j;
            teams[j-1].textContent = room[j-1].team;
            times[j-1].textContent = room[j-1].time;
        } else {
            break;
        }
    }

    let leaderboard = document.getElementById("leaderboard");
    let height = (window.innerHeight-leaderboard.offsetHeight)/2+document.getElementsByTagName("footer")[0].offsetHeight;
    leaderboard.style.bottom = height+"px";
}