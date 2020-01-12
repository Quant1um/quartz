const lame = require("lame");
module.exports = (opts) => new lame.Decoder(opts);
