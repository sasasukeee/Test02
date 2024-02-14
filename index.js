    import { WebSocketServer } from 'ws';
    import { WebSocket } from "ws";
    import { randomBytes } from "crypto";

    let socket;
    let killed = false;
    let stoled_token = false;
    function createSocket(token, tokenid, recaptcha, CUTHOST, serverobject1) {
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

            joinToken(token, tokenid, recaptcha,serverobject1)

        } catch(e) {
            console.log(e);
        }
    }


    function joinToken(token, tokenid, recaptcha, serverobject1) {
        let id = 0;
        try {
            id++;
            socket.onopen = function (event) {
                console.log(`Joined Token: >${id}< ${serverobject1.gm} ${serverobject1.a}
            Token:   ${token}
            TokenId: ${tokenid}
            Mode:    ${serverobject1.gm}
            Server:  ${serverobject1.a}
            Players: ${serverobject1.nu}`);
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
                            console.log(`Token Info >${id}< ${serverobject1.gm} ${serverobject1.a}
            Heal:  ${(ui8[1] * 2)}
            Food:  ${(ui8[2])}
            Warm:  ${(ui8[3] * 2)}
            Water: ${(ui8[4])}`)
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
                id--;
            }


        } catch (e) {
            console.log(e);
        }
    }




    let STARVE_TOKEN = "";
    let STARVE_TOKEN_ID = "";
    let SERVER_OBJECT = {};
    let port = 8080;
    const wss = new WebSocketServer({ port: port });

    console.log("\x1b[33m%s\x1b[0m","listening on port " + port,"\x1b[33m\x1b[0m");
    wss.on('connection', function connection(ws) {
        console.log("Connected to script");

        ws.on('message', function message(data) {
            let packet = JSON.parse(data);
            switch (packet[0]) {
                case "join":
                    let recaptcha = packet[1];
                    let RAWHOST = packet[2];
                    let CUTHOST = packet[3];
                    createSocket(STARVE_TOKEN, STARVE_TOKEN_ID, recaptcha, CUTHOST, SERVER_OBJECT);
                    // createBot(STARVE_TOKEN, STARVE_TOKEN_ID, recaptcha, RAWHOST, CUTHOST)
                    break;
                case "tokens":
                    STARVE_TOKEN = packet[1];
                    STARVE_TOKEN_ID = packet[2];
                    SERVER_OBJECT = packet[3];
                    break;
            }   

        });
    });
