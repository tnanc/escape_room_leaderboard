//Server at 10.11.40.129
class entry{
    constructor(room,team,time){
        this.room = room;
        this.team = team;
        this.time = time;
    }
    toString(){
        return this.team+" "+this.time;
    }
    toJSON(){
        return "{\"Room\":\""+this.room+"\",\"Team\":\""+this.team+",\"Time\":\""+this.time+"\"}";
    }
};

//window height / 2 - height of #leaderboard

//ghostly, game, remote, teacher, elevate, mascot
var rooms = [];
var roomArray = [];
var roomToShow = 0;


fetch('../leaderboard.json')
.then(response => response.json())
.then(data => {
    for(let index in data){
        let roomNum;
        let room = data[index].Room;
        if(!(rooms.includes(room))){
            window.rooms.push(room);
            window.roomArray.push([]);
        }
        roomNum = rooms.indexOf(room);
        
        if(roomNum == -1) {
            console.log("Index "+ index+ ": " + room+" is not a real room")
        } else {
            window.roomArray[roomNum].push(new entry(room,data[index].Team,data[index].Time));
        }
        
    }
    
    /*for(let arrNum in roomArray){
        window.roomArray[arrNum] = mergeSort(window.roomArray[arrNum]);
    }*/

    displayRoom("Mascot Mania");

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
    let input, filter, a;
    input = document.getElementById("roomSearch");
    filter = input.value.toUpperCase();
    div = document.getElementById("roomsList");
    a = div.getElementsByTagName("a");
    for (let i = 0; i < a.length; i++) {
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
            roomLogos[0].src = "../images/GhostlyFigures.jpg";
            roomLogos[1].src = "../images/GhostlyFigures.jpg";
            title.textContent = "Ghostly Figures";
            roomToShow = 0;
            break;
        case "Game On":
            roomLogos[0].src = "../images/GameOn.jpg";
            roomLogos[1].src = "../images/GameOn.jpg";
            title.textContent = "Game On";
            roomToShow = 1;
            break;
        case "Where's The Remote":
            roomLogos[0].src = "../images/WheresTheRemote.jpg";
            roomLogos[1].src = "../images/WheresTheRemote.jpg";
            title.textContent = "Where's The Remote";
            roomToShow = 2;
            break;
        case "Teacher's Pet":
            roomLogos[0].src = "../images/TeachersPet.jpg";
            roomLogos[1].src = "../images/TeachersPet.jpg";
            title.textContent = "Teacher's Pet";
            roomToShow = 3;
            break;
        case "Elevated Terror":
            roomToShow = 4;
            break;
        case "Mascot Mania":
            roomLogos[0].src = "../images/MascotMania.jpg";
            roomLogos[1].src = "../images/MascotMania.jpg";
            title.textContent = "Mascot Mania";
            roomToShow = 4;
            break;
        default:
            r.src = "../images/testImage.jpg";
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

function toggleNewEntry(open) {
    var popup = document.getElementById("newEntry");
    
    if(open){ popup.style.display = "block"; }
    else{ popup.style.display = "none";
    }
}