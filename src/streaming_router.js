const express = require("express");
const stream = require("stream");

const lame = require("lame");
const Throttle = require("throttle");

class DummyStream extends stream.Transform {
    _transform(chunk, _, cb) {
        cb(null, chunk);
    }

    end(chunk, encoding, cb) { 
        if (typeof chunk === 'function') {
            cb = chunk;
            chunk = null;
            encoding = null;
        } else if (typeof encoding === 'function') {
            cb = encoding;
            encoding = null;
        }

        if (chunk !== null && chunk !== undefined) this.write(chunk, encoding);

        if(cb) cb();
        this.emit("finish");
    }
}

module.exports = ({ bitrate = 96, sampleRate = 44100 } = {}) => {
    const router = express.Router();
    const clients = new Set();

    const dummy = new DummyStream();
    const decoder = new lame.Decoder();
    const encoder = new lame.Encoder({
        // input
        channels: 2,        // 2 channels (left and right)
        bitDepth: 16,       // 16-bit samples
        sampleRate: 44100,  // 44,100 Hz sample rate
       
        // output
        bitRate: bitrate,
        outSampleRate: sampleRate,
        mode: lame.STEREO
    });

    router.get("/", (req, res) => {
        res.writeHead(200, {
            "Content-Type": "audio/mpeg",
            "Transfer-Encoding": "chunked",
            "Cache-Control": "no-cache"
        });

        dummy.emit("connected", req, res);
        clients.add(res);

        res.socket.on("end", () => {
            dummy.emit("disconnected", req, res);
            clients.delete(res);
            res.end();
        });
    });

    const broadcast = (data) => clients.forEach(cli => cli.write(data));

    dummy
        .pipe(decoder, { end: false })
        .pipe(encoder)
        .pipe(new Throttle(bitrate * 1000 / 8))
        .on("data", broadcast);

    dummy.router = router;
    return dummy;
};