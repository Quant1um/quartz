const express = require("express");
const stream = require("stream");
const EventEmitter = require("events");

const lame = require("lame");
const Throttle = require("throttle");

module.exports = ({ bitrate = 96, sampleRate = 44100 } = {}) => {
    const router = express.Router();
    const clients = new Set();
    const streaming = new EventEmitter();

    router.get("/", (req, res) => {
        res.writeHead(200, {
            "Content-Type": "audio/mpeg",
            "Transfer-Encoding": "chunked",
            "Cache-Control": "no-cache"
        });

        streaming.emit("connected", req, res);
        clients.add(res);

        res.socket.once("close", () => {
            streaming.emit("disconnected", req, res);
            clients.delete(res);
            res.end();
        });
    });

    const broadcast = (data) => clients.forEach(cli => cli.write(data));

    let source = null;
    const bindSource = (stream) => {
        if(source != null && source.close) source.close();
        source = stream
            .pipe(new lame.Decoder())
            .pipe(new lame.Encoder({
                channels: 2,
                bitDepth: 16,
                sampleRate: 44100,
               
                bitRate: bitrate,
                outSampleRate: sampleRate,
                mode: lame.STEREO
            }))
            .pipe(new Throttle(bitrate * 1000 / 8))
            .on("data", broadcast)
            .on("finish", () => streaming.emit("finish"));
    };

    streaming.bind = bindSource;
    streaming.router = router;
    return streaming;
};