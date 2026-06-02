// Aplicación principal del generador de música

class MusicGenerator {
    constructor() {
        this.currentInstrument = 'piano';
        this.currentVowel = 'a';
        this.currentOctave = 4;
        this.tempo = 120;
        this.isPlaying = false;
        this.sequence = [];
        this.activeOscillators = [];
        this.noteDuration = 0.5;
        
        this.initializeElements();
        this.attachEventListeners();
        this.createSequencer();
    }

    initializeElements() {
        this.instrumentSelect = document.getElementById('instrument');
        this.vowelSelector = document.getElementById('vowelSelector');
        this.vowelSelect = document.getElementById('vowel');
        this.octaveSlider = document.getElementById('octave');
        this.octaveDisplay = document.getElementById('octaveDisplay');
        this.tempoSlider = document.getElementById('tempo');
        this.tempoDisplay = document.getElementById('tempoDisplay');
        this.volumeSlider = document.getElementById('volume');
        this.volumeDisplay = document.getElementById('volumeDisplay');
        this.reverbSlider = document.getElementById('reverb');
        this.reverbDisplay = document.getElementById('reverbDisplay');
        this.delaySlider = document.getElementById('delay');
        this.delayDisplay = document.getElementById('delayDisplay');
        this.durationSlider = document.getElementById('duration');
        this.durationDisplay = document.getElementById('durationDisplay');
        
        this.playBtn = document.getElementById('playBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.clearBtn = document.getElementById('clearBtn');
        
        this.sequencerGrid = document.getElementById('sequencerGrid');
        this.keyButtons = document.querySelectorAll('.key');
    }

    attachEventListeners() {
        // Selector de instrumento
        this.instrumentSelect.addEventListener('change', (e) => {
            this.currentInstrument = e.target.value;
            
            // Mostrar selector de vocales solo para voces
            const isVoice = ['soprano', 'baritone'].includes(this.currentInstrument);
            this.vowelSelector.style.display = isVoice ? 'flex' : 'none';
            
            // Deshabilitar octava para efectos de sonido
            const isEffect = ['laser', 'whoosh', 'bell', 'pop'].includes(this.currentInstrument);
            this.octaveSlider.disabled = isEffect;
        });

        // Selector de vocal
        this.vowelSelect.addEventListener('change', (e) => {
            this.currentVowel = e.target.value;
        });

        // Control de octava
        this.octaveSlider.addEventListener('input', (e) => {
            this.currentOctave = parseInt(e.target.value);
            this.octaveDisplay.textContent = this.currentOctave;
        });

        // Control de tempo
        this.tempoSlider.addEventListener('input', (e) => {
            this.tempo = parseInt(e.target.value);
            this.tempoDisplay.textContent = this.tempo;
        });

        // Control de volumen
        this.volumeSlider.addEventListener('input', (e) => {
            soundGenerator.setVolume(e.target.value);
            this.volumeDisplay.textContent = e.target.value + '%';
        });

        // Control de reverb
        this.reverbSlider.addEventListener('input', (e) => {
            soundGenerator.setReverb(e.target.value);
            this.reverbDisplay.textContent = e.target.value + '%';
        });

        // Control de delay
        this.delaySlider.addEventListener('input', (e) => {
            soundGenerator.setDelay(e.target.value);
            this.delayDisplay.textContent = e.target.value + '%';
        });

        // Control de duración
        this.durationSlider.addEventListener('input', (e) => {
            this.noteDuration = parseFloat(e.target.value);
            this.durationDisplay.textContent = this.noteDuration.toFixed(1);
        });

        // Botones de control
        this.playBtn.addEventListener('click', () => this.playSequence());
        this.stopBtn.addEventListener('click', () => this.stopSequence());
        this.clearBtn.addEventListener('click', () => this.clearSequence());

        // Teclado
        this.keyButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const frequency = parseFloat(e.target.dataset.freq);
                const baseFreq = frequency * Math.pow(2, this.currentOctave - 4);
                this.playNote(baseFreq, this.noteDuration);
                this.showKeyPress(e.target);
            });

