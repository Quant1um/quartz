const express = require("express");

module.exports = ({ historySize = 20 } = {}) => {
    const router = express.Router();

    const history = new Map();
    const clients = new Set();

    let tail = 0;
    let id = 0;

    router.get("/:id", (req, res) => {
        const lid = parseInt(req.params.id) || 0;

        if(lid < id && history.has(lid)) {
            res.json(history.get(lid));
            return;
        }

        clients.add(res);

        res.delete = () => clients.delete(res);
        res.socket.once("end", res.delete);
    });

    const broadcast = (data) => {
        clients.forEach(cli => {
            cli.json(data);
            cli.socket.off("end", cli.delete);
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

    const push = (type, data) => {
        const d = { type, data, id: id + 1 };
        history.set(id, d);
        id++;

        limit(historySize);
        broadcast(d);
    };

    push.router = router;
    return push;
};