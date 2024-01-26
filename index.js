import { WebSocketServer } from 'ws';
import { WebSocket } from "ws";
import { randomBytes } from "crypto";
let STARVE_TOKEN = "";
let STARVE_TOKEN_ID = "";
let port = 8080;
const wss = new WebSocketServer({ port: port });

console.log("listening on port " + port);

wss.on('connection', function connection(ws) {
    console.log("connected to script")

    ws.on('message', function message(data) {
        let packet = JSON.parse(data);
        switch (packet[0]) {
            case "join":
                let recaptcha = packet[1];
                let RAWHOST = packet[2];
                let CUTHOST = packet[3];
                createBot(STARVE_TOKEN, STARVE_TOKEN_ID, recaptcha, RAWHOST, CUTHOST);
                break;
            case "tokens":
                STARVE_TOKEN = packet[1];
                STARVE_TOKEN_ID = packet[2];
                break;
        }   

    });
});
function createBot(token, tokenid, recaptcha, RAWHOST, CUTHOST) {
    try {
        console.log("creating bot ");

        const socket = new WebSocket("wss://" + CUTHOST, {
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

        socket.onopen = function (event) {
            console.log("Bot is opened with Token: " + token, "TokenID: " + tokenid);
            socket.send(JSON.stringify([
                "SasuKe",
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
                        console.log("Food Value: " + (ui8[2]))
                        if(ui8[2] < 60) {
                            socket.send(JSON.stringify([5, 104]))
                        }
                }
            }
        }
        socket.onerror = function (event) {
            console.log("webscoket error")
        }
        socket.onclose = function () {
            console.log("websocket is disconnected.");
        }

    } catch (e) {
        console.log(e);
    }
}
