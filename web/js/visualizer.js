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

//rotate color hue by 20 degrees
const createAuxilaryColor = (cur, aux) => {
    const U = Math.cos(0.349);
    const W = Math.sin(0.349);
  
    aux[0] = (.299+.701*U+.168*W) * cur[0]
      + (.587-.587*U+.330*W)      * cur[1]
      + (.114-.114*U-.497*W)      * cur[2];
    aux[1] = (.299-.299*U-.328*W) * cur[0]
      + (.587+.413*U+.035*W)      * cur[1]
      + (.114-.114*U+.292*W)      * cur[2];
    aux[2] = (.299-.3*U+1.25*W)   * cur[0]
      + (.587-.588*U-1.05*W)      * cur[1]
      + (.114+.886*U-.203*W)      * cur[2];
    aux[3] = cur[3];
};

$(function() {
    let current = [255, 255, 255, 0];
    let auxilary = [255, 255, 255, 0];

    const canvas = $("#visualizer")[0];
    const context = canvas.getContext("2d");

    const render = () => {
        requestAnimationFrame(render);

        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        let color = QuartzUi.getColor();
        for(let i = 0; i < 4; i++) {
            current[i] += (color[i] - current[i]) * 0.1;
        }

        createAuxilaryColor(current, auxilary);
        
        const grd = context.createLinearGradient(0, 0, canvas.width, canvas.height);
        grd.addColorStop(0, `rgba(${current[0]}, ${current[1]}, ${current[2]}, ${current[3]})`);
        grd.addColorStop(1, `rgba(${auxilary[0]}, ${auxilary[1]}, ${auxilary[2]}, ${auxilary[3]})`);
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