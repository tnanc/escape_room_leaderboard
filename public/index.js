//window height / 2 - height of #leaderboard

//ghostly, game, remote, teacher, elevate, mascot
var rooms = [];
var modalView = [false,false,false];
var timer;



function applySettings(){
    fetch('/settings', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    })
    .then((response) => response.json())
    .then((data) => {rawRooms = data; applySettings(); })
    .catch((error) => console.error(error));
}

fetch('/rooms', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
})
.then((response) => response.json())
.then((data) => {
    parseIncomingData(data);
    displayRoom(window.rooms[0]);
})
.catch((error) => console.error(error));

/**
 * Takes the json object of a room's entries and assigns
 * each object to a specific array which can be called
 * upon based on room name.
 * @param {*} data 
 */
function parseIncomingData(data){
    window.rooms = [];
    for(let room of data){
        window.rooms.push(JSON.parse(room));
    }
    
    const roomList = document.getElementById("roomList");
    while (roomList.childNodes.length > 2) {
        roomList.removeChild(roomList.lastChild);
    }
    for(let room of window.rooms){
        room.Entries = mergeSort(room.Entries);

        const div = document.createElement("div");
        const input = document.createElement("input");
        input.type = "checkbox";
        input.name = room.RoomName;
        input.value = input.name;
        const label = document.createElement("label");
        label.for = input.name;
        label.innerHTML = input.name;
        div.appendChild(input);
        div.appendChild(label);
        roomList.appendChild(div);
    }

    const submit = document.createElement("button");
    submit.type = "submit";
    submit.className = "sm-button";
    submit.innerHTML = "Display";
    submit.style.padding = "0px 10px";
    
    roomList.appendChild(submit);
}

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
    document.getElementById("roomList").classList.toggle("show");
}

/**
 * Clears the table object in the HTML and
 * populates ranks 1-5 as empty strings.
 */
function clearBoard(){
    let ranks = document.getElementsByClassName("rank");
    let teams = document.getElementsByClassName("team");
    let times = document.getElementsByClassName("time");
    if(ranks.length==teams.length && teams.length==times.length){
        for(let j=1; j<=ranks.length; j++){
            ranks[j-1].textContent = j;
            teams[j-1].textContent = "";
            times[j-1].textContent = "";
        }
    } else {
        console.log("Error: board lengths differ ("+ranks.length+", "+teams.length+", "+times.length+")");
    }
}

/**
 * Changes the table object in HTML to populate a room's first 5
 * entries and change the height of the table accordingly.
 * Takes the name of the room to display as a parameter.
 * @param {*} display 
 */
function displayRoom(display){
    let roomLogos = document.getElementsByClassName("roomLogo");
    let title = document.getElementById("roomTitle");
    
    roomLogos[0].src = "./images/"+display.RoomLogo;
    roomLogos[1].src = "./images/"+display.RoomLogo;
    title.textContent = display.RoomName;

    clearBoard();

    let ranks = document.getElementsByClassName("rank");
    let teams = document.getElementsByClassName("team");
    let times = document.getElementsByClassName("time");
    for(let j=1; j<=display.Entries.length; j++){
        if(j<=5){
            ranks[j-1].textContent = j;
            teams[j-1].textContent = display.Entries[j-1].Team;
            times[j-1].textContent = display.Entries[j-1].Time;
        } else {
            break;
        }
    }

    let leaderboard = document.getElementById("leaderboard");
    let height = (window.innerHeight-leaderboard.offsetHeight)/2+document.getElementsByTagName("footer")[0].offsetHeight;
    leaderboard.style.bottom = height+"px";
}

/**
 * Given a string array and integer, will cycle
 * through display of each room in roomsToView
 * and display each room for timeStep seconds
 * @param {string[]} roomsToView 
 * @param {int} timeStep 
 */
function displayAllRooms(roomsToView,timeStep){
    let roomIndex = 0;
    timeStep *= 1000;
    window.timer = setInterval(()=>{
        const room = findRoom(roomsToView[roomIndex]);
        if(room==null){
            roomIndex = 0;
            displayRoom(findRoom(roomsToView[0]));
        } else {
            displayRoom(room);
            roomIndex++;
        }
    },timeStep);
}

/**
 * Brings up the modal with a view connected to parameter "operation" by setting
 * the modalView array's corresponding value to true.
 * If the modal is already viewable, it becomes hidden and
 * reperforms a FETCH request for the currently active room in order to
 * repopulate the table in the HTML.
 */
