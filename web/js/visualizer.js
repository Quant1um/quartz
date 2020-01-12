const roundRect = (ctx, x, y, w, h) => {
    const r = Math.min(w, h) / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    return ctx;
};

const gradients = {
    red:        [245, 52,  89,  255, 235, 85,  52,  245],
    orange:     [255, 139, 38,  255, 245, 59,  154, 245],
    green:      [38,  255, 45,  255, 59,  245, 177, 245],
    cyan:       [59,  173, 227, 255, 174, 43,  255, 245],
    purple:     [154, 56,  245, 255, 245, 59,  146, 245],
    neutral:    [255, 255, 255, 255, 255, 255, 255, 245],
    
    start:      [255, 255, 255, 0,   255, 255, 255, 0  ]
};

let current = gradients.start;
let target = gradients.neutral;

$(function() {
    const canvas = $("#visualizer")[0];
    const context = canvas.getContext("2d");

    const render = () => {
        requestAnimationFrame(render);

        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        target = gradients[QuartzUi.getScheme()] || gradients.neutral;
        for(let i = 0; i < 8; i++) {
            current[i] += (target[i] - current[i]) * 0.1;
        }

        const grd = context.createLinearGradient(0, 0, canvas.width, canvas.height);
        grd.addColorStop(0, `rgba(${current[0]}, ${current[1]}, ${current[2]}, ${current[3]})`);
        grd.addColorStop(1, `rgba(${current[4]}, ${current[5]}, ${current[6]}, ${current[7]})`);
        context.fillStyle = grd;

        const buffer = QuartzAudio.fft();

        const padding = 10;
        const drawn = Math.floor(buffer.length * 0.85);
        const w = canvas.width * 1 / (drawn + 1 + padding);

        for (let i = 0; i < drawn; i++) {
            const value = buffer[i];
            const norm = Math.pow(value / 255, 1.5);

            const height = norm * canvas.height;
            const x = canvas.width * i / (drawn + 1);
            const y = canvas.height - height;
            const h = height;

            roundRect(context, x, y, w, h).fill();
        }
    };

    render();
});