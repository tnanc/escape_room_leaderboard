/*
Room Format:
{
    "RoomName":"Test Room",
    "RoomLogo":"",
    "Entries":[
        {"Team":"Test","Time":"0:00"}
    ]
}
*/

var rooms = [];
const modal = [
    {"displays":""},
    {"room_add":""},
    {"room_edit":""},
    {"entry_add":""},
    {"entry_edit":""}
];
var timer;

/**
 * Recursive algorithm to split an array of entries and recursively
 * sort it in ascending order according to each entry's time.
 * @param {*} arr
 * @returns merged left and right arrays
 */
function mergeSort(arr) {
    if (arr.length <= 1) {
      return arr;
    }
  
    const middleIndex = Math.floor(arr.length / 2);
    const leftHalf = arr.slice(0, middleIndex);
    const rightHalf = arr.slice(middleIndex);
  
    const sortedLeft = mergeSort(leftHalf);
    const sortedRight = mergeSort(rightHalf);
  
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

/**
 * Fetches data from settings.json and loads
 * it into the leaderboard display
 */
function loadDisplay(){
    fetch("/settings", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    })
    .then((response) => response.json())
    .then((data) => {
        document.getElementById("titleText").textContent = data.TitleText;
        document.getElementById("brandLogo").src = "./data/images/" + data.BusinessLogo;
    })
    .catch((error) => console.error(error));
}

/**
 * Fetches data from each .json file in /rooms 
 * and parses it, sorting the entries before
 * pushing the data into window.rooms
 */
function loadRooms(){
    fetch("/rooms", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    })
    .then((response) => response.json())
    .then((data) => {
        window.rooms = [];
        for(let room of data){
            let parsed = JSON.parse(room);
            parsed.Entries = mergeSort(parsed.Entries);
            window.rooms.push(parsed);
        }
    })
    .catch((error) => console.error(error));
}

/**
 * Displays a room's entries on the leaderboard,
 * up to entry number <display> (5 at a time)
 * @param {string} room 
 * @param {int} display 
 */
function roomDisplay(room, display){
    const logo = document.getElementsByClassName("roomLogo");
    const name = document.getElementById("roomName");
    const board = document.getElementById("leaderboard");
    let rank = 1;

    board.innerHTML =
        "<tr> \
        <th>Rank</th> \
        <th>Team</th> \
        <th>Time</th> \
        </tr> \
        <tr><td></td><td></td><td></td></tr> \
        <tr><td></td><td></td><td></td></tr> \
        <tr><td></td><td></td><td></td></tr> \
        <tr><td></td><td></td><td></td></tr> \
        <tr><td></td><td></td><td></td></tr>"
    ;
    
    logo[0].src = logo[1].src = "./data/images/"+room.RoomLogo;
    name.textContent = room.RoomName;
    for(let tr of board.getElementsByTagName("tr")){
        let entry = tr.getElementsByTagName("td");
        entry[0].textContent = rank;
        entry[1].textContent = room.Entries[rank].Team;
        entry[2].textContent = room.Entries[rank].Time;

        if(rank >= display){
            rank = 1;
            break;
        } else rank++;
    }
}

function findRoom(name){
    for(let room of window.rooms){
        if(room.RoomName==name){
            return room;
        }
    }
    return null;
}

/**
 * Given a string array and integer, will cycle
 * through display of each room in roomsToView
 * and display each room for timeStep seconds
 * @param {string[]} roomsToView
 */
function displayRooms(roomsToView){
    let roomIndex = 0;
    window.timer = setInterval(()=>{
        const room = findRoom(roomsToView[roomIndex]);
        displayRoom(room);
        roomIndex++;
        if(roomIndex>=roomsToView.length) roomIndex = 0;
    },document.getElementById("timeStep").value * 1000);
}

function toggleModal(){
    document.getElementById("modal").parentElement.classList.toggle("visible");
}