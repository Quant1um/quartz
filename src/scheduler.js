module.exports = ({ listeners, previous }) => {
    let stream = require("fs").createReadStream("test2.mp3");

    return {
        stream,
        title: "uwu",
        author: "owo",
        colorScheme: "cyan",
        thumbnail: "https://cs8.pikabu.ru/post_img/big/2017/11/06/8/1509970885170093964.png"
    };
};