const streamingRouter = require("./streaming_router");
const longpollRouter = require("./longpoll_router");

const scheduler = require("./scheduler");

const express = require("express");
const app = express();

const stream = streamingRouter({ bitrate: 128, sampleRate: 44100 });
const event = longpollRouter({ historySize: 20 });

let currentStream = null;
let currentData = {
    title: "Quartz",
    author: "Radio",
    colorScheme: "neutral",
    thumbnail: ""
}

const setData = (data) => {
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

    data.stream.pipe(stream);

    currentStream = data.stream;
    currentData = { 
        title: data.title, 
        author: data.author, 
        colorScheme: data.colorScheme, 
        thumbnail: data.thumbnail 
    };

    event("track", currentData);
};

const update = () => setData(scheduler({ listeners }));

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
app.get("/data", (_, res) => res.json({ ...currentData, listeners }));

app.listen(process.env.PORT || 3002);