$(function() {
    const context = new(window.AudioContext || window.webkitAudioContext)();

    const audio = new Audio();
    audio.src = "/stream?r=" + Math.random().toString(36).slice(2);
    audio.crossOrigin = "anonymous";
    audio.preload = "none";
    audio.volume = 1;

    let initialize = () => {
        initialize = () => {};

        audio.load();
        audio.addEventListener("canplay", () => audio.play());

        audio.addEventListener("paused", () => {
            audio.load();
        });
    };

    const source = context.createMediaElementSource(audio);
    const gain = context.createGain();
    const analyzer = context.createAnalyser();

    analyzer.fftSize = 128;
    analyzer.minDecibels = -120;
    analyzer.maxDecibels = -2;
    analyzer.smoothingTimeConstant = 0.85;

    gain.gain.setValueAtTime(0, context.currentTime);

    const buffer = new Uint8Array(analyzer.frequencyBinCount);

    source.connect(analyzer);
    analyzer.connect(gain);
    gain.connect(context.destination);

    window.QuartzAudio = {

        fftSize: () => {
            return analyzer.frequencyBinCount;
        },

        fft: () => {
            analyzer.getByteFrequencyData(buffer);
            return buffer;
        },

        setVolume: (vol) => {
            initialize();
            gain.gain.setTargetAtTime(vol * vol, context.currentTime + 0.2, 0.5);
        },

        analyzer,
        audio
    };
});