function toggleModal(operation) {
    let popup = document.getElementById("modal"), content, room=["room","r","roomDisplay"], entry=["entry","e","entryDisplay"], settings=["settings","s","settingsDisplay"];
    hideAllMaps();
    window.modalView = [false,false,false];
    
    if(room.includes(operation)){
        modalView[0] = true;
    } else if(entry.includes(operation)){
        modalView[1] = true;
    } else if(settings.includes(operation)){
        modalView[2] = true;
    } else {
        console.log("Modal Display: "+operation);
    }

    popup.classList.toggle("show");
    if(popup.classList.contains("show")){
        populateRoomRadio();
    } else {
        fetch('/rooms',{
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        })
        .then((response) => response.json())
        .then((data) => {
            parseIncomingData(data);
            const room = findRoom(document.getElementById("roomTitle").textContent);
            if(room!=null){
                displayRoom(room);
            } else {
                displayRoom(window.rooms[0]);
            }
        })
        .catch((error) => console.error(error));
    }
}

/**
 * Removes the "selected" class from each map so a modal would
 * display no view, but would display a navbar.
 */
function hideAllMaps(){
    for(let map of document.getElementsByClassName("map")){
        if(map.classList.contains("show")){
            map.classList.remove("show");
        }
        for(let child of map.children){
            if(child.classList.contains("show")){
                child.classList.remove("show");
            }
        }
    }
    for(let e of document.getElementsByClassName("displayButton")){
        if(e.classList.contains("selected")){
            e.classList.remove("selected");
        }
    }
}

/**
 * Takes input "type" as a command of which action to perform (e.g. add, update, delete)
 * and displays the view connected to whichever modalview is active (e.g. room, entry, settings).
 * @param {*} type 
 */
function modalDisplay(type){
    type = type.toLowerCase();
    let add=[0,"a","add","c"], update=[1,"u","update"],del=[2,"d","delete","del"];
    let view = modalView[0] ? document.getElementsByClassName("roomForm") : modalView[1] ? document.getElementsByClassName("entryForm") : modalView[2] ? document.getElementsByClassName("settingsForm") : null;
    hideAllMaps();

    if(add.includes(type)){
        view[0].classList.toggle("show");
        document.getElementsByClassName("displayButton")[0].classList.toggle("selected");
    } else if(update.includes(type)){
        view[1].classList.toggle("show");
        document.getElementsByClassName("displayButton")[1].classList.toggle("selected");
    } else if(del.includes(type)){
        view[2].classList.toggle("show");
        document.getElementsByClassName("displayButton")[2].classList.toggle("selected");
    } else {
        console.log("Invalid Display Type");
    }
}

function removeUploadFiles(){
    for(let e of document.getElementsByTagName("input")){
        if(e.type.toLowerCase()==="file"){
            e.value = null;
        }
    }
}

function populateRoomRadio(){
    const select = [...document.querySelectorAll(".entrySearch"),...document.querySelectorAll(".roomSearch")];
    for(let div of select){
        div.innerHTML = "";
        for(let room of window.rooms){
            const option = document.createElement("option");
            option.value = room.RoomName;
            option.innerHTML = room.RoomName;
            div.appendChild(option);
        }
    }
}

function snackMessage(message){
    var snack = document.getElementById("snackbar");
    snack.textContent = message;
    snack.className = "show";
    setTimeout(function(){ snack.className = snack.className.replace("show", ""); }, 3000);
}

