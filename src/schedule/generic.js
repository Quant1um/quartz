const request = require("request");

const data = [
    {
        url: "https://dl.dropboxusercontent.com/s/j900zx6bjs5oy3i/all_my_friends.mp3?dl=0",
        title: "All My Friends (Kotori & Synthion Remix)",
        author: "Madeon",
        thumbnail: "https://dl.dropboxusercontent.com/s/xtxr5ggezf1z97m/all_my_friends.png?dl=0",
        colors: "neutral"
    },

    {
        url: "https://dl.dropboxusercontent.com/s/ac7u23shdas2sls/daftpunk_hbfs.mp3?dl=0",
        title: "Harder Better Faster Stronger",
        author: "Daft Punk",
        thumbnail: "https://dl.dropboxusercontent.com/s/yais4jfuxf2fjyd/daftpunk_hbfs.jpg?dl=0",
        colors: "red"
    },

    {
        url: "https://dl.dropboxusercontent.com/s/xd5c776sn1tx8oe/lift_off.mp3?dl=0",
        title: "Lift Off",
        author: "All Levels At Once",
        thumbnail: "https://dl.dropboxusercontent.com/s/blqufnlekltlnol/lift_off.jpg?dl=0",
        colors: "purple"
    },

    {
        url: "https://dl.dropboxusercontent.com/s/x7uv8mniqxxjhjc/benson_cut.mp3?dl=0",
        title: "Benson cut 今夜",
        author: "Future Girlfriend 音楽",
        thumbnail: "https://dl.dropboxusercontent.com/s/l6dk6eapd5htpgk/benson_cut.jpg?dl=0",
        colors: "cyan"
    },

    {
        url: "https://dl.dropboxusercontent.com/s/1i0arxbybo5l20y/shrekophone.mp3?dl=0",
        title: "Shrekophone",
        author: "Shrek",
        thumbnail: "https://dl.dropboxusercontent.com/s/mz9namxxn8c4vwt/shrekophone.jpg?dl=0",
        colors: "green"
    },
];

const track = (d) => {
    return {
        title: d.title,
        author: d.author,
        thumbnail: d.thumbnail,
        colorScheme: d.colors,
        stream: request(d.url)
    };
};

let lastId = null;
module.exports = () => {
    let id = null;
    do {
        id = Math.floor(Math.random() * data.length);
    } while(id === lastId);

    return track(data[id]);
};