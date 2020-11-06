const scheduler = require("./scheduler");
const createRadio = require("./radio");

const express = require("express");
const app = express();

const radio = createRadio({ bitrate: 128, sampleRate: 44100 });

const updateTrack = () => 
    scheduler({ listeners: radio.listeners, previous: radio.track })
        .then((track) => radio.track = track)
        .catch((e) => {
            throw e;
        });

radio.on("finish", updateTrack);
updateTrack();

app.set("etag", false);
app.use("/", express.static("web"));
app.use("/", radio.router);

app.listen(process.env.PORT || 3002);

process.on("warning", (e) => console.warn(e.stack));