document.addEventListener("DOMContentLoaded",()=>{
    for(let e of document.querySelectorAll(".searchFilter")){
        if(e.tagName.toLowerCase()==="input" && e.type.toLowerCase()==="text"){
            e.addEventListener("keyup",function(){
                let filter, a, txtValue;
                filter = e.value.toUpperCase();
                if(e.id.includes("Search")){
                    a = document.getElementById(e.id.replace("Search","List")).getElementsByTagName("a");
                } else if(e.id.includes("Team")){
                    a = document.getElementById(e.id.replace("Team","List")).getElementsByTagName("a");
                }

                for (let i = 0; i < a.length; i++) {
                    txtValue = a[i].textContent || a[i].innerText;
                    if (txtValue.toUpperCase().indexOf(filter) > -1) {
                    a[i].style.display = "";
                    } else {
                    a[i].style.display = "none";
                    }
                }
            });
        }
    }

    for(let e of document.querySelectorAll(".entrySearch")){
        if(e.tagName.toLowerCase()==="select"){
            e.addEventListener("change",function(){
                const list = document.getElementById(e.id.replace("Search","List"));
                list.innerHTML="";
                let i;
                for(let Room of window.rooms){
                    if(Room.RoomName == e.value){
                        i = Room.Entries;
                        break;
                    } else { i=null; }
                }
                if(i===null){return ;}
                document.getElementById(e.id.replace("Search","Directions")).textContent = "Choose an entry below:";
                let j = 1;
                let maxEntries = 50;
                for(let entry of i){
                    if(j > maxEntries){
                        const p = document.createElement("p");
                        const diff = i.length-maxEntries;
                        p.innerHTML = diff==1 ? "Type to search through 1 more entry" : "Type to search through "+diff+" more entries";
                        p.style.color = "white";
                        list.appendChild(p);
                        return ;
                    } else {
                        const a = document.createElement("a");
                        a.innerHTML = entry.Team+" | "+entry.Time;
                        a.style = "cursor:pointer;color:white;";
                        a.onmouseover = ()=>{a.style.color = "lightgray";}
                        a.onmouseleave = ()=>{a.style.color = "white";}
                        a.onclick = () => {
                            document.getElementById(e.id.replace("Search","Team")).value = a.textContent.split(" | ")[0];
                            document.getElementById(e.id.replace("Search","Time")).value = a.textContent.split(" | ")[1];
                        }
                        list.appendChild(a);
                        j++;
                    }
                    
                }
            });
        }
    }

    const forms = document.getElementsByTagName("form");
    const timeSlider = document.getElementById("timeStep");
    document.getElementById("displayTime").innerHTML = timeSlider.value;
    timeSlider.addEventListener('change',(e)=>{
        document.getElementById("displayTime").innerHTML = timeSlider.value;
    });
    forms[0].addEventListener('submit', (e)=>{
        e.preventDefault();
        const data = Object.fromEntries(new FormData(forms[0]).entries());
        let roomsToView = [];
        for(let d in data){
            roomsToView.push(data[d]);
        }
        const timeStep = roomsToView[0];
        roomsToView.splice(0,1);
        
        toggleRoomDrop();
        toggleNav();
        clearInterval(timer);
        displayAllRooms(roomsToView,timeStep);
    });
    forms[1].addEventListener('submit', (e)=>{
        e.preventDefault();

        const data = Object.fromEntries(new FormData(forms[1]).entries());

        request('POST',JSON.stringify(data),"Room Added");
    });

    forms[2].addEventListener('submit', (e) => {
        e.preventDefault();

        const data = Object.fromEntries(new FormData(forms[2]).entries());
        let room = findRoom(data.Room);
        room.Entries.push(JSON.parse(`{"Team":"`+data.Team+`","Time":"`+data.Time+`"}`));

        request('PUT',JSON.stringify(room),"Entry Added");
    });

    //TODO - create form event listeners for forms[3] and forms[4]
    //find a room/entry; change it's values (similar to forms[2])

    forms[5].addEventListener('submit',(e)=>{
        e.preventDefault();

        const data = Object.fromEntries(new FormData(forms[5]).entries());
        const room = findRoom(data.RoomName);
        if(room!=null){
            window.rooms.splice(room,1);
            request('DELETE',JSON.stringify(data),"Room Deleted");
        } else {
            snackMessage("Room Not Found");
            toggleModal('close');
        }
    });

    forms[6].addEventListener('submit', (e) => {
        e.preventDefault();

        const data = Object.fromEntries(new FormData(forms[6]).entries());
        let room = findRoom(data.RoomName);
        const entry = findEntry(room,data.Team,data.Time);
        
        if(room!=null && entry!=null){
            room.Entries.splice(entry,1);
            request('PUT',JSON.stringify(room),"Entry Deleted");
        } else {
            console.log(room.Entries);
            console.log(entry);
            snackMessage("Room Not Found");
            toggleModal('close');
        }
    });

    //TODO - add event listener for a select multiple form
    //add rooms to view to an array by name
})

/**
 * Performs a FETCH request to "/rooms" of method "type" with
 * a body of "send" and a popup message of "message".
 * @param {*} type 
 * @param {*} send 
 * @param {*} message 
 */
function request(type,send,message){
    fetch('/rooms',{
        method: type,
        headers: { 'Content-Type': 'application/json' },
        body: send,
    })
    .then((response) => response.json())
    .then((data) => {snackMessage(message);toggleModal('close');})
    .catch((error) => console.error(error));
}

function findRoom(name){
    for(let room of window.rooms){
        if(room.RoomName==name){
            return room;
        }
    }
    return null;
}
function findEntry(room,team,time){
    for(let entry of room.Entries){
        if(entry.Team==team && entry.Time==time){
            return entry;
        }
    }
    return null;
}