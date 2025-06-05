const express = require('express');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const {Teams, TeamValidator, Dex} = require('pokemon-showdown');
const http = require('http');
const WebSocket = require('ws');
const {BattleStream, getPlayerStreams} = require('pokemon-showdown');

const DB_FILE = './data/db.json';
function loadDB() {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}
function saveDB(db) {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}
const app = express();
app.use(express.json());
app.use(express.static('public'));

app.post('/register', (req, res) => {
    const {username, password} = req.body;
    if (!username || !password) return res.status(400).json({error: 'username and password required'});
    const db = loadDB();
    if (db.users.find(u => u.username === username)) return res.status(400).json({error: 'user exists'});
    const hash = bcrypt.hashSync(password, 10);
    db.users.push({username, password: hash});
    saveDB(db);
    res.json({status: 'registered'});
});

app.post('/login', (req, res) => {
    const {username, password} = req.body;
    const db = loadDB();
    const user = db.users.find(u => u.username === username);
    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({error: 'invalid credentials'});
    }
    res.json({status: 'ok'});
});

app.get('/formats', (req, res) => {
    const formats = Dex.formats.all().map(f => ({name: f.name, id: f.id, team: f.team || null}));
    const separated = {
        random: formats.filter(f => f.team),
        standard: formats.filter(f => !f.team),
    };
    res.json(separated);
});

app.post('/teams', (req, res) => {
    const {username, format, team} = req.body;
    if (!username || !format || !team) return res.status(400).json({error: 'missing fields'});
    const db = loadDB();
    const user = db.users.find(u => u.username === username);
    if (!user) return res.status(400).json({error: 'no such user'});
    let parsed;
    try {
        parsed = Teams.import(team);
    } catch (e) {
        return res.status(400).json({error: 'invalid team format'});
    }
    const validator = new TeamValidator(format);
    const problems = validator.validateTeam(parsed);
    if (problems && problems.length) {
        return res.status(400).json({error: 'team invalid', problems});
    }
    db.teams.push({username, format, team: Teams.pack(parsed)});
    saveDB(db);
    res.json({status: 'team saved'});
});

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', ws => {
    const stream = new BattleStream();
    const streams = getPlayerStreams(stream);
    (async () => {
        for await (const chunk of streams.omniscient) {
            ws.send(chunk);
        }
    })();
    ws.on('message', msg => {
        stream.write(String(msg));
    });
});

server.on('upgrade', (request, socket, head) => {
    if (request.url === '/battle') {
        wss.handleUpgrade(request, socket, head, ws => {
            wss.emit('connection', ws, request);
        });
    } else {
        socket.destroy();
    }
});

server.listen(PORT, () => console.log('Server running on port', PORT));
