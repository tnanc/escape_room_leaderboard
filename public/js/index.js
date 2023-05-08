//Server at 10.11.40.129
class entry{
    constructor(Room,Team,Time){
        this.Room = Room;
        this.Team = Team;
        this.Time = Time;
    }
    toString(){
        return this.Team+" "+this.Time;
    }
    toJSON(){
        return "{\"Room\":\""+this.Room+"\",\"Team\":\""+this.Team+",\"Time\":\""+this.Time+"\"}";
    }
};

//window height / 2 - height of #leaderboard

//ghostly, game, remote, teacher, elevate, mascot
var rooms = [];
var roomArray = [];
var roomToShow = 0;
var jsondata;

fetch("../leaderboard.json")
.then(response => response.json())
.then(data => {
    jsondata = data;
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
    
    for(let arrNum in roomArray){
        window.roomArray[arrNum] = mergeSort(window.roomArray[arrNum]);
    }

    displayRoom("Mascot Mania");

})
.catch(err => console.log(err));

function mergeSort(arr) {
    if (arr.length <= 1) {
      return arr; // base case: arrays with 0 or 1 element are already sorted
    }
  
    // Split the array into two halves
    const middleIndex = Math.floor(arr.length / 2);
    const leftHalf = arr.slice(0, middleIndex);
    const rightHalf = arr.slice(middleIndex);
  
    // Recursively sort each half
    const sortedLeft = mergeSort(leftHalf);
    const sortedRight = mergeSort(rightHalf);
  
    // Merge the two sorted halves back together
    const mergedArr = [];
    let leftIndex = 0;
    let rightIndex = 0;
  
    while (leftIndex < sortedLeft.length && rightIndex < sortedRight.length) {
        let leftMins = parseInt(sortedLeft[leftIndex].Time.split(":")[0],10);
        let rightMins = parseInt(sortedRight[rightIndex].Time.split(":")[0],10);
        if(leftMins == rightMins){
            let leftSecs = parseInt(sortedLeft[leftIndex].Time.split(":")[1],10);
        let rightSecs = parseInt(sortedRight[rightIndex].Time.split(":")[1],10);
        if (leftSecs < rightSecs) {
            mergedArr.push(sortedLeft[leftIndex]);
            leftIndex++;
          } else {
            mergedArr.push(sortedRight[rightIndex]);
            rightIndex++;
          }
        } else if (leftMins < rightMins) {
        mergedArr.push(sortedLeft[leftIndex]);
        leftIndex++;
      } else {
        mergedArr.push(sortedRight[rightIndex]);
        rightIndex++;
      }
    }
  
    return mergedArr.concat(sortedLeft.slice(leftIndex)).concat(sortedRight.slice(rightIndex));
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
            teams[j-1].textContent = room[j-1].Team;
            times[j-1].textContent = room[j-1].Time;
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
    
    if(open){ popup.style.display = "block"; populateRoomRadio(); }
    else{ popup.style.display = "none"; document.getElementById("roomSelect").innerHTML = ""; }
}

function populateRoomRadio(){
    const select = document.getElementById("roomSelect");
    for(let room of rooms){
        const option = document.createElement("option");
        option.value = room;
        option.innerHTML = room;
        select.appendChild(option);
    }
}

document.addEventListener("DOMContentLoaded",()=>{
    const form = document.getElementById('formEntry');
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        window.jsondata.push(Object.fromEntries(new FormData(form).entries()));

        fetch('/newEntry', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jsondata),
        })
        .then((response) => response.json())
        .then((data) => console.log(data))
        .catch((error) => console.error(error));
    });
})
