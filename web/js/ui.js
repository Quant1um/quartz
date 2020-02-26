let color = null;

const startAnimation = (selector) => {
    const animatable = $(selector);

    animatable.css("animation", "none");
    requestAnimationFrame(() => animatable.css("animation", ""));
};

const validateColor = (col) => {
    if(!Array.isArray(col)) return null;
    col[0] = Math.max(0, Math.min(255, +col[0]));
    col[1] = Math.max(0, Math.min(255, +col[1]));
    col[2] = Math.max(0, Math.min(255, +col[2]));
    col[3] = Math.max(0, Math.min(100, +col[3]));
    return col;
}

$(function() {
    const cStyle = $("<style></style>").appendTo("head");

    window.QuartzUi = {
        getColor: () => color,
        setColor: (col) => {
            color = validateColor(col) || [255, 255, 255, 100];

            cStyle.html(`
                .range::-webkit-slider-runnable-track,
                .range::-moz-range-track {
                    background: rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]});
                }
            
                .range::-webkit-slider-thumb,
                .range::-moz-range-thumb {
                    border-color: rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]});
                }`);
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

    QuartzUi.setColor([255, 255, 255, 100]);

    const volume = $("#volume");
    const updateVolume = () => QuartzAudio.setVolume(volume.val() / 100);
    volume.val(0);
    volume.bind("input", updateVolume);
    volume.bind("change", updateVolume);
});