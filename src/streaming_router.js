const express = require("express");
const EventEmitter = require("events");
const lame = require("lame");
const Throttle = require("throttle");

module.exports = ({ bitrate = 96, outSampleRate = 44100 } = {}) => {
    const router = express.Router();
    const clients = new Set();
    const streaming = new EventEmitter();

    router.get("/", (req, res) => {
        res.writeHead(200, {
            "Content-Type": "audio/mpeg",
            "Transfer-Encoding": "chunked",
            "Connection": "close",
            "Accept-Ranges": "none",

            "Cache-Control": "no-cache, no-store, must-revalidate, proxy-revalidate",
            "Pragma": "no-cache",
            "Expires": "0",
            "Surrogate-Control": "no-store",

            //"Connection": "Keep-Alive",
            //"Keep-Alive": "timeout=20, max=1000"
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

    //const dump = require("fs").createWriteStream("audio.mp3");
    //clients.add(dump);

    let source = null;
    const bindSource = (audio) => {
        if(source && source.close) source.close();

        if(audio) {
            console.log(audio);

            const { stream, channels, sampleRate, bitDepth } = audio;

           // console.log(stream, channels, sampleRate, bitDepth);

            let sum = 0;
            stream.on("data", (a) => console.log(sum += a.length / (channels * sampleRate * (bitDepth / 8))));
    
            source = 
                stream
                .pipe(new lame.Encoder({
                    channels,        
                    bitDepth,    
                    sampleRate, 
    
                    bitRate: bitrate,
                    outSampleRate: outSampleRate,
                    mode: lame.STEREO
                }))
                .pipe(new Throttle(bitrate * 1000 / 8)
                .on("data", broadcast)
                .on("error", () => streaming.emit("error"))
                .on("end", () => streaming.emit("finish")));
        }
    };

    streaming.bind = bindSource;
    streaming.router = router;
    return streaming;
};