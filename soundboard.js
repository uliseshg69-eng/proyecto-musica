class Soundboard {
    constructor() {
        this.sounds = [];
        this.initializeElements();
        this.attachEventListeners();
        this.generateDefaultSounds();
    }

    initializeElements() {
        this.soundboardGrid = document.getElementById('soundboard');
        this.soundList = document.getElementById('soundList');
        this.mainVolumeSlider = document.getElementById('mainVolume');
        this.mainReverbSlider = document.getElementById('mainReverb');
        this.clearAllBtn = document.getElementById('clearAllBtn');
        this.mainVolumeDisplay = document.getElementById('mainVolumeDisplay');
        this.mainReverbDisplay = document.getElementById('mainReverbDisplay');
    }

    attachEventListeners() {
        this.mainVolumeSlider.addEventListener('input', (e) => {
            soundGenerator.setVolume(e.target.value);
            this.mainVolumeDisplay.textContent = e.target.value + '%';
        });

        this.mainReverbSlider.addEventListener('input', (e) => {
            soundGenerator.setReverb(e.target.value);
            this.mainReverbDisplay.textContent = e.target.value + '%';
        });

        this.clearAllBtn.addEventListener('click', () => this.clearAllSounds());
    }

    generateDefaultSounds() {
        const defaultSounds = [
            { instrument: 'piano', frequency: 440, name: 'Piano', duration: 1 },
            { instrument: 'guitar', frequency: 330, name: 'Guitarra', duration: 0.8 },
            { instrument: 'violin', frequency: 523, name: 'Violin', duration: 1 },
            { instrument: 'flute', frequency: 587, name: 'Flauta', duration: 1 },
            { instrument: 'trumpet', frequency: 659, name: 'Trompeta', duration: 0.6 },
            { instrument: 'soprano', frequency: 784, vowel: 'a', name: 'Soprano', duration: 1 },
            { instrument: 'baritone', frequency: 220, vowel: 'a', name: 'Baritono', duration: 1 },
            { instrument: 'robot', frequency: 440, name: 'Robot', duration: 1 },
            { instrument: 'laser', frequency: 1000, name: 'Laser', duration: 0.3 },
            { instrument: 'whoosh', frequency: 0, name: 'Whoosh', duration: 0.5 },
            { instrument: 'bell', frequency: 440, name: 'Campana', duration: 2 },
            { instrument: 'pop', frequency: 0, name: 'Pop', duration: 0.15 }
        ];

        defaultSounds.forEach((soundConfig, index) => {
            this.addSound(soundConfig, index);
        });

        this.renderSoundboard();
        this.renderSoundConfigs();
    }

    addSound(soundConfig, index) {
        const sound = {
            id: index,
            instrument: soundConfig.instrument,
            frequency: soundConfig.frequency || 440,
            vowel: soundConfig.vowel || 'a',
            name: soundConfig.name,
            duration: soundConfig.duration || 1,
            volume: 100,
            isActive: false
        };
        this.sounds.push(sound);
    }

    playSound(soundIndex) {
        const sound = this.sounds[soundIndex];
        if (!sound) return;

        sound.isActive = true;

        if (sound.instrument === 'whoosh' || sound.instrument === 'pop') {
            soundGenerator.playSound(sound.instrument, 0, sound.duration);
        } else if (sound.instrument === 'soprano' || sound.instrument === 'baritone') {
            soundGenerator.playSound(sound.instrument, sound.frequency, sound.duration, sound.vowel);
        } else {
            soundGenerator.playSound(sound.instrument, sound.frequency, sound.duration);
        }

        this.updateSoundboardButton(soundIndex);

        setTimeout(() => {
            sound.isActive = false;
            this.updateSoundboardButton(soundIndex);
        }, sound.duration * 1000);
    }

    updateSoundboardButton(soundIndex) {
        const buttons = this.soundboardGrid.querySelectorAll('.sound-btn');
        if (buttons[soundIndex]) {
            const sound = this.sounds[soundIndex];
            if (sound.isActive) {
                buttons[soundIndex].classList.add('active');
            } else {
                buttons[soundIndex].classList.remove('active');
            }
        }
    }

    renderSoundboard() {
        this.soundboardGrid.innerHTML = '';
        this.sounds.forEach((sound, index) => {
            const button = document.createElement('button');
            button.className = 'sound-btn';
            button.textContent = sound.name;
            button.addEventListener('click', () => this.playSound(index));
            this.soundboardGrid.appendChild(button);
        });
    }

    renderSoundConfigs() {
        this.soundList.innerHTML = '';
        this.sounds.forEach((sound, index) => {
            const config = document.createElement('div');
            config.className = 'sound-config';
            config.innerHTML = `
                <div class="config-title">${sound.name} <button class="delete-btn" onclick="soundboard.deleteSound(${index})">X</button></div>
                ${sound.instrument !== 'whoosh' && sound.instrument !== 'pop' ? `
                    <div class="config-row">
                        <label>Freq:</label>
                        <input type="range" min="50" max="2000" value="${sound.frequency}" 
                               onchange="soundboard.updateSoundFrequency(${index}, this.value)">
                        <span>${sound.frequency}Hz</span>
                    </div>
                ` : ''}
                ${sound.instrument === 'soprano' || sound.instrument === 'baritone' ? `
                    <div class="config-row">
                        <label>Vocal:</label>
                        <select onchange="soundboard.updateSoundVowel(${index}, this.value)">
                            <option value="a" ${sound.vowel === 'a' ? 'selected' : ''}>A</option>
                            <option value="e" ${sound.vowel === 'e' ? 'selected' : ''}>E</option>
                            <option value="i" ${sound.vowel === 'i' ? 'selected' : ''}>I</option>
                            <option value="o" ${sound.vowel === 'o' ? 'selected' : ''}>O</option>
                            <option value="u" ${sound.vowel === 'u' ? 'selected' : ''}>U</option>
                        </select>
                    </div>
                ` : ''}
                <div class="config-row">
                    <label>Dur:</label>
                    <input type="range" min="0.1" max="3" step="0.1" value="${sound.duration}" 
                           onchange="soundboard.updateSoundDuration(${index}, this.value)">
                    <span>${sound.duration}s</span>
                </div>
            `;
            this.soundList.appendChild(config);
        });
    }

    updateSoundFrequency(index, frequency) {
        this.sounds[index].frequency = parseFloat(frequency);
        this.renderSoundConfigs();
    }

    updateSoundVowel(index, vowel) {
        this.sounds[index].vowel = vowel;
    }

    updateSoundDuration(index, duration) {
        this.sounds[index].duration = parseFloat(duration);
    }

    deleteSound(index) {
        this.sounds.splice(index, 1);
        this.renderSoundboard();
        this.renderSoundConfigs();
    }

    clearAllSounds() {
        if (confirm('¿Limpiar todos?')) {
            soundGenerator.stop();
            this.sounds = [];
            this.renderSoundboard();
            this.renderSoundConfigs();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const soundboard = new Soundboard();
    window.soundboard = soundboard;
    soundGenerator.setVolume(50);
    soundGenerator.setReverb(20);
});