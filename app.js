const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "cricketTeam.db");

const app = express();
app.use(express.json());

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

const convertToDataBaseObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

app.get("/players/", async (request, response) => {
  const getPlayerQuery = `
   SELECT
     * 
   FROM 
    cricket_team;`;
  const playersArray = await db.all(getPlayerQuery);
  response.send(
    playersArray.map((eachPlayer) => {
      return convertToDataBaseObjectToResponseObject(eachPlayer);
    })
  );
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT
        * 
    FROM 
        cricket_team
    WHERE 
        player_id = ${playerId}`;
  const player = await db.get(getPlayerQuery);
  return response.send(convertToDataBaseObjectToResponseObject(player));
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const { playerId } = request.params;
  const updatePlayerQuery = `
    UPDATE 
        cricket_team
    SET 
        player_name = '${playerName}',
        jersey_number = '${jerseyNumber}',
        role = '${role}'
    WHERE 
        player_id = ${playerId};

    `;
  await db.run(updatePlayerQuery);
  return response.send("Player Details Updated");
});

app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayer = `
    DELETE FROM 
        cricket_team
    WHERE 
        player_id = ${playerId}`;
  await db.run(deletePlayer);
  response.send("Player Removed");
});

app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const postPlayerQuery = `
    INSERT INTO 
        cricket_team (
            player_name , jersey_number, role
            )

    VALUES 
        ('${playerName}',${jerseyNumber},'${role}')
    `;
  const player = await database.run(postPlayerQuery);
  response.send(player);
});

module.exports = app;
