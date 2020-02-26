$(function() {
    const handleEvent = (type, data) => {
        if(type === "listeners") {
            QuartzUi.setListenerCount(data);
        } else if(type === "track") {
            data = Object.assign({
                title: "ID",
                author: "ID",
                color: [255, 255, 255, 100],
                thumbnail: ""
            }, data);

            QuartzUi.setColor(data.color);
            QuartzUi.setBackground(data.thumbnail);
            QuartzUi.setData(data.title, data.author, data.thumbnail);
        } 
    };

    const initData = (data) => {
        data = Object.assign({
            title: "ID",
            author: "ID",
            color: [255, 255, 255, 100],
            thumbnail: "",
            listeners: 0
        }, data);

        QuartzUi.setListenerCount(data.listeners);
        QuartzUi.setColor(data.color);
        QuartzUi.setBackground(data.thumbnail);
        QuartzUi.setData(data.title, data.author, data.thumbnail);
    };

    const longPoll = (id) => {
        $.ajax({
            url: "/events/" + id,
            dataType: "json"
        }).done((json) => {
            handleEvent(json.type, json.data);
            setTimeout(() => longPoll(json.id || id), 0);
        }).fail(() => {
            setTimeout(() => longPoll(id), 0);
        });
    }

    const fetchData = () => {
        $.ajax({
            url: "/data/",
            dataType: "json"
        }).done((json) => {
            initData(json);
            setTimeout(() => longPoll(-1), 0);
        }).fail(() => {
            setTimeout(fetchData, 0);
        });
    }

    fetchData();
});