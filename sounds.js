// Sistema de síntesis de sonidos para diferentes instrumentos
// Incluye voces sintetizadas y efectos de sonido

class SoundGenerator {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.audioContext.createGain();
        this.masterGain.connect(this.audioContext.destination);
        this.masterGain.gain.value = 0.5;
        
        // Reverb
        this.dryGain = this.audioContext.createGain();
        this.wetGain = this.audioContext.createGain();
        this.convolver = this.audioContext.createConvolver();
        
        this.dryGain.connect(this.masterGain);
        this.wetGain.connect(this.convolver);
        this.convolver.connect(this.masterGain);
        
        // Delay para efectos
        this.delayNode = this.audioContext.createDelay();
        this.delayFeedback = this.audioContext.createGain();
        this.delayWet = this.audioContext.createGain();
        
        this.delayNode.connect(this.delayFeedback);
        this.delayFeedback.connect(this.delayNode);
        this.delayNode.connect(this.delayWet);
        this.delayWet.connect(this.masterGain);
        
        this.currentOscillators = [];
        this.currentGains = [];
    }

    setVolume(value) {
        this.masterGain.gain.value = value / 100;
    }

    setReverb(value) {
        this.dryGain.gain.value = 1 - (value / 100) * 0.7;
        this.wetGain.gain.value = (value / 100) * 0.5;
    }

    setDelay(value) {
        this.delayNode.delayTime.value = (value / 100) * 0.5;
        this.delayFeedback.gain.value = (value / 100) * 0.4;
        this.delayWet.gain.value = (value / 100) * 0.3;
    }

    // ============ INSTRUMENTOS CLÁSICOS ============

    // Piano - Sonido claro y armónico
    playPiano(frequency, duration = 1) {
        const now = this.audioContext.currentTime;
        const envelope = this.audioContext.createGain();
        
        envelope.connect(this.dryGain);
        
        // Timbre de piano con múltiples osciladores
        const oscillators = [];
        const frequencies = [
            frequency,
            frequency * 2,
            frequency * 3,
            frequency * 0.5
        ];
        const volumes = [0.5, 0.25, 0.15, 0.1];

        frequencies.forEach((freq, idx) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.value = volumes[idx];
            
            osc.connect(gain);
            gain.connect(envelope);
            
            osc.start(now);
            oscillators.push(osc);
            
            osc.stop(now + duration);
        });

        // Envolvente ADSR para piano
        envelope.gain.setValueAtTime(0, now);
        envelope.gain.linearRampToValueAtTime(1, now + 0.05);
        envelope.gain.exponentialRampToValueAtTime(0.3, now + duration * 0.3);
        envelope.gain.exponentialRampToValueAtTime(0.01, now + duration);

        return oscillators;
    }

    // Guitarra - Sonido con armónicos
    playGuitar(frequency, duration = 0.8) {
        const now = this.audioContext.currentTime;
        const envelope = this.audioContext.createGain();
        
        envelope.connect(this.dryGain);
        
        const osc = this.audioContext.createOscillator();
        const filter = this.audioContext.createBiquadFilter();
        
        osc.type = 'triangle';
        osc.frequency.value = frequency;
        filter.type = 'lowpass';
        filter.frequency.value = frequency * 2;
        filter.Q.value = 2;
        
        osc.connect(filter);
        filter.connect(envelope);
        
        osc.start(now);
        
        // Envolvente de guitarra
        envelope.gain.setValueAtTime(1, now);
        envelope.gain.exponentialRampToValueAtTime(0.01, now + duration);
        
        osc.stop(now + duration);
        
        return [osc];
    }

    // Violín - Sonido suave y sostenido
    playViolin(frequency, duration = 1) {
        const now = this.audioContext.currentTime;
        const envelope = this.audioContext.createGain();
        
        envelope.connect(this.dryGain);
        
        const osc = this.audioContext.createOscillator();
        const filter = this.audioContext.createBiquadFilter();
        const lfo = this.audioContext.createOscillator();
        const lfoGain = this.audioContext.createGain();
        
        osc.type = 'sine';
        osc.frequency.value = frequency;
        
        filter.type = 'lowpass';
        filter.frequency.value = frequency * 3;
        filter.Q.value = 5;
        
        lfo.frequency.value = 5; // Vibrato a 5Hz
        lfoGain.gain.value = 20; // Amplitud del vibrato
        
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        
        osc.connect(filter);
        filter.connect(envelope);
        
        osc.start(now);
        lfo.start(now + 0.3); // Vibrato después de 0.3s
        
        // Envolvente suave
        envelope.gain.setValueAtTime(0, now);
        envelope.gain.linearRampToValueAtTime(1, now + 0.2);
        envelope.gain.linearRampToValueAtTime(0.8, now + duration * 0.5);
        envelope.gain.exponentialRampToValueAtTime(0.01, now + duration);
        
        osc.stop(now + duration);
        lfo.stop(now + duration);
        
        return [osc, lfo];
    }

    // Flauta - Sonido suave y fluido
    playFlute(frequency, duration = 1) {
        const now = this.audioContext.currentTime;
        const envelope = this.audioContext.createGain();
        
        envelope.connect(this.dryGain);
        
        const osc = this.audioContext.createOscillator();
        const filter = this.audioContext.createBiquadFilter();
        
        osc.type = 'sine';
        osc.frequency.value = frequency;
        
        filter.type = 'highpass';
        filter.frequency.value = frequency * 0.8;
        
        osc.connect(filter);
        filter.connect(envelope);
        
        osc.start(now);
        
        // Envolvente de flauta
        envelope.gain.setValueAtTime(0.3, now);
        envelope.gain.linearRampToValueAtTime(1, now + 0.1);
        envelope.gain.linearRampToValueAtTime(0.8, now + duration * 0.7);
        envelope.gain.exponentialRampToValueAtTime(0.01, now + duration);
        
        osc.stop(now + duration);
        
        return [osc];
    }

    // Trompeta - Sonido metálico y brillante
    playTrumpet(frequency, duration = 0.6) {
        const now = this.audioContext.currentTime;
        const envelope = this.audioContext.createGain();
        
        envelope.connect(this.dryGain);
        
        const oscillators = [];
        
        // Múltiples osciladores para el timbre metálico
        for (let i = 1; i <= 4; i++) {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.type = i % 2 === 0 ? 'square' : 'sine';
            osc.frequency.value = frequency * i;
            gain.gain.value = 0.5 / i;
            
            osc.connect(gain);
            gain.connect(envelope);
            
            osc.start(now);
            oscillators.push(osc);
            osc.stop(now + duration);
        }
        
        // Envolvente de trompeta
        envelope.gain.setValueAtTime(0.1, now);
        envelope.gain.linearRampToValueAtTime(1, now + 0.05);
        envelope.gain.exponentialRampToValueAtTime(0.01, now + duration);
        
        return oscillators;
    }

    // Batería - Sonidos de percusión
    playDrums(type = 'kick', duration = 0.3) {
        const now = this.audioContext.currentTime;
        const envelope = this.audioContext.createGain();
        
        envelope.connect(this.dryGain);
        
        if (type === 'kick') {
            const osc = this.audioContext.createOscillator();
            const filter = this.audioContext.createBiquadFilter();
            
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(0.01, now + duration);
            
            filter.type = 'lowpass';
            filter.frequency.value = 1000;
            
            osc.connect(filter);
            filter.connect(envelope);
            
            osc.start(now);
            osc.stop(now + duration);
            
            envelope.gain.setValueAtTime(1, now);
            envelope.gain.exponentialRampToValueAtTime(0.01, now + duration);
            
            return [osc];
        } else if (type === 'hihat') {
            // Hi-hat con ruido blanco
            const bufferSize = this.audioContext.sampleRate * duration;
            const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }
            
            const source = this.audioContext.createBufferSource();
            const filter = this.audioContext.createBiquadFilter();
            
            source.buffer = noiseBuffer;
            filter.type = 'highpass';
            filter.frequency.value = 8000;
            
            source.connect(filter);
            filter.connect(envelope);
            
            source.start(now);
            
            envelope.gain.setValueAtTime(0.3, now);
            envelope.gain.exponentialRampToValueAtTime(0.01, now + duration);
            
            return [source];
        } else if (type === 'snare') {
            // Snare con ruido y tono
            const bufferSize = this.audioContext.sampleRate * duration;
            const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }
            
            const source = this.audioContext.createBufferSource();
            const filter = this.audioContext.createBiquadFilter();
            const osc = this.audioContext.createOscillator();
            const oscGain = this.audioContext.createGain();
            
            source.buffer = noiseBuffer;
            filter.type = 'highpass';
            filter.frequency.value = 1000;
            
            osc.frequency.value = 200;
            oscGain.gain.value = 0.5;
            
            source.connect(filter);
            filter.connect(envelope);
            
            osc.connect(oscGain);
            oscGain.connect(envelope);
            
            source.start(now);
            osc.start(now);
            osc.stop(now + duration);
            
            envelope.gain.setValueAtTime(1, now);
            envelope.gain.exponentialRampToValueAtTime(0.01, now + duration);
            
            return [source, osc];
        }
    }

    // ============ VOCES SINTETIZADAS ============

    // Voz de cantante femenina - soprano
    playSopranoVoice(frequency, duration = 1, vowel = 'a') {
        const now = this.audioContext.currentTime;
        const envelope = this.audioContext.createGain();
        
        envelope.connect(this.dryGain);
        
        const osc = this.audioContext.createOscillator();
        const filter = this.audioContext.createBiquadFilter();
        const filter2 = this.audioContext.createBiquadFilter();
        
        osc.type = 'sine';
        osc.frequency.value = frequency;
        
        // Formantes para diferentes vocales
        const formants = {
            'a': { f1: 800, f2: 1600, q1: 5, q2: 4 },
            'e': { f1: 400, f2: 2300, q1: 4, q2: 3 },
            'i': { f1: 300, f2: 2500, q1: 4, q2: 3 },
            'o': { f1: 500, f2: 1000, q1: 5, q2: 4 },
            'u': { f1: 300, f2: 900, q1: 4, q2: 4 }
        };
        
        const vowelFormant = formants[vowel] || formants['a'];
        
        filter.type = 'peaking';
        filter.frequency.value = vowelFormant.f1;
        filter.Q.value = vowelFormant.q1;
        filter.gain.value = 8;
        
        filter2.type = 'peaking';
        filter2.frequency.value = vowelFormant.f2;
        filter2.Q.value = vowelFormant.q2;
        filter2.gain.value = 5;
        
        osc.connect(filter);
        filter.connect(filter2);
        filter2.connect(envelope);
        
        osc.start(now);
        
        // Envolvente vocal
        envelope.gain.setValueAtTime(0, now);
        envelope.gain.linearRampToValueAtTime(0.8, now + 0.05);
        envelope.gain.linearRampToValueAtTime(0.7, now + duration * 0.5);
        envelope.gain.exponentialRampToValueAtTime(0.01, now + duration);
        
        osc.stop(now + duration);
        
        return [osc];
    }

    // Voz de cantante masculino - barítono
    playBaritonVoice(frequency, duration = 1, vowel = 'a') {
        const now = this.audioContext.currentTime;
        const envelope = this.audioContext.createGain();
        
        envelope.connect(this.dryGain);
        
        // Crear timbre más profundo con osciladores múltiples
        const osc1 = this.audioContext.createOscillator();
        const osc2 = this.audioContext.createOscillator();
        const filter = this.audioContext.createBiquadFilter();
        const filter2 = this.audioContext.createBiquadFilter();
        const gain1 = this.audioContext.createGain();
        const gain2 = this.audioContext.createGain();
        
        osc1.type = 'sine';
        osc1.frequency.value = frequency;
        gain1.gain.value = 0.7;
        
        osc2.type = 'sine';
        osc2.frequency.value = frequency * 2;
        gain2.gain.value = 0.3;
        
        // Formantes para voz de barítono
        const formants = {
            'a': { f1: 600, f2: 1200, q1: 4, q2: 3 },
            'e': { f1: 400, f2: 1800, q1: 4, q2: 3 },
            'i': { f1: 250, f2: 2100, q1: 3, q2: 3 },
            'o': { f1: 400, f2: 800, q1: 4, q2: 3 },
            'u': { f1: 300, f2: 750, q1: 4, q2: 3 }
        };
        
        const vowelFormant = formants[vowel] || formants['a'];
        
        filter.type = 'peaking';
        filter.frequency.value = vowelFormant.f1;
        filter.Q.value = vowelFormant.q1;
        filter.gain.value = 7;
        
        filter2.type = 'peaking';
        filter2.frequency.value = vowelFormant.f2;
        filter2.Q.value = vowelFormant.q2;
        filter2.gain.value = 4;
        
        osc1.connect(gain1);
        osc2.connect(gain2);
        gain1.connect(filter);
        gain2.connect(filter);
        filter.connect(filter2);
        filter2.connect(envelope);
        
        osc1.start(now);
        osc2.start(now);
        
        // Envolvente vocal
        envelope.gain.setValueAtTime(0, now);
        envelope.gain.linearRampToValueAtTime(0.9, now + 0.08);
        envelope.gain.linearRampToValueAtTime(0.75, now + duration * 0.5);
        envelope.gain.exponentialRampToValueAtTime(0.01, now + duration);
        
        osc1.stop(now + duration);
        osc2.stop(now + duration);
        
        return [osc1, osc2];
    }

    // Voz de robot/alien
    playRobotVoice(frequency, duration = 1) {
        const now = this.audioContext.currentTime;
        const envelope = this.audioContext.createGain();
        
        envelope.connect(this.dryGain);
        
        const osc = this.audioContext.createOscillator();
        const filter = this.audioContext.createBiquadFilter();
        const lfo = this.audioContext.createOscillator();
        const lfoGain = this.audioContext.createGain();
        
        osc.type = 'square';
        osc.frequency.value = frequency;
        
        filter.type = 'lowpass';
        filter.frequency.value = frequency * 1.5;
        filter.Q.value = 8;
        
        lfo.frequency.value = 12; // Vibrato rápido
        lfoGain.gain.value = 50;
        
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        
        osc.connect(filter);
        filter.connect(envelope);
        
        osc.start(now);
        lfo.start(now);
        
        envelope.gain.setValueAtTime(1, now);
        envelope.gain.exponentialRampToValueAtTime(0.01, now + duration);
        
        osc.stop(now + duration);
        lfo.stop(now + duration);
        
        return [osc, lfo];
    }

    // Voz angelical/pad
    playAngelicVoice(frequency, duration = 2) {
        const now = this.audioContext.currentTime;
        const envelope = this.audioContext.createGain();
        
        envelope.connect(this.dryGain);
        
        const oscillators = [];
        
        // Múltiples osciladores ligeramente desafinados (chorus effect)
        for (let i = 0; i < 3; i++) {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            const detuneAmount = (i - 1) * 2; // -2, 0, +2 cents
            
            osc.type = 'sine';
            osc.frequency.value = frequency;
            osc.detune.value = detuneAmount;
            
            filter.type = 'lowpass';
            filter.frequency.value = frequency * 2.5;
            filter.Q.value = 2;
            
            gain.gain.value = 1 / 3;
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(envelope);
            
            osc.start(now);
            oscillators.push(osc);
            osc.stop(now + duration);
        }
        
        // Envolvente suave
        envelope.gain.setValueAtTime(0, now);
        envelope.gain.linearRampToValueAtTime(0.8, now + 0.3);
        envelope.gain.linearRampToValueAtTime(0.6, now + duration * 0.6);
        envelope.gain.exponentialRampToValueAtTime(0.01, now + duration);
        
        return oscillators;
    }

    // ============ EFECTOS DE SONIDO ============

    // Efecto de ciencia ficción - laser
    playLaserEffect(startFreq = 1000, endFreq = 200, duration = 0.3) {
        const now = this.audioContext.currentTime;
        const envelope = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        envelope.connect(this.dryGain);
        
        const osc = this.audioContext.createOscillator();
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);
        
        filter.type = 'lowpass';
        filter.frequency.value = startFreq;
        
        osc.connect(filter);
        filter.connect(envelope);
        
        osc.start(now);
        
        envelope.gain.setValueAtTime(0.8, now);
        envelope.gain.exponentialRampToValueAtTime(0.01, now + duration);
        
        osc.stop(now + duration);
        
        return [osc];
    }

    // Efecto whoosh (sonido de viento)
    playWhooshEffect(duration = 0.5) {
        const now = this.audioContext.currentTime;
        const envelope = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        envelope.connect(this.dryGain);
        
        // Crear ruido blanco
        const bufferSize = this.audioContext.sampleRate * duration;
        const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        
        const source = this.audioContext.createBufferSource();
        source.buffer = noiseBuffer;
        
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(400, now);
        filter.frequency.exponentialRampToValueAtTime(1200, now + duration * 0.7);
        filter.frequency.exponentialRampToValueAtTime(200, now + duration);
        filter.Q.value = 2;
        
        source.connect(filter);
        filter.connect(envelope);
        
        source.start(now);
        
        envelope.gain.setValueAtTime(0, now);
        envelope.gain.linearRampToValueAtTime(0.7, now + duration * 0.2);
        envelope.gain.exponentialRampToValueAtTime(0.01, now + duration);
        
        return [source];
    }

    // Efecto de campanada
    playBellEffect(frequency = 440, duration = 2) {
        const now = this.audioContext.currentTime;
        const envelope = this.audioContext.createGain();
        
        envelope.connect(this.dryGain);
        
        const oscillators = [];
        
        // Campanadas complejas con múltiples parciales
        const partials = [1, 2.1, 2.56, 3.05, 4.2, 5.84];
        const volumes = [1, 0.8, 0.6, 0.4, 0.3, 0.2];
        
        partials.forEach((partial, idx) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.type = 'sine';
            osc.frequency.value = frequency * partial;
            gain.gain.value = volumes[idx] / partials.length;
            
            osc.connect(gain);
            gain.connect(envelope);
            
            osc.start(now);
            oscillators.push(osc);
            
            osc.stop(now + duration);
        });
        
        // Envolvente larga y decadente
        envelope.gain.setValueAtTime(1, now);
        envelope.gain.exponentialRampToValueAtTime(0.5, now + duration * 0.3);
        envelope.gain.exponentialRampToValueAtTime(0.01, now + duration);
        
        return oscillators;
    }

    // Efecto pop/boing
    playPopEffect(duration = 0.15) {
        const now = this.audioContext.currentTime;
        const envelope = this.audioContext.createGain();
        
        envelope.connect(this.dryGain);
        
        const osc = this.audioContext.createOscillator();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + duration);
        
        osc.connect(envelope);
        
        osc.start(now);
        
        envelope.gain.setValueAtTime(1, now);
        envelope.gain.exponentialRampToValueAtTime(0.01, now + duration);
        
        osc.stop(now + duration);
        
        return [osc];
    }

    // Método genérico para reproducir sonidos
    playSound(instrument, frequency, duration = 1, vowel = 'a') {
        switch(instrument) {
            case 'piano':
                return this.playPiano(frequency, duration);
            case 'guitar':
                return this.playGuitar(frequency, duration);
            case 'violin':
                return this.playViolin(frequency, duration);
            case 'flute':
                return this.playFlute(frequency, duration);
            case 'trumpet':
                return this.playTrumpet(frequency, duration);
            case 'drums':
                return this.playDrums('kick', duration);
            case 'soprano':
                return this.playSopranoVoice(frequency, duration, vowel);
            case 'baritone':
                return this.playBaritonVoice(frequency, duration, vowel);
            case 'robot':
                return this.playRobotVoice(frequency, duration);
            case 'angelic':
                return this.playAngelicVoice(frequency, duration);
            case 'laser':
                return this.playLaserEffect(frequency, 200, duration);
            case 'whoosh':
                return this.playWhooshEffect(duration);
            case 'bell':
                return this.playBellEffect(frequency, duration);
            case 'pop':
                return this.playPopEffect(duration);
            default:
                return this.playPiano(frequency, duration);
        }
    }

    stop() {
        this.currentOscillators.forEach(osc => {
            try {
                osc.stop();
            } catch (e) {
                // El oscilador ya se detuvo
            }
        });
        this.currentOscillators = [];
    }
}

// Crear instancia global del generador de sonidos
const soundGenerator = new SoundGenerator();