            // Teclado del computador
            button.addEventListener('mousedown', () => button.classList.add('active'));
            button.addEventListener('mouseup', () => button.classList.remove('active'));
            button.addEventListener('mouseleave', () => button.classList.remove('active'));
        });

        // Teclas del teclado del computador
        document.addEventListener('keydown', (e) => {
            const keyMap = {
                'c': 'C', 'd': 'D', 'e': 'E', 'f': 'F', 'g': 'G', 'a': 'A', 'b': 'B',
                'w': 'C#', 'r': 'D#', 't': 'F#', 'y': 'G#', 'u': 'A#'
            };

            const note = keyMap[e.key.toLowerCase()];
            if (note) {
                const button = Array.from(this.keyButtons).find(btn => btn.dataset.note === note);
                if (button) {
                    const frequency = parseFloat(button.dataset.freq);
                    const baseFreq = frequency * Math.pow(2, this.currentOctave - 4);
                    this.playNote(baseFreq, this.noteDuration);
                    this.showKeyPress(button);
                }
            }
        });
    }

    playNote(frequency, duration = 0.5) {
        const isVoice = ['soprano', 'baritone'].includes(this.currentInstrument);
        const isEffect = ['laser', 'whoosh', 'bell', 'pop'].includes(this.currentInstrument);
        
        if (isVoice) {
            this.activeOscillators = soundGenerator.playSound(this.currentInstrument, frequency, duration, this.currentVowel);
        } else if (isEffect && this.currentInstrument === 'laser') {
            this.activeOscillators = soundGenerator.playSound(this.currentInstrument, frequency, duration);
        } else {
            this.activeOscillators = soundGenerator.playSound(this.currentInstrument, frequency, duration);
        }
    }

    showKeyPress(button) {
        button.classList.add('active');
        setTimeout(() => button.classList.remove('active'), 100);
    }

    createSequencer() {
        const grid = document.createElement('div');
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = 'repeat(16, 1fr)';
        grid.style.gap = '5px';
        grid.style.marginTop = '10px';

        for (let i = 0; i < 16; i++) {
            const cell = document.createElement('button');
            cell.style.padding = '20px';
            cell.style.background = '#e0e0e0';
            cell.style.border = '2px solid #999';
            cell.style.borderRadius = '5px';
            cell.style.cursor = 'pointer';
            cell.style.transition = 'all 0.2s';
            cell.dataset.step = i;
            cell.dataset.note = 'C';

            cell.addEventListener('click', () => {
                cell.classList.toggle('active');
                if (cell.classList.contains('active')) {
                    cell.style.background = '#667eea';
                    cell.style.borderColor = '#667eea';
                } else {
                    cell.style.background = '#e0e0e0';
                    cell.style.borderColor = '#999';
                }
            });

            grid.appendChild(cell);
            this.sequence.push(cell);
        }

        this.sequencerGrid.appendChild(grid);
    }

    playSequence() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        this.playBtn.disabled = true;

        const stepDuration = (60 / this.tempo) * 1000;
        let step = 0;

        const playStep = () => {
            const activeCells = this.sequence.filter(cell => 
                cell.classList.contains('active') && 
                parseInt(cell.dataset.step) === step
            );

            activeCells.forEach(cell => {
                const note = cell.dataset.note || 'C';
                const frequency = parseFloat(
                    Array.from(this.keyButtons)
                        .find(btn => btn.dataset.note === note)
                        ?.dataset.freq || 261.63
                );
                const baseFreq = frequency * Math.pow(2, this.currentOctave - 4);
                this.playNote(baseFreq, Math.min(stepDuration / 1000 * 0.9, this.noteDuration));
                cell.style.animation = 'pulse 0.1s';
                setTimeout(() => {
                    cell.style.animation = '';
                }, 100);
            });

            step = (step + 1) % 16;

            if (this.isPlaying) {
                setTimeout(playStep, stepDuration);
            }
        };

        playStep();
    }

    stopSequence() {
        this.isPlaying = false;
        this.playBtn.disabled = false;
        soundGenerator.stop();
    }

    clearSequence() {
        this.sequence.forEach(cell => {
            cell.classList.remove('active');
            cell.style.background = '#e0e0e0';
            cell.style.borderColor = '#999';
            cell.dataset.note = 'C';
        });
    }
}

// Función para reproducir demos
function playDemo(effect) {
    const frequency = 440;
    const duration = effect === 'whoosh' ? 0.5 : (effect === 'pop' ? 0.15 : 1);
    
    const isVoice = ['soprano', 'baritone'].includes(effect);
    
    if (isVoice) {
        soundGenerator.playSound(effect, frequency, duration, 'a');
    } else {
        soundGenerator.playSound(effect, frequency, duration);
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const musicGenerator = new MusicGenerator();
    
    // Volumen inicial
    soundGenerator.setVolume(50);
    soundGenerator.setReverb(30);
    soundGenerator.setDelay(0);
    
    // Ocultar selector de vocales al inicio
    document.getElementById('vowelSelector').style.display = 'none';
});