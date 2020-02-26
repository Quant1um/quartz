const createStreamingRouter = require("./streaming_router");
const createLongpollRouter = require("./longpoll_router");
const scheduler = require("./scheduler");

const express = require("express");
const app = express();

const stream = createStreamingRouter({ bitrate: 128, sampleRate: 44100 });
const event = createLongpollRouter({ historySize: 20 });

let currentTrack = {
    title: "Quartz",
    author: "Radio",
    color: [255, 255, 255, 100],
    thumbnail: ""
}

const setTrack = (data) => {
    if(!data) throw new Error("invalid data");
    if(!data.stream) throw new Error("invalid stream");

    data = Object.assign({
        title: "ID",
        author: "ID",
        color: [255, 255, 255, 100],
        thumbnail: ""
    }, data);

    stream.bind(data.stream);

    currentTrack = { 
        title: data.title, 
        author: data.author, 
        color: data.color, 
        thumbnail: data.thumbnail 
    };

    event("track", currentTrack);
};

const updateTrack = () => setTrack(scheduler({ listeners, previous: currentTrack }));

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

stream.on("finish", updateTrack);
updateTrack();

app.use("/", express.static("web"));
app.use("/stream", stream.router);
app.use("/events", event.router);
app.get("/data", (_, res) => res.json({ ...currentTrack, listeners }));

app.listen(process.env.PORT || 3002);

process.on("warning", (e) => console.warn(e.stack));