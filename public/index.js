/*
Room Format:var(--
{
    "RoomName":"Test Room",
    "RoomLogo":"",
    "Entries":[
        {"Team":"Test","Time":"0:00"}
    ]
}
*/

var rooms = [];
const modal = {
    display:"<label>Rooms To Display:</label><select name='rooms_to_display' id='room_select'></select><p></p><p id='rooms_list'></p><label>Transition Delay:</label><div style='display:flex;flex-direction:row;'><span id='delay_span' style='margin-right: 50px;'>5 seconds</span><span>1</span><input type='range' name='delay' id='delay' min='1' max='10' value='5'><span>10</span></div><label>Entries Displayed:</label><div style='display:flex;flex-direction:row;'><span id='topx_span' style='margin-right: 50px;'>Top 5</span><span>5</span><input type='range' name='topx' id='topx' min='5' max='20' step='5' value='5'><span>20</span></div><p></p><input type='submit' value='Display'>",
    room_add:"<label>Room Name:</label><input type='text' name='RoomName'><label>Room Logo:</label><input type='file' name='RoomLogo'><p></p><input type='submit' value='New Room'>",
    room_edit:"<label>Room:</label><select id='room_select' name='room'></select><label>Room Name:</label><input type='text' name='RoomName' id='RoomName'><label>Room Logo:</label><input type='file' name='RoomLogo' id='RoomLogo'><i class='fa fa-trash' aria-hidden='true' onclick='deleteRoom()' title='Delete Room'></i><input type='submit' value='Update Room'>",
    entry_add:"<label>Room:</label><select id='room_select' name='room'></select><label>Team Name:</label><input type='text' name='team'><label>Time:</label><input type='text' pattern='[0-9]{1,2}:[0-9]{2}' name='time'><p></p><input type='submit' value='New Entry'>",
    entry_edit:"<label>Room:</label><select id='room_select' name='room'></select><label>Entry:</label><select id='entry_select' name='entry'></select><label>Team Name:</label><input type='text' name='team' id='team'><label>Time:</label><input type='text' pattern='[0-9]{1,2}:[0-9]{2}' name='time' id='time'><i class='fa fa-trash' aria-hidden='true' onclick='deleteEntry()' title='Remove Entry'></i><input type='submit' value='Update Entry'>"
};
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
        roomDisplay(window.rooms[0],1);
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
    const entries = document.getElementById("entries");

    entries.innerHTML = "";
    
    logo[0].src = logo[1].src = "./data/images/"+room.RoomLogo;
    name.textContent = room.RoomName;
    for(let rank=1; rank<=display && room.Entries[rank-1]; rank++){
        let el = document.createElement("p");
        el.textContent = rank;
        entries.appendChild(el);
        el = document.createElement("p");
        el.style.fontFamily = "Covered By Your Grace";
        el.textContent = room.Entries[rank-1].Team;
        entries.appendChild(el);
        el = document.createElement("p");
        el.textContent = room.Entries[rank-1].Time;
        entries.appendChild(el);
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

function findEntryInRoom(name,room){
    for(let team of room.Entries){
        if(team.Team==name){
            return team;
        }
    }
    return null;
}

/**
 * Given a string array and integer, will cycle
 * through display of each room in roomsToView
 * and display each room for delay seconds
 * @param {string[]} roomsToView
 * @param {int} delay
 * @param {int} topx
 */
function displayRooms(roomsToView, delay, topx){
    clearInterval(timer);

    if(roomsToView.length < 2){
        const room = findRoom(roomsToView[0]);
        roomDisplay(room,topx);
        return ;
    }
    
    let roomIndex = 0;
    window.timer = setInterval(()=>{
        const room = findRoom(roomsToView[roomIndex]);
        roomDisplay(room,topx);
        roomIndex++;
        if(roomIndex>=roomsToView.length) roomIndex = 0;
    }, delay*1000);
}

function toggleModal(display){
    document.getElementById("modal").parentElement.classList.toggle("visible");
    const modal_form = document.getElementById("modal_form");
    if(display) modal_form.innerHTML = modal[display];
    const room_select = document.getElementById("room_select");
    const entry_select = document.getElementById("entry_select");
    const delay_range = document.getElementById("delay");

    //if the room_select object exists...
    if(room_select){
        //add all the room options
        for(let room of window.rooms){
            const option = document.createElement("option");
            option.value = room.RoomName;
            option.textContent = room.RoomName;
            room_select.appendChild(option);
        }
        //change fields to match room info
        //update entry_select (if it exists)
        room_select.addEventListener("change",()=>{
            const room = findRoom(room_select.value);
            if(document.getElementById("RoomName")) document.getElementById("RoomName").value = room.RoomName;
            // document.getElementById("RoomLogo").value = room.RoomLogo;
            if(entry_select){
                entry_select.innerHTML = "";
                for(let entry of room.Entries){
                    const option = document.createElement("option");
                    option.value = entry.Team;
                    option.textContent = entry.Team+" | "+entry.Time;
                    entry_select.appendChild(option);
                }
            }

            const rooms_list = document.getElementById("rooms_list");
            if(rooms_list){
                for(let child of rooms_list.children){
                    if(child.textContent == room_select.value) return ;
                }
                const span = document.createElement("span");
                span.style.cursor = "pointer";
                span.addEventListener("click", ()=> rooms_list.removeChild(span) );
                span.addEventListener("mouseover", ()=> span.style.color = "var(--color-hover)" );
                span.addEventListener("mouseout", ()=> span.style.color = "var(--color-text)");

                span.textContent = room_select.value;
                rooms_list.appendChild(span);
            }
        })
    }
    //if the entry_select object exists
    if(entry_select){
        //change fields to match entry info
        entry_select.addEventListener("change",()=>{
            const entry = findEntryInRoom(entry_select.value,findRoom(room_select.value));
            document.getElementById("team").value = entry.Team;
            document.getElementById("time").value = entry.Time;
        });
    }
    //if the delay_range object exists
    if(delay_range){
        //change fields on delay and display to match display info
        delay_range.addEventListener("change",()=> document.getElementById("delay_span").textContent = delay_range.value+" seconds" );
        document.getElementById("topx").addEventListener("change",()=> document.getElementById("topx_span").textContent = "Top "+document.getElementById("topx").value );
    }
}

function request(type,send,message){
    fetch('/rooms',{
        method: type,
        headers: { 'Content-Type': 'application/json' },
        body: send,
    })
    .then((response) => response.json())
    .then((data) => {toggleModal(); /* loadDisplay(); */ loadRooms(); snackMessage(message); })
    .catch((error) => console.error(error));
}

function handleForm(e){
    e.preventDefault();
    const form = document.getElementById("modal_form");
    const data = Object.fromEntries(new FormData(form).entries());

    switch(form.lastChild.value){
        case "Display":
        {
            let roomsToView = [];
            for(let child of document.getElementById("rooms_list").children){
                roomsToView.push(child.textContent);
            }
            displayRooms(roomsToView, data.delay, data.topx);
            toggleModal();
            return ;
        }
        case "New Room":
        {
            data.RoomLogo = data.RoomLogo["name"];
            request("POST",JSON.stringify(data),"Room Added");
            break;
        }
        case "Update Room":
        {
            let room = findRoom(data.room);
            if(data.room != data.RoomName) room.RoomName = RoomName;
            if(room.RoomLogo != data.RoomLogo["name"]) room.RoomLogo = data.RoomLogo["name"];
            request("PUT",JSON.stringify(room),"Room Updated");
            //problem: renaming the file with fs.rename( oldpath, newpath )
            //how to send both old and new name, then parse out oldname data to write only new stuff to file
            break;
        }
        case "New Entry":
        {
            let room = findRoom(data.room);
            room.Entries.push(JSON.parse(`{"Team":"`+data.team+`","Time":"`+data.time+`"}`));
            request("PUT",JSON.stringify(room),"Entry Added");
            break;
        }
        case "Update Entry":
        {
            let room = findRoom(data.room);
            let entry = findEntryInRoom(data.entry,room);
            if(entry.Team != data.team) entry.Team = data.team;
            if(entry.Time != data.time) entry.Time = data.time;
            request("PUT",JSON.stringify(room),"Entry Updated");
            break;
        }
        default:
            snackMessage("Form Error");
            console.log("Form Error - Unexpected Value of Last Child");
            break;
    }

    loadRooms();
}

function confirm_deletion(to_be_deleted){
    return new Promise((resolve)=>{
        document.getElementById("confirmation_form").parentElement.classList.toggle("visible");
        document.getElementById("to_be_deleted").innerHTML = to_be_deleted;

        document.getElementById("keep").addEventListener("click",()=>{
            document.getElementById("confirmation_form").parentElement.classList.toggle("visible");
            resolve(false);
        });
        document.getElementById("delete").addEventListener("click",()=>{
            resolve(true);
        });
    });
}

async function deleteRoom(){
    const form = document.getElementById("modal_form");
    const data = Object.fromEntries(new FormData(form).entries());
    const room_select = document.getElementById("room_select");
    if(!(await confirm_deletion(room_select.value)))return ;
    const room = findRoom(room_select.value);
    if(room){
        window.rooms.splice(room,1);
        request('DELETE',JSON.stringify(data),"Room Deleted");
    }
}

async function deleteEntry(){
    const room_select = document.getElementById("room_select");
    const entry_select = document.getElementById("entry_select");
    if(!(await confirm_deletion(entry_select.value+"<span style='color:var(--color-hover);'> from </span>"+room_select.value))) return ;
    document.getElementById("confirmation_form").parentElement.classList.toggle("visible");
    const room = findRoom(room_select.value);
    const entry = findEntryInRoom(entry_select.value, room);
    if(entry){
        room.Entries.splice(entry,1);
        request('PUT',JSON.stringify(room),"Entry Deleted");
    }
}

function snackMessage(message){
    var snack = document.getElementById("snack");
    snack.textContent = message;
    snack.classList.toggle("visible");
    setTimeout( ()=>snack.classList.toggle("visible"), 2900);
}

document.addEventListener("DOMContentLoaded",()=>{/* loadDisplay(); */ loadRooms();})

/*
TODO
1. Add display settings (HTML, CSS, JS)
    1a. Figure out how to resize/some way to display when more than 5 entries
2. Figure out filename changes for deleting a room
3. Check forms for empty/mismatched fields
*/