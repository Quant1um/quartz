const plotCurve = (ctx, arr, len, x, y, w, h, s) => {
    ctx.lineTo(x, y + (1 - arr[0] * s) * h);

    const dt = w / (len - 1);

    let i;
    for (i = 1; i < len - 2; i++)
    {
        const xx = x + i * dt;
        const yy = y + (1 - arr[i    ] * s) * h;
        const yn = y + (1 - arr[i + 1] * s) * h

        let xc = xx + dt / 2;
        let yc = (yy + yn) / 2;
        ctx.quadraticCurveTo(xx, yy, xc, yc);
    }

    ctx.quadraticCurveTo(
        x + i * dt, 
        y + (1 - arr[i] * s) * h, 
        x + (i + 1) * dt, 
        y + (1 - arr[i + 1] * s) * h);

    return ctx;
};


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

    aux[0] = (.299 + .701 * U + .168 * W) * cur[0]
        + (.587 - .587 * U + .330 * W) * cur[1]
        + (.114 - .114 * U - .497 * W) * cur[2];
    aux[1] = (.299 - .299 * U - .328 * W) * cur[0]
        + (.587 + .413 * U + .035 * W) * cur[1]
        + (.114 - .114 * U + .292 * W) * cur[2];
    aux[2] = (.299 - .3 * U + 1.25 * W) * cur[0]
        + (.587 - .588 * U - 1.05 * W) * cur[1]
        + (.114 + .886 * U - .203 * W) * cur[2];
    aux[3] = cur[3];
};

//sigma = 1.5
const gaussianKernel = [0.038735, 0.113085, 0.215007, 0.266346, 0.215007, 0.113085, 0.038735];
const identityKernel = [1];

//https://gist.github.com/jhurliman/7273803
const convolve = (src, dest, weights) => {
    if (weights.length % 2 !== 1)
      throw new Error('weights array must have an odd length');
  
    let al = src.length;
    let wl = weights.length;
    let offset = ~~(wl / 2);

    for (let i = 0; i < al; i++) {
        let kmin = (i >= offset) ? 0 : offset - i;
        let kmax = (i + offset < al) ? wl - 1 : al - 1 - i + offset;
  
        dest[i] = 0;
        for (let k = kmin; k <= kmax; k++)
            dest[i] += src[i - offset + k] * weights[k];
    }
}

const adjust = (buffer, min, max) => {
    for(let i = 0; i < buffer.length; i++) {
        const norm = (buffer[i] - min) / (max - min);
        buffer[i] = Math.pow(norm, 5);
    }

    return buffer;
}

$(function() {
    const current = [255, 255, 255, 0];
    const auxilary = [255, 255, 255, 0];

    const canvas = $("#visualizer")[0];
    const context = canvas.getContext("2d");

    const data0 = new Float32Array(QuartzAudio.fftSize());
    
    let maximum = 10000;
    let minimum = 0;

    const updateRange = (buffer) => {
        let max = 0;
        let min = 0;
        for(let i = 0; i < buffer.length; i++) {
            max = Math.max(buffer[i], max);
            min = Math.min(buffer[i], min);
        }
            
        
        if(max > maximum) maximum = max;

        maximum += (max - maximum) * 0.1;
        minimum += (min - minimum) * 0.1;

        if(maximum * 0.8 < minimum) minimum = maximum * 0.8;
    };

    const updateData = () => {
        convolve(QuartzAudio.fft(), data0, identityKernel);
        updateRange(data0);
        adjust(data0, minimum, maximum);
        return data0;
    };

    const updateColors = () => {
        let color = QuartzUi.getColor();
        for (let i = 0; i < 4; i++) {
            current[i] += (color[i] - current[i]) * 0.1;
        }

        createAuxilaryColor(current, auxilary);
    };

    const render = () => {
        requestAnimationFrame(render);

        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        updateColors();

        const grd = context.createLinearGradient(0, 0, canvas.width, canvas.height);
        grd.addColorStop(0, `rgba(${current[0]}, ${current[1]}, ${current[2]}, ${current[3] / 255 * 0.7})`);
        grd.addColorStop(1, `rgba(${auxilary[0]}, ${auxilary[1]}, ${auxilary[2]}, ${auxilary[3] / 255 * 0.7})`);
        context.fillStyle = grd;

        const buffer = updateData();

        const len = Math.floor(buffer.length * 0.8);
        for(let i = 0; i < 3; i++) {
            context.beginPath();
            context.moveTo(0, canvas.height);
            //context.lineTo(0, 0);
            plotCurve(context, buffer, len, 0, 0, canvas.width, canvas.height, Math.pow((i + 1) / 3, 0.7));
            //context.lineTo(canvas.width, 0);
            context.lineTo(canvas.width, canvas.height);
            context.closePath();
            context.fill();
        }
        
        /*for (let i = 0; i < drawn; i++) {
            const value = buffers[0][i];
            const norm = Math.pow(value / 255 * 1.5, 3);

            const height = norm * canvas.height;
            const x = canvas.width * i / (drawn + 1);
            const y = canvas.height - height;
            const h = height;

            roundRect(context, x, y, w, h).fill();
        }*/
    };

    render();
});