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

class room{
    Entries = [];
    constructor(Name, Image){
        this.Name = Name;
        this.Image = Image;
    }
    addEntry(Entry){
        if(Entry instanceof entry){
            this.Entries.push(Entry);
        } else {
            console.log("Not a valid entry object");
        }
    }
    removeEntry(Entry){
        if(Entry instanceof entry){
            if(this.Entries.includes(Entry)){
                this.Entries.splice(this.Entries.indexOf(Entry),1);
            } else {
                console.log("Room "+this.Name+" does not contain an entry for "+Entry.Team);
            }
        } else {
            console.log("Not a valid entry object");
        }
    }
    clearEntries(){
        this.Entries = [];
    }
    sort(){
        this.Entries = mergeSort(this.Entries);
    }
}

//window height / 2 - height of #leaderboard

//ghostly, game, remote, teacher, elevate, mascot
var rooms = [];
var rawEntries;
var rawRooms;

var modalView = [false,false,false];

var timer;

fetch('/settings', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
})
.then((response) => response.json())
.then((data) => {rawRooms = data; applySettings(); })
.catch((error) => console.error(error));

function applySettings(){
    //TODO
}

fetch('/allRooms', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
})
.then((response) => response.json())
.then((data) => {rawRooms = data; parseRoomData(); })
.catch((error) => console.error(error));

function parseRoomData(){
    window.rooms = [];
    for(let index in rawRooms){
        window.rooms.push(new room(rawRooms[index].Name,"./images/"+rawRooms[index].Image));
    }
}

fetch('/allEntries', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
})
.then((response) => response.json())
.then((data) => {rawEntries = data; parseEntryData(); })
.catch((error) => console.error(error));

function parseEntryData(){
    for(let Room of rooms){
        if(Room instanceof room){
            Room.clearEntries();
        }
    }
    for(let index in rawEntries){
        let Room = hasRoom(rawEntries[index].Room);
        if(Room === null){
            console.log("Room "+rawEntries[index].Room+" does not exist");
        } else {
            Room.addEntry(new entry(Room.Name,rawEntries[index].Team,rawEntries[index].Time));
        }
    }
    
    for(let Room of window.rooms){
        if(Room instanceof room){
            Room.sort();
        } else {
            console.log("Room is not a room:\n"+Room);
        }
    }

    const roomList = document.getElementById("roomList");
    while (roomList.childNodes.length > 2) {
        roomList.removeChild(roomList.lastChild);
    }
    for(let Room of rooms){
        const a = document.createElement("a");
        a.style.cursor = "pointer";
        a.onclick = ()=>{clearInterval(timer); displayRoom(rooms.indexOf(Room))};
        a.innerHTML = Room.Name;
        roomList.appendChild(a);
    }
    const a = document.createElement("a");
    a.style.cursor = "pointer";
    a.onclick = ()=>{clearInterval(timer); displayAllRooms()};
    a.innerHTML = "All Rooms";
    roomList.appendChild(a);
    
    displayRoom(0);
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

function hasRoom(Name){
    for(let Room of rooms){
        if(Room instanceof room && Room.Name == Name){
            return Room;
        }
    }
    return null;
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

function displayRoom(index){
    let roomLogos = document.getElementsByClassName("roomLogo");
    let title = document.getElementById("roomTitle");
    let Room = rooms[index];
    if(Room instanceof room){
        roomLogos[0].src = Room.Image;
        roomLogos[1].src = Room.Image;
        title.textContent = Room.Name;

        clearBoard();

        let ranks = document.getElementsByClassName("rank");
        let teams = document.getElementsByClassName("team");
        let times = document.getElementsByClassName("time");
        for(let j=1; j<=Room.Entries.length; j++){
            if(j<=5){
                ranks[j-1].textContent = j;
                teams[j-1].textContent = Room.Entries[j-1].Team;
                times[j-1].textContent = Room.Entries[j-1].Time;
            } else {
                break;
            }
        }
    } else {
        console.log("\nRoom is not a room: \n"+Room);
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
        console.log("Not a valid modal display");
    }

    popup.classList.toggle("show");
    if(popup.classList.contains("show")){
        populateRoomRadio();
    } else {
        fetch('/allEntries', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        })
        .then((response) => response.json())
        .then((data) => {rawEntries = data; parseEntryData(); })
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
        for(let Room of rooms){
            const option = document.createElement("option");
            option.value = Room.Name;
            option.innerHTML = Room.Name;
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
                    if(Room.Name == e.value){
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

    const form0 = document.getElementById('newEntryForm');
    form0.addEventListener('submit', (e) => {
        e.preventDefault();

        window.rawEntries.push(Object.fromEntries(new FormData(form0).entries()));


        fetch('/newEntry', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(rawEntries),
        })
        .then((response) => response.json())
        .then((data) => {snackMessage("Entry Added");toggleModal('close');})
        .catch((error) => console.error(error));
    });

    const form1 = document.getElementById('deleteEntryForm');
    form1.addEventListener('submit', (e) => {
        e.preventDefault();

        const toDelete = Object.fromEntries(new FormData(form1).entries());
        
        let deleted = false;
        for(let entry in rawEntries){
            if(rawEntries[entry].Team==toDelete.Team && rawEntries[entry].Time==toDelete.Time && rawEntries[entry].Room==toDelete.Room){
                rawEntries.splice(entry,1);
                deleted = true;
                break;
            }
        }
        if(!deleted){
            snackMessage("Entry Not Found");
            toggleModal('close');
            return ;
        }
        
        fetch('/deleteEntry', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(rawEntries),
        })
        .then((response) => response.json())
        .then((data) => {snackMessage("Entry Deleted");toggleModal('close');})
        .catch((error) => console.error(error));
    });
})
