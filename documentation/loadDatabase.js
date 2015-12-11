var db = require('arangojs')();
var footballDB = db.useDatabase('FBWebApp');

var clubs = require('./clubs.json');
var player = require('./players.json');

var i = 0;
clubs.forEach(it => {
    i++;
    var message = `${it.langschreibweise} , ${i} `;
    console.log(message);
});