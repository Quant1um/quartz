const express = require("express");

module.exports = ({ historySize = 20, bufferTime = 0.2 } = {}) => {
    const router = express.Router();

    const history = new Map();
    const clients = new Set();

    let tail = 0;
    let id = 0;

    router.get("/:id", (req, res) => {
        const lid = parseInt(req.params.id) || 0;

        if(lid < id && history.has(lid)) {
            res.set({
                "Cache-Control": "no-cache, no-store, must-revalidate, proxy-revalidate",
                "Pragma": "no-cache",
                "Expires": "0",
                "Surrogate-Control": "no-store",

                "Connection": "close"
            }).json(history.get(lid));
            return;
        }

        clients.add(res);

        res.delete = () => clients.delete(res);
        res.socket.once("close", res.delete);
    });

    const broadcast = (data) => {
        clients.forEach(cli => {
            cli.json(data);
            cli.socket.off("close", cli.delete);
        });
        
        clients.clear();
    };

    const limit = (l) => {
        while(history.size > l) {
            if(!history.has(tail)) throw new Error("unexpected case");
            history.delete(tail);
            tail++;
        }
    };

    let buffer = [];
    const send = () => {
        if(buffer.length == 0) return;

        const d = { buffer, id: id + 1 };
        history.set(id, d);
        id++;

        limit(historySize);
        broadcast(d);

        buffer = [];
    };

    const push = (type, data) => {
        buffer.push({ type, data });
    };

    setInterval(send, bufferTime);

    push.router = router;
    return push;
};