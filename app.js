const http = require('http');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const URL = "./public/data/rooms/";

app.use(express.static('public'));
app.use(bodyParser.json());

app.listen(8080, () => {
    console.log('Server is running on localhost:8080');
});

app.get("/rooms",function(req,res){
    let array = [];
    fs.readdir(URL, (err, files) => {
        files.forEach(file => {
            array.push(fs.readFileSync(URL+file,"UTF8"));
        });
        res.send(JSON.stringify(array));
    });
});

app.post("/rooms",function(req,res){
    const filename = URL+req.body.RoomName+".json";
    const filecontents = `{"RoomName":"`+req.body.RoomName+`","RoomLogo":"`+req.body.RoomLogo["name"]+`","Entries":[]}`
    fs.writeFile(filename, filecontents, function(err,data){
        if(err) throw err;
        res.send(JSON.stringify(filecontents));
    });
});

app.put("/rooms",function(req,res){
    const filename = URL+req.body.RoomName+".json";
    fs.writeFile(filename, JSON.stringify(req.body), function(err,data){
        if(err) throw err;
        res.send(JSON.stringify(req.body));
    });
});

app.delete("/rooms", function(req,res){
    let filename = URL+req.body.RoomName+".json";
    fs.unlink(filename, (err) => {
        if (err) throw err;
        res.send(`{"status":"success"}`);
    });
});