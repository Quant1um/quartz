const express = require("express");
const EventEmitter = require("events");

const createStreamingRouter = require("./streaming_router");
const createLongpollRouter = require("./longpoll_router");

module.exports = ({ bitrate = 128, sampleRate = 44100, longpollHistorySize = 20 }) => {
    const streaming = createStreamingRouter({ bitrate, sampleRate });
    const event = createLongpollRouter({ historySize: longpollHistorySize });

    const router = express.Router();
    const radio = new EventEmitter();
    radio.router = router;
    
    let currentTrack = {
        title: "Quartz",
        author: "Radio",
        color: [255, 255, 255, 100],
        thumbnail: "",
        audio: null
    };
    
    const setTrack = ({ title = "ID", author = "ID", color = [255, 255, 255, 100], thumbnail = "", stream }) => {
        currentTrack = { title, author, color, thumbnail, stream };

        streaming.bind(stream);
        event("track", currentTrack);
    };

    let listeners = 0;
    streaming.on("connected", (req, res) => {
        listeners++;
        event("listeners", listeners);

        radio.emit("connected", req, res);
        radio.emit("listenersChanged", listeners);
    });

    streaming.on("disconnected", (req, res) => {
        listeners--;
        event("listeners", listeners);

        radio.emit("disconnected", req, res);
        radio.emit("listenersChanged", listeners);
    });

    streaming.on("finish", () => radio.emit("finish", currentTrack));

    Object.defineProperties(radio, {
        track: {
            enumerable: true,
            configurable: false,

            get: () => currentTrack,
            set: (value) => setTrack(value)
        },

        listeners: {
            enumerable: true,
            configurable: false,

            get: () => listeners
        }
    });

    router.use("/stream", streaming.router);
    router.use("/events", event.router);
    router.get("/data", (_, res) => res.json({ 
        title: currentTrack.title, 
        author: currentTrack.author, 
        color: currentTrack.color, 
        thumbnail: currentTrack.thumbnail, 
        listeners 
    }));

    return radio;
};