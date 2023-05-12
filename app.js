const http = require('http');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(express.static('public'));
app.use(bodyParser.json());

app.listen(8080, () => {
    console.log('Server is running on localhost:8080');
});

app.post("/newEntry", function(req,res){
    const jsonData = JSON.stringify(req.body);

    fs.writeFile("./public/leaderboard.json", jsonData, function (err) {
        if (err) throw err;
        console.log('New Entry Added!');
    });

    res.send(jsonData);
});

app.delete("/deleteEntry", function(req,res){
    const jsonData = JSON.stringify(req.body);

    fs.writeFile("./public/leaderboard.json", jsonData, function (err) {
        if (err) throw err;
        console.log('Entry Deleted!');
    });

    res.send(jsonData);
});