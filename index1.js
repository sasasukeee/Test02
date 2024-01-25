let euleg_id = undefined;
let rivetToken = null;

let failedTimeout = (performance.now() / 1000) - 60;

const ws = new WebSocket('ws://localhost:8080');

let socketReady = false;

ws.addEventListener('open', (event) => {

	socketReady = true;

	function send(data) {
		if (socketReady == true) {
			ws.send(JSON.stringify(data));
		}
	}

	window.send = send;
	console.log('WebSocket connection opened:', event);

});

ws.addEventListener('close', (event) => {
	socketReady = false;
	console.log('WebSocket connection closed:', event);
});

ws.addEventListener('error', (event) => {
	console.error('WebSocket error:', event);
});

async function sendBotData(token) {
	let body = {
		lobby_id: euleg_id
	};
	let headers = {};
	if (rivetToken) headers["Authorization"] = `Bearer ${rivetToken}`;
	let res = await fetch("https://api.eg.rivet.gg/matchmaker/lobbies/join", {
		method: "POST",
		headers,
		body: JSON.stringify(body)
	});
	if (!res.ok) {
		console.log("FAILED TO JOIN LOBBY");
		failedTimeout = performance.now() / 1000;
	}
	let resBody = await res.json();

	let port = resBody.lobby.ports.default;
	let dns = port.host;
	let ssl = port.is_tls;
	let playerToken = resBody.lobby.player.token;

	console.log(playerToken)

	let socketAddress = "ws" + (ssl ? "s" : "") + "://" + dns + "?token=" + playerToken;
	let cutws = dns + "?token=" + playerToken;
	console.log("Websocket Addr: " + socketAddress);

	send(["join", token, socketAddress, cutws])

}


function rcsolver() {
	if (((performance.now() / 1000) - failedTimeout) > 30) {
		get_recaptcha_token()
			.then((token) => {
				console.log("Recaptcha Token:", token);
				sendBotData(token)
			})
			.catch((error) => {
				console.error("Error:", error);
				failedTimeout = performance.now() / 1000;
			});
	}
}

async function botLoop() {

	if (true) {
		// Find lobby
		let headers = {};
		if (rivetToken) headers["Authorization"] = `Bearer ${rivetToken}`;
		let res = await fetch("https://api.eg.rivet.gg/matchmaker/lobbies/list", {
			method: "GET",
			headers,
		});
		if (!res.ok) {
			console.error("Failed to list lobbies");
			throw "Failed to list lobbies";
		}
		let resList = await res.json();
		console.log(resList);


		for (let i = 0; i < resList.lobbies.length; i++) {
			let server = resList.lobbies[i];
			if (server.game_mode_id == "forest" && server.region_id == "lnd-fra") {
				console.log("ff leg")
				console.log(server)
				euleg_id = server.lobby_id;
			}
		}

		console.log(euleg_id)
	}

	console.log("starting bot loop");
	setInterval(rcsolver, 2500)
}

setTimeout(botLoop, 5000);