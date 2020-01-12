const colorSchemes = ["red", "orange", "green", "cyan", "purple", "neutral"];
let currentScheme = null;

const startAnimation = (selector) => {
    const animatable = $(selector);

    animatable.css("animation", "none");
    requestAnimationFrame(() => animatable.css("animation", ""));
};

$(function() {
    const body = $("body");

    window.QuartzUi = {
        getScheme: () => currentScheme,
        setScheme: (scheme) => {
            if (!colorSchemes.includes(scheme)) throw new Error("unknown color scheme");
            colorSchemes.forEach((s) => s === scheme ? body.addClass(s) : body.removeClass(s))
            currentScheme = scheme;
        },

        setData: (title, author, thumbnail) => {
            $("#info-title").text(title);
            $("#info-author").text(author);
            $("#image-main").attr("src", thumbnail);
            startAnimation("#info-container");
        },

        setBackground: (src) => {
            const curr = $(".background-image.current");
            const next = $(".background-image:not(.current)");
        
            next.attr("src", src);
            curr.removeClass("current");
            next.addClass("current");
        },

        setListenerCount: (count) => {
            let text = "No one is listening right now";
            if(count == 1) text = "One person is listening right now";
            else if(count != 0) text = count + " people are listening right now";

            $("#info-listeners").text(text);
            startAnimation("#info-listeners");
        }
    };

    QuartzUi.setScheme("neutral");

    const volume = $("#volume");
    const updateVolume = () => QuartzAudio.setVolume(volume.val() / 100);
    volume.val(0);
    volume.bind("input", updateVolume);
    volume.bind("change", updateVolume);
});