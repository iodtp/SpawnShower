// ==UserScript==
// @name         Ball Shower
// @version      1.0
// @description  Show other team's spawns at start
// @author       Iodized Salt
// @include      http://*.koalabeast.com:*
// @include      https://*.koalabeast.com/game*
// @include      https://*.koalabeast.com/game?*
// @grant        none
// ==/UserScript==


tagpro.ready(function waitForId() {
    if (!tagpro.playerId) {
        return setTimeout(waitForId, 100);
    }

    const myId = tagpro.playerId;

    let drawShit = true;
    let first = true;
    const locations = [];
    tagpro.socket.on("p", function (data) {
        data = data.u || data;
        for (let i = 0, l = data.length; i != l; i++) {
            if(data[i].playTime && data[i].playTime != "00:00"){
                drawShit = false;
                deleteDrawings(locations);
            }
            if (tagpro.state === 1) {
                if (drawShit == true){
                    drawShit = false;
                    deleteDrawings(locations);
                }
            }
            else if(first) {
                first = false;
                for (const [key, value] of Object.entries(tagpro.players)){
                    let xpos = value.x;
                    let ypos = value.y;
                    let ball = value.team === 1 ? "redball" : "blueball"; // which color shall we draw
                    tagpro.tiles.draw(tagpro.renderer.layers.background, ball,  { x: xpos, y: ypos }, 40, 40);
                    locations.push([`${key}`, xpos, ypos]);
                }
            }
            else if (data[i].id != myId && drawShit){
                let xpos = tagpro.players[`${data[i].id}`].x;
                let ypos = tagpro.players[`${data[i].id}`].y;
                let ball = tagpro.players[`${data[i].id}`].team === 1 ? "redball" : "blueball"; // which color shall we draw
                tagpro.tiles.draw(tagpro.renderer.layers.background, ball,  { x: xpos, y: ypos }, 40, 40);
                locations.push([`${data[i].id}`, xpos, ypos]);
            }
        }
    });
    tagpro.socket.on('playerLeft', function(data) {
        for (let i = 0; i < locations.length; i++){
            if(locations[i][0] == data && locations[i][1] && locations[i][2]){
                tagpro.tiles.draw(tagpro.renderer.layers.midground, `${getTileLoc(locations[i][1], locations[i][2])}`,  { x: locations[i][1], y: locations[i][2] }, 40, 40);
            }
        }
    });
    tagpro.socket.on('time', function(data) {
        if (data.state === 1){
            drawShit = false;
            deleteDrawings(locations);
        }
    });
});

function getTileLoc(x, y){
    //Top left of the map is (0,0), you should never be able to get there though because of walls, unimportant in general though
    //each tile is 40 px
    if(x>0 && y>0){
        let i = Math.floor(x / 40);
        let j = Math.floor(y / 40);
        return tagpro.map[i][j];
    }
    return -1;
}
function deleteDrawings(locations) {
    for (let i = 0; i < locations.length; i++){
        if(locations[i][1] > 0 && locations[i][2] > 0){
            //the only time ive ever actually used this == helpfully
            tagpro.tiles.draw(tagpro.renderer.layers.midground, `${getTileLoc(locations[i][1], locations[i][2])}`,  { x: locations[i][1], y: locations[i][2] }, 40, 40);
        }
    }
}



