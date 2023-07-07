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

        const a = document.createElement("a");
        a.style.cursor = "pointer";
        a.onclick = ()=>{clearInterval(timer); displayRoom(room)};
        a.innerHTML = room.RoomName;
        roomList.appendChild(a);
    }

    const a = document.createElement("a");
    a.style.cursor = "pointer";
    a.onclick = ()=>{clearInterval(timer); displayAllRooms()};
    a.innerHTML = "All Rooms";
    roomList.appendChild(a);
}

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

function displayAllRooms(){
    let roomIndex = -1;
    window.timer = setInterval(()=>{
        if(roomIndex>=rooms.length || roomIndex<0){roomIndex = 0;}
        else{roomIndex++;}
        displayRoom(roomIndex);
        
    },8000);
}

function toggleModal(operation) {
    let popup = document.getElementById("modal"), content, room=["room","r","roomDisplay"], entry=["entry","e","entryDisplay"], settings=["settings","s","settingsDisplay"];
    hideAllMaps();
    window.modalView = [false,false,false];
    /*
    TODO
    make modal pop up
    set modalView array [false,false,false] = [room,entry,settings]
    when add is clicked: display add for room if modalView[0] is true & entry if modalView[1] is true
    when update is clicked: display update for room if modalView[0] is true & entry if modalView[1] is true
    when delete is clicked: display delete for room if modalView[0] is true & entry if modalView[1] is true
    */
    
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
    const select = document.getElementsByClassName("entrySearch");
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
    for(let e of document.getElementsByClassName("searchFilter")){
        if(e.tagName.toLowerCase()==="input" && e.type.toLowerCase()==="text"){
            e.addEventListener("keyup",function(){
                let filter, a, txtValue;
                filter = e.value.toUpperCase();
                a = document.getElementById(e.id.replace("Search","List")).getElementsByTagName("a");
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

    for(let e of document.getElementsByClassName("entrySearch med-select")){
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
                document.getElementById("delDirections").textContent = "Choose an entry below:";
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
    forms[0].addEventListener('submit', (e)=>{
        e.preventDefault();

        const data = Object.fromEntries(new FormData(forms[0]).entries());

        request('POST',JSON.stringify(data),"Room Added");
    });

    forms[1].addEventListener('submit', (e) => {
        e.preventDefault();

        const data = Object.fromEntries(new FormData(forms[1]).entries());
        let room = findRoom(data.Room);
        room.Entries.push(JSON.parse(`{"Team":"`+data.Team+`","Time":"`+data.Time+`"}`));

        request('PUT',JSON.stringify(room),"Entry Added");
    });

    forms[4].addEventListener('submit',(e)=>{
        e.preventDefault();

        const data = Object.fromEntries(new FormData(forms[4]).entries());
        const room = findRoom(data.RoomName);
        if(room!=null){
            window.rooms.splice(room,1);
            request('DELETE',JSON.stringify(data),"Room Deleted");
        } else {
            snackMessage("Room Not Found");
            toggleModal('close');
        }
    });

    forms[5].addEventListener('submit', (e) => {
        e.preventDefault();

        const data = Object.fromEntries(new FormData(forms[5]).entries());
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
})

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