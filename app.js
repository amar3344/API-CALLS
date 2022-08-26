let express = require("express");
let { open } = require("sqlite");
let sqlite3 = require("sqlite3");
let path = require("path");

let app = express();
app.use(express.json());
let db = null;
let dbPath = path.join(__dirname, "cricketTeam.db");

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log(`server running at http://localhost:3000/`);
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//get all players API -1
app.get("/players/", async (request, response) => {
  const playersQuery = `SELECT * FROM cricket_team ORDER BY player_id;`;
  const playerArray = await db.all(playersQuery);
  response.send(
    playerArray.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

//Add player API - 2
app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const addPlayer = `INSERT INTO cricket_team (player_name,jersey_number,role)
     VALUES(
         '${playerName}',
         ${jerseyNumber},
         '${role}');`;
  const dbResponse = await db.run(addPlayer);
  const playerId = dbResponse.lastID;
  response.send("Player Added to Team");
});

//get  player  API -3
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerQuery = `SELECT * FROM cricket_team WHERE player_Id = ${playerId};`;
  const player = await db.get(playerQuery);
  response.send(convertDbObjectToResponseObject(player));
});

//update playerDetails API-4
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerDetails = `UPDATE cricket_team SET
    player_name = '${playerName}',
    jersey_number = ${jerseyNumber},
    role = '${role}' 
  
  WHERE player_id = ${playerId};`;
  await db.run(updatePlayerDetails);
  response.send("Player Details Updated");
});

//API 5
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteQuery = `DELETE  FROM cricket_team WHERE player_id = ${playerId};`;
  await db.run(deleteQuery);
  response.send("Player Removed");
});

module.exports = app;
