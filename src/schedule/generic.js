const request = require("request");

const data = [
    {
        url: "https://dl.dropboxusercontent.com/s/j900zx6bjs5oy3i/0000.mp3?dl=0",
        title: "All My Friends (Kotori & Synthion Remix)",
        author: "Madeon",
        thumbnail: "https://dl.dropboxusercontent.com/s/xtxr5ggezf1z97m/0000.png?dl=0",
        color: [255, 255, 255, 100]
    },

    {
        url: "https://dl.dropboxusercontent.com/s/ac7u23shdas2sls/0004.mp3?dl=0",
        title: "Harder Better Faster Stronger",
        author: "Daft Punk",
        thumbnail: "https://dl.dropboxusercontent.com/s/yais4jfuxf2fjyd/0004.jpg?dl=0",
        color: [255, 50, 50, 100]
    },

    {
        url: "https://dl.dropboxusercontent.com/s/xd5c776sn1tx8oe/0005.mp3?dl=0",
        title: "Lift Off",
        author: "All Levels At Once",
        thumbnail: "https://dl.dropboxusercontent.com/s/blqufnlekltlnol/0005.jpg?dl=0",
        color: [197, 0, 127, 100]
    },

    {
        url: "https://dl.dropboxusercontent.com/s/x7uv8mniqxxjhjc/0003.mp3?dl=0",
        title: "Benson cut 今夜",
        author: "Future Girlfriend 音楽",
        thumbnail: "https://dl.dropboxusercontent.com/s/l6dk6eapd5htpgk/0003.jpg?dl=0",
        color: [0, 255, 255, 100]
    },

    {
        url: "https://dl.dropboxusercontent.com/s/1i0arxbybo5l20y/0001.mp3?dl=0",
        title: "Shrekophone",
        author: "Shrek",
        thumbnail: "https://dl.dropboxusercontent.com/s/mz9namxxn8c4vwt/0001.jpg?dl=0",
        color: [50, 255, 50, 100]
    },

    {
        url: "https://dl.dropboxusercontent.com/s/8vg0vqf1mu1qf9n/0002.mp3?dl=0",
        title: "Spicy (Kotori Remix)",
        author: "2ToneDisco x BLOOD CODE x Mylk",
        thumbnail: "https://dl.dropboxusercontent.com/s/g2rsu23eguc4ahf/0002.jpg?dl=0",
        color: [255, 255, 250, 100]
    },

    {
        url: "https://dl.dropboxusercontent.com/s/raf6hgkzzttg0u0/0006.mp3?dl=0",
        title: "Who We Are (Milkoi Remix)",
        author: "TRYDENY & Oing",
        thumbnail: "https://dl.dropboxusercontent.com/s/srbghhos523qfno/0006.jpg?dl=0",
        color: [255, 50, 50, 100]
    },

    {
        url: "https://dl.dropboxusercontent.com/s/qvnw3bbjyeyvlko/0007.mp3?dl=0",
        title: "Dual Senses",
        author: "Datamosh ft. Gött",
        thumbnail: "https://dl.dropboxusercontent.com/s/dhmhtc0iru6j6fd/0007.jpg?dl=0",
        color: [197, 0, 127, 100]
    },

    {
        url: "https://dl.dropboxusercontent.com/s/ghxpi157ku7l85q/0008.mp3?dl=0",
        title: "Into The Sky",
        author: "Nansuke ft. Saloon",
        thumbnail: "https://dl.dropboxusercontent.com/s/hrymnaj0k3s8svl/0008.jpg?dl=0",
        color: [0, 255, 255, 100]
    }
];

const track = (d) => {
    return {
        title: d.title,
        author: d.author,
        thumbnail: d.thumbnail,
        color: d.color,
        stream: request(d.url)
    };
};

let lastId = null;
module.exports = () => {
    let id = null;
    do {
        id = Math.floor(Math.random() * data.length);
    } while(id === lastId);

    lastId = id;
    return track(data[id]);
};