const streamingRouter = require("./streaming_router");
const longpollRouter = require("./longpoll_router");
const decoder = require("./decoder");
const scheduler = require("./scheduler");

const express = require("express");
const app = express();

const stream = streamingRouter({ bitrate: 128, sampleRate: 44100 });
const event = longpollRouter({ historySize: 20 });

let currentStream = null;
let currentTrack = {
    title: "Quartz",
    author: "Radio",
    colorScheme: "neutral",
    thumbnail: ""
}

const setTrack = (data) => {
    if(!data) throw new Error("invalid data");
    if(!data.stream) throw new Error("invalid stream");

    data = Object.assign({
        title: "ID",
        author: "ID",
        colorScheme: "neutral",
        thumbnail: ""
    }, data);

    if(currentStream) {
        currentStream.unpipe(stream);
        if(currentStream.close) currentStream.close();
    }

    currentStream = data.stream.pipe(decoder());
    currentStream.pipe(stream);

    currentTrack = { 
        title: data.title, 
        author: data.author, 
        colorScheme: data.colorScheme, 
        thumbnail: data.thumbnail 
    };

    event("track", currentTrack);
};

const update = () => setTrack(scheduler({ listeners, previous: currentTrack }));

//listener count
let listeners = 0;
stream.on("connected", () => {
    listeners++;
    event("listeners", listeners);
});

stream.on("disconnected", () => {
    listeners--;
    event("listeners", listeners);
});

stream.on("finish", update);
update();

app.use("/", express.static("web"));
app.use("/stream", stream.router);
app.use("/events", event.router);
app.get("/data", (_, res) => res.json({ ...currentTrack, listeners }));

app.listen(process.env.PORT || 3002);

process.on("warning", (e) => console.warn(e.stack));