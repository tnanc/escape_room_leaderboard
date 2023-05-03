const http = require('http');
const fs = require('fs');
const express = require('express');
const app = express();

app.use(express.static('public'));

app.listen(8080, () => {
    console.log('Server is running on localhost:8080');
});