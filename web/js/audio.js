$(function() {
    const context = new(window.AudioContext || window.webkitAudioContext)();

    let loaded = false;
    const audio = new Audio();
    audio.src = "/stream";
    audio.crossOrigin = "anonymous";
    audio.preload = "none";
    audio.volume = 0;

    const source = context.createMediaElementSource(audio);

    const analyzer = context.createAnalyser();
    analyzer.fftSize = 128;
    analyzer.minDecibels = -80;
    analyzer.maxDecibels = -2;

    const buffer = new Uint8Array(analyzer.frequencyBinCount);

    source.connect(analyzer);
    analyzer.connect(context.destination);

    let targetVolume = 0;
    const approachTargetVolume = () => {
        audio.volume += (targetVolume - audio.volume) * 0.05;
        if(Math.abs(audio.volume - targetVolume) < 0.01) {
            audio.volume = targetVolume;
        } else {
            setTimeout(approachTargetVolume, 1);
        }

        if (audio.volume > 0 && !loaded) {
            audio.load();
            audio.play();
            loaded = true;
        }
    }

    window.QuartzAudio = {

        fft: () => {
            analyzer.getByteFrequencyData(buffer);
            return buffer;
        },

        setVolume: (vol) => {
            targetVolume = vol;
            approachTargetVolume();
        },

        analyzer,
        audio
    };
});