const http = require('http');
const fs = require('fs');
const express = require('express');
//const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const app = express();

const URL = "./public/data/rooms/";

const IPV4 = "192.168.4.56";
const PORT = "8080";

app.use(express.static('public'));
app.use(bodyParser.json());
//app.use(fileUpload());

//listen at 192.168.4.56:8080
app.listen(PORT,IPV4, () => {
    console.log('Server is running on '+IPV4+':'+PORT);
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

/*
app.post("/upload",function(req,res){
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send(`{"status":"failure"}`);
    }

    const file = req.files.file;
    const uploadPath = __dirname+"public/data/images/"+file.name);

    file.mv(uploadPath, (err) => {
        if (err) throw err;
        res.send(`{"status":"success"}`);
    });
});
*/