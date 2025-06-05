var room = HBInit({
    roomName: "Unfeatured Hazırlık Maçı/Elo Odası",
    maxPlayers: 12,
    noPlayer: true
  });
  
  room.setDefaultStadium("Big");
  room.setScoreLimit(5);
  room.setTimeLimit(0);
  let currentPlayers = [];
  let lastJoined = "Yok";
  let lastLeft = "Yok";
  let roomName = "BOT"; 
  let lastScores = {};
  const MAX_PLAYERS = 12;
  
  const WEBHOOK_URL = ""; // MESAJ WEBHOOK
  const WEBHOOK_AUTH = ""; // AUTH WEBHOOK
  const WEBHOOK_ODA = ""; // ODA DURUM WEBHOOK
  const WEBHOOK_BİLGİ = ""; //  BAN KİCK WEBHOOK
  const webhookURL = "";  // Kayıtları göndermek için ayrı bir webhook
  
  
let lastTouchPlayer = null;          
let penultimateTouchPlayer = null;     
let lastTouchTeam = 0;                
let penultimateTouchTeam = 0;         
let goalsData = [];                  


  var owner = null;
  var managers = [];
  var tempAdmins = [];
  var adminData = JSON.parse(localStorage.getItem("adminData")) || { owner: null, managers: [] };
  
  
 
  function loadAdmins() {
    owner = adminData.owner;
    managers = adminData.managers;
  }
  

  function saveAdmins() {
    localStorage.setItem("adminData", JSON.stringify({ owner, managers }));
  }
  
  loadAdmins();
  

  room.ownerSil = function(name) {
    let player = room.getPlayerList().find(p => p.name === name);
    if (adminData.owner && player && adminData.owner.auth === player.auth && adminData.owner.conn === player.conn) {
        adminData.owner = null;
        saveAdmins();
        room.setPlayerAdmin(player.id, false);
        room.sendAnnouncement("❌ " + name + " artık Owner değil!", null, 0xFF0000, "bold", 2);
    }
  };
  
  function updatePlayerList() {
      let embed = {
          title: "🏟️ UNFEATURED HAZIRLIK/ELO ODASI 🏟️",
          color: 0x00ff00,
          fields: [
              { name: "📊 Oda Doluluk", value: `**${currentPlayers.length}/${MAX_PLAYERS}** kişi var`, inline: false },
              { name: "🟢 En Son Giren", value: lastJoined || "Bilinmiyor", inline: true },
              { name: "🔴 En Son Çıkan", value: lastLeft || "Bilinmiyor", inline: true },
              { name: "📝 Oyuncu Listesi", value: currentPlayers.length > 0 ? currentPlayers.join("\n") : "Kimse yok", inline: false },
              { name: "🔗 Oda Linki", value: roomLink ? `[Tıkla ve Katıl](${roomLink})` : "Oda linki alınamadı", inline: false }
          ],
          timestamp: new Date()
      };
  
      let payload = JSON.stringify({ username: "ODA DURUM", embeds: [embed] });
  
      let xhr = new XMLHttpRequest();
      xhr.open("POST", WEBHOOK_ODA, true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.send(payload);
  }
  
  
  let roomLink = "";
  
  room.onRoomLink = function (link) {
      roomLink = link;
  };
  

  room.managersSil = function(name) {
      let player = room.getPlayerList().find(p => p.name === name);
      if (player) {
          adminData.managers = adminData.managers.filter(m => m.auth !== player.auth || m.conn !== player.conn);
          room.setPlayerAdmin(player.id, false);
          room.sendAnnouncement("❌ " + name + " artık Manager değil!", null, 0xFFFF00, "bold", 2);
      }
    };
    
  
 
  function sendToDiscord(message) {
      let xhr = new XMLHttpRequest();
      xhr.open("POST", WEBHOOK_URL, true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.send(JSON.stringify({ content: message }));
  }
  
  function updateAdmins() { 
      var players = room.getPlayerList();
      if (players.length === 0 || !adminData.owner) return;
  
      let ownerExists = false; 
  
      players.forEach(player => {
          if (adminData.owner && player.auth === adminData.owner.auth && player.name === adminData.owner.name) {
              if (!ownerExists) { 
                  owner = player.id;
                  room.setPlayerAdmin(player.id, true);
                  room.sendAnnouncement("🔴 " + player.name + " Owner odaya giriş yaptı!", null, 0xFF0000, "bold", 2);
                  ownerExists = true; 
              }
          } 
          else if (adminData.managers.some(m => m.auth === player.auth && m.name === player.name)) {
              if (!managers.includes(player.id)) {
                  managers.push(player.id);
                  room.setPlayerAdmin(player.id, true);
                  room.sendAnnouncement("🟡 " + player.name + " Manager odaya giriş yaptı!", null, 0xFFFF00, "bold", 2);
              }
          }
      });
  }
  
  
  
  //DİSCORD NİCK ID AUTH CONN IPV4
  function sendEmbedToDiscord(player) {
      let embed = {
          title: "Yeni Oyuncu Katıldı!",
          color: 0x0099ff,
          fields: [
              { name: "Ad", value: player.name, inline: true },
              { name: "ID", value: player.id.toString(), inline: true },
              { name: "Auth", value: player.auth || "Bilinmiyor", inline: false },
              { name: "Conn", value: player.conn || "Bilinmiyor", inline: false }
          ],
          timestamp: new Date()
      };
  
      let payload = JSON.stringify({ username: "Auth", embeds: [embed] });
  
      let xhr = new XMLHttpRequest();
      xhr.open("POST", WEBHOOK_AUTH, true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.send(payload);
  }
  

  function updateAdmins() { 
      var players = room.getPlayerList();
      if (players.length === 0 || !adminData.owner) return;
  
      let ownerExists = false; 
  
      players.forEach(player => {
          if (adminData.owner && player.auth === adminData.owner.auth && player.name === adminData.owner.name) {
              if (!ownerExists && owner !== player.id) { 
                  owner = player.id;
                  room.setPlayerAdmin(player.id, true);
                  room.sendAnnouncement("🔴 " + player.name + " Owner olarak giriş yaptı!", null, 0xFF0000, "bold", 2);
                  ownerExists = true; 
              }
          } 
          else if (adminData.managers.some(m => m.auth === player.auth && m.name === player.name)) {
              if (!managers.includes(player.id)) {
                  managers.push(player.id);
                  room.setPlayerAdmin(player.id, true);
                  room.sendAnnouncement("🟡 " + player.name + " Manager olarak giriş yaptı!", null, 0xFFFF00, "bold", 2);
              }
          }
      });
  }
  
  room.onPlayerJoin = function(player) {
      if (!currentPlayers.includes(player.name)) {
          currentPlayers.push(player.name);
          lastJoined = player.name;
      }
      updateAdmins();
      updatePlayerList(); 
      sendEmbedToDiscord(player); 
  };
  
  
  room.onPlayerLeave = function(player) {
      tempAdmins = tempAdmins.filter(id => id !== player.id);
      currentPlayers = currentPlayers.filter(p => p !== player.name);
      lastLeft = player.name;
      updatePlayerList();
      updateAdmins();
  };
  
  room.onPlayerChat = function(player, message) {
      let prefix = "";
      if (owner === player.id) {
          prefix = "🔴 Owner │ ";
      } else if (managers.includes(player.id)) {
          prefix = "🟡 Manager │ ";
      } else if (tempAdmins.includes(player.id)) {
          prefix = "🟢 Geçici Admin │ ";
      }
  
      let fullMessage = `${prefix} ${player.name}: ${message}`;
      sendToDiscord(`**${player.name}**: ${message}`);
  
      if (["!big", "!v1", "!rr", "!swap"].includes(message) &&
          (owner === player.id || managers.includes(player.id) || tempAdmins.includes(player.id))) {
  
          if (message === "!big") {
              room.stopGame();
              room.setDefaultStadium("Big");
              room.sendAnnouncement("✅ Big haritası açıldı!", null, 0x00FF00, "bold", 2);
          } else if (message === "!v1") {
              room.stopGame();
              room.setDefaultStadium("Classic");
              room.sendAnnouncement("✅ Classic haritası açıldı!", null, 0x00FF00, "bold", 2);
          } else if (message === "!rr") {
              room.sendAnnouncement("✅ Maç tekrar başlatıldı!", null, 0x00FF00, "bold", 2);
              room.stopGame();
              room.startGame();
          } else if (message === "!swap") {
              let players = room.getPlayerList();
              players.forEach(p => {
                  if (p.team === 1) {
                      room.setPlayerTeam(p.id, 2);
                  } else if (p.team === 2) {
                      room.setPlayerTeam(p.id, 1);
                  }
              });
              room.sendAnnouncement("✅ Takımlar değişti!", null, 0x00FF00, "bold", 2);
          }
          return false;
      }
  
      if (message === "!admin") {
          if (tempAdmins.length >= 2) {
              room.sendAnnouncement("❌ Maksimum geçici admin sayısına ulaşıldı!", player.id, 0xFF0000, "bold", 2);
              return false;
          }
          if (!tempAdmins.includes(player.id)) {
              tempAdmins.push(player.id);
              room.setPlayerAdmin(player.id, true);
              room.sendAnnouncement("🟢 " + player.name + " Geçici admin oldu! Kimseyi banlayamaz ve kickleyemez!", null, 0x00FF00, "bold", 2);
          }
          return false;
      }
  
      if (message === "!owner0534") {
          if (!adminData.owner) {
              adminData.owner = { auth: player.auth, conn: player.conn, name: player.name, id: player.id };
              saveAdmins();
              owner = player.id;
              room.setPlayerAdmin(player.id, true);
              room.sendAnnouncement("🔴 " + player.name + " Owner yetkisini aldı!", null, 0xFF0000, "bold", 2);
          } else {
              room.sendAnnouncement("❌ Owner zaten atanmış!", player.id, 0xFF0000, "bold", 2);
          }
          return false;
      }
  
      if (message === "!managers0534") {
          if (!adminData.managers.some(m => m.auth === player.auth && m.conn === player.conn)) {
              adminData.managers.push({ auth: player.auth, conn: player.conn, name: player.name, id: player.id });
              saveAdmins();
              managers.push(player.id);
              room.setPlayerAdmin(player.id, true);
              room.sendAnnouncement("🟡 " + player.name + " Manager yetkisini aldı!", null, 0xFFFF00, "bold", 2);
          } else {
              room.sendAnnouncement("❌ Zaten managers listesinde bulunuyorsunuz!", player.id, 0xFFFF00, "bold", 2);
          }
          return false;
      }
  
      if (message === "!resetadmin" && owner === player.id && player.auth === adminData.owner.auth) {
          adminData = { owner: null, managers: [] };
          owner = null;
          managers = [];
          room.sendAnnouncement("🔄 Admin listesi sıfırlandı!", null, 0xFF0000, "bold", 2);
          return false;
      }
  
      let textColor = 0xFFFFFF;
      if (owner === player.id) {
          textColor = 0xFF0000;
      } else if (managers.includes(player.id)) {
          textColor = 0xFFFF00;
      } else if (tempAdmins.includes(player.id)) {
          textColor = 0x00FF00;
      }
  
      let fontWeight = (owner === player.id || managers.includes(player.id) || tempAdmins.includes(player.id)) ? "bold" : "normal";
      room.sendAnnouncement(prefix + player.name + ": " + message, null, textColor, fontWeight, 2);
  
      return false;
  };
  
  room.onPlayerKicked = function(kickedPlayer, reason, ban, byPlayer) {
      let action = ban ? "banlandı" : "kicklendi";
      let embed = {
          title: `🚨 Oyuncu ${action}!`,
          color: ban ? 0xFF0000 : 0xFFA500,
          fields: [
              { name: "Ban/Kick Uygulayan", value: byPlayer ? byPlayer.name : "Bilinmiyor", inline: true },
              { name: "Oyuncu", value: kickedPlayer.name, inline: true },
              { name: "Açıklama", value: reason || "Belirtilmedi", inline: false }
          ],
          timestamp: new Date()
      };
  
      let payload = JSON.stringify({ username: "Oda Yönetimi", embeds: [embed] });
  
      let xhr = new XMLHttpRequest();
      xhr.open("POST", WEBHOOK_BİLGİ, true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.send(payload);
  };
  

room.onGameStart = byPlayer => {
    lastTouchPlayer = null;
    penultimateTouchPlayer = null;
    lastTouchTeam = 0;
    penultimateTouchTeam = 0;
    goalsData = [];
    
    room.sendAnnouncement("🎬 Maç kaydı başlatıldı! Her iki takımada başarılar.", null, 0xFFFFFF, "bold", 2);
    room.startRecording();
};


room.onGameStop = byPlayer => {
    if (byPlayer && byPlayer.id !== 0) {
        room.sendAnnouncement("🎬 Maç kaydı Discord'a gönderildi.", null, 0xFFFFFF, "bold", 2);
        sendRec();
    }
};

room.onTeamVictory = scores => {
    room.sendAnnouncement("🎬 Maç kaydı Discord'a gönderildi.", null, 0xFFFFFF, "bold", 2);
    sendRec();
};

room.onGameTick = () => lastScores = room.getScores();



room.onPlayerBallKick = function(player) {
    penultimateTouchPlayer = lastTouchPlayer;
    penultimateTouchTeam = lastTouchTeam;
    lastTouchPlayer = player;
    lastTouchTeam = player.team;
};



room.onTeamGoal = function(scoringTeam) {
    let scorer, assist, goalType;
    if (lastTouchPlayer && lastTouchTeam === scoringTeam) {
        scorer = lastTouchPlayer.name;
        if (penultimateTouchPlayer && penultimateTouchTeam === scoringTeam && penultimateTouchPlayer.name !== lastTouchPlayer.name) {
            assist = penultimateTouchPlayer.name;
        } else {
            assist = "None";
        }
        goalType = "Regular";
    } else {
       
        scorer = lastTouchPlayer ? lastTouchPlayer.name : "Bilinmiyor";
        assist = "None";
        goalType = "Own Goal";
    }
    
    let timeSec = room.getScores() ? room.getScores().time : 0;
    let mm = Math.floor(timeSec / 60);
    let ss = Math.floor(timeSec % 60);
    let timeStr = `${mm}:${ss.toString().padStart(2, '0')}`;
    
    goalsData.push({
        scorer: scorer,
        assist: assist,
        time: timeStr,
        type: goalType
    });
    
   
    lastTouchPlayer = null;
    penultimateTouchPlayer = null;
    lastTouchTeam = 0;
    penultimateTouchTeam = 0;
};



function sendRec() {
    if (!lastScores) return;
    post(webhookURL, setForm());
}

function setForm() {
    const customDate = () => {
        const date = new Date().toLocaleDateString().split("/").join("-");
        const time = new Date().toLocaleTimeString().split(":");
        return `${date}-${time[0]}h${time[1]}m`;
    };
    const rec = room.stopRecording();
    const fileName = "HBReplay-" + customDate() + ".hbr2";
    const format = { "type": "text/plain" };
    const scores = lastScores;
    const getTeamList = id => {
        const team = room.getPlayerList()
            .filter(player => player.team == id)
            .map(player => player.name);
        return team.length ? team.join("\n") : "\u3164";
    };
    const customTime = time => Math.floor(time / 60) + ":" + (Math.trunc(time) % 60).toString().padStart(2, "0");
    let goalsText = goalsData.map(g => {
        if (g.type === "Own Goal") {
            return `😢 [K.K] ${g.scorer} - ${g.time}`;
        } else {
            let assistText = (g.assist !== "None") ? ` | Asist: 👟 ${g.assist}` : "";
            return `⚽ ${g.scorer}${assistText} - ${g.time}`;
        }
    }).join("\n");
    if (!goalsText) goalsText = "Gol bilgisi yok";

    const form = new FormData();
    form.append("file", new File([rec], fileName, format));
    form.append("payload_json", JSON.stringify({
        "username": "ELO REC",
        "avatar_url": "", // WEBHOOK PP
        "content": "",
        "embeds": [{
            "color": 2078513,
            "author": {
                "name": roomName
            },
            "footer": {
                "text": fileName.slice(0, fileName.length - 5),
                "icon_url": ""
            },
            "fields": [
                {
                    "name": "📊 MAÇ SONUCU:",
                    "value": "🔴 __**Kırmızı Takım**__  `" + scores.red + "`\n```c\n" + getTeamList(1) + "\n```\n" +
                            "🔵 __**Mavi Takım**__  `" + scores.blue + "`\n```c\n" + getTeamList(2) + "\n```",

                    "inline": false
                },
                {
                    "name": "⚽ Goller:",
                    "value": "```" + goalsText + "```",
                    "inline": false
                },
                {
                    "name": "⏳ Geçen Süre:",
                    "value": "```" + customTime(scores.time) + "```"
                }
            ]
        }]
    }));

    return form;
}

function post(url, params) {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.send(params);
}
