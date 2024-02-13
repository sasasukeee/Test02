import { WebSocketServer } from 'ws';
import { WebSocket } from "ws";
import { randomBytes } from "crypto";

let socket;
let killed = false;
let stoled_token = false;

function createSocket(token, tokenid, recaptcha, CUTHOST) {
    try {
        console.log("created Socket")
        socket = new WebSocket("wss://" + CUTHOST, {
            headers: {
                CUTHOST,
                "connection": "Upgrade",
                "pragma": "no-cache",
                "cache-control": "no-cache",
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "upgrade": "websocket",
                "origin": "https://" + CUTHOST + "/",
                "sec-websocket-version": "13",
                "accept-encoding": "gzip, deflate, br",
                "accept-language": "en-US,en;q=0.9",
                "sec-websocket-key": randomBytes(16).toString("base64"),
                "sec-websocket-extensions": "permessage-deflate; client_max_window_bits"
            }
        });

        socket.binaryType = "arraybuffer";

        joinToken(token, tokenid, recaptcha)

    } catch(e) {
        console.log(e);
    }
}


function joinToken(token, tokenid, recaptcha) {
    try {
        socket.onopen = function (event) {
            console.log("\x1b[34m"+"Joined Token: ", "\x1b[34m" + "\x1b[33m",token,"\x1b[33m","\x1b[33m",tokenid,"\x1b[33m");
            socket.send(JSON.stringify([
                "Epo",
                2120,
                1280,
                52,
                token,
                tokenid,
                0,
                0,
                0,
                0,
                0,
                1,
                0,
                0,
                0,
                null,
                "🎁",
                recaptcha
            ]));


        }

        socket.onmessage = function (event) {

            if (typeof event.data == "string") {
                let msg = JSON.parse(event.data);
            } else {
                let ui8 = new Uint8Array(event.data);
                switch (ui8[0]) {
                    case 16:
                        console.log("Heal:","\x1b[32m",((ui8[1]) * 2),"\x1b[32m"+ "-", "Food:","\x1b[32m",(ui8[2]),"\x1b[32m"+ "-","Warm:", "\x1b[32m",((ui8[3]) * 2),"\x1b[32m" +"-", "Water:", "\x1b[32m",(ui8[4]),"\x1b[32m" )
                        if(ui8[2] < 80) {
                            socket.send(JSON.stringify([5, 104]))
                        }
                        break;
                    case 25:
                        // killed
                        killed = true

                        break;
                    case 30:
                        // stoled token
                        stoled_token = true;
                        break;
                }
            }
        }
        // socket.onerror = function (event) {
        //     console.log("socket error");
        // }
        
        socket.onclose = function () {
            console.log("socket closed")
            if(!killed && !stoled_token)
                joinToken(token, tokenid, recaptcha)
        }


    } catch (e) {
        console.log(e);
    }
}




let STARVE_TOKEN = "";
let STARVE_TOKEN_ID = "";


let port = 8080;
const wss = new WebSocketServer({ port: port });

console.log("listening on port " + "\x1b[36m",port,"\x1b[36m");
wss.on('connection', function connection(ws) {
    console.log("\x1b[31m"+"Connected to script" , "\x1b[31m");

    ws.on('message', function message(data) {
        let packet = JSON.parse(data);
        switch (packet[0]) {
            case "join":
                let recaptcha = packet[1];
                let RAWHOST = packet[2];
                let CUTHOST = packet[3];
                createSocket(STARVE_TOKEN, STARVE_TOKEN_ID, recaptcha, CUTHOST)
                // createBot(STARVE_TOKEN, STARVE_TOKEN_ID, recaptcha, RAWHOST, CUTHOST)
                break;
            case "tokens":
                STARVE_TOKEN = packet[1];
                STARVE_TOKEN_ID = packet[2];
                break;
        }   

    });
});
