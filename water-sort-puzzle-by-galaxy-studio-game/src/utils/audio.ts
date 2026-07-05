/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isMusicMuted: boolean = false;
  private isSoundMuted: boolean = false;
  private bgmInterval: any = null;
  private bgmStarted: boolean = false;
  private bgmGain: GainNode | null = null;
  private nextNoteTime: number = 0.0;
  private currentBeat: number = 0;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMusicMute(muted: boolean) {
    this.isMusicMuted = muted;
    if (muted) {
      this.stopBGM();
    } else {
      this.startBGM();
    }
  }

  public setSoundMute(muted: boolean) {
    this.isSoundMuted = muted;
  }

  public getMusicMute() {
    return this.isMusicMuted;
  }

  public getSoundMute() {
    return this.isSoundMuted;
  }

  // Synthesis Helper Functions for Premium Relaxing Puzzle Game Instruments

  private playAmbientPad(ctx: AudioContext, freqs: number[], time: number, duration: number, volume: number) {
    freqs.forEach((freq) => {
      try {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const filterNode = ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq / 2, time); // warm sub-drone octave

        filterNode.type = 'lowpass';
        filterNode.frequency.setValueAtTime(150, time);

        gainNode.gain.setValueAtTime(0, time);
        gainNode.gain.linearRampToValueAtTime(volume, time + duration * 0.35);
        gainNode.gain.setValueAtTime(volume, time + duration * 0.7);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, time + duration);

        osc.connect(filterNode);
        filterNode.connect(gainNode);
        
        if (this.bgmGain) {
          gainNode.connect(this.bgmGain);
        } else {
          gainNode.connect(ctx.destination);
        }

        osc.start(time);
        osc.stop(time + duration + 0.1);
      } catch (e) {
        console.warn(e);
      }
    });
  }

  private playPianoNote(ctx: AudioContext, freq: number, time: number, duration: number, volume: number) {
    try {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const osc3 = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filterNode = ctx.createBiquadFilter();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, time);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2, time);

      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(freq * 3, time);

      filterNode.type = 'lowpass';
      filterNode.frequency.setValueAtTime(800, time);
      filterNode.frequency.exponentialRampToValueAtTime(250, time + duration);

      gainNode.gain.setValueAtTime(0, time);
      gainNode.gain.linearRampToValueAtTime(volume, time + 0.04);
      gainNode.gain.exponentialRampToValueAtTime(volume * 0.15, time + duration * 0.4);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, time + duration);

      const h2Gain = ctx.createGain(); h2Gain.gain.setValueAtTime(0.22, time);
      const h3Gain = ctx.createGain(); h3Gain.gain.setValueAtTime(0.08, time);

      osc1.connect(gainNode);
      osc2.connect(h2Gain); h2Gain.connect(gainNode);
      osc3.connect(h3Gain); h3Gain.connect(gainNode);

      gainNode.connect(filterNode);
      if (this.bgmGain) {
        filterNode.connect(this.bgmGain);
      } else {
        filterNode.connect(ctx.destination);
      }

      osc1.start(time);
      osc2.start(time);
      osc3.start(time);

      osc1.stop(time + duration + 0.1);
      osc2.stop(time + duration + 0.1);
      osc3.stop(time + duration + 0.1);
    } catch (e) {
      console.warn(e);
    }
  }

  private playMarimbaNote(ctx: AudioContext, freq: number, time: number, volume: number) {
    try {
      const osc = ctx.createOscillator();
      const strikeOsc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filterNode = ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      strikeOsc.type = 'sine';
      strikeOsc.frequency.setValueAtTime(freq * 3.0, time);

      filterNode.type = 'lowpass';
      filterNode.frequency.setValueAtTime(1100, time);

      gainNode.gain.setValueAtTime(0, time);
      gainNode.gain.linearRampToValueAtTime(volume, time + 0.005);
      gainNode.gain.exponentialRampToValueAtTime(volume * 0.04, time + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, time + 0.35);

      const strikeGain = ctx.createGain();
      strikeGain.gain.setValueAtTime(0.35, time);
      strikeGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.035);

      osc.connect(gainNode);
      strikeOsc.connect(strikeGain);
      strikeGain.connect(gainNode);

      gainNode.connect(filterNode);
      if (this.bgmGain) {
        filterNode.connect(this.bgmGain);
      } else {
        filterNode.connect(ctx.destination);
      }

      osc.start(time);
      strikeOsc.start(time);

      osc.stop(time + 0.4);
      strikeOsc.stop(time + 0.1);
    } catch (e) {
      console.warn(e);
    }
  }

  private playBellNote(ctx: AudioContext, freq: number, time: number, volume: number) {
    try {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filterNode = ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      filterNode.type = 'lowpass';
      filterNode.frequency.setValueAtTime(2500, time);

      gainNode.gain.setValueAtTime(0, time);
      gainNode.gain.linearRampToValueAtTime(volume, time + 0.012);
      gainNode.gain.exponentialRampToValueAtTime(volume * 0.1, time + 0.7);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, time + 2.2);

      osc.connect(gainNode);
      gainNode.connect(filterNode);
      if (this.bgmGain) {
        filterNode.connect(this.bgmGain);
      } else {
        filterNode.connect(ctx.destination);
      }

      osc.start(time);
      osc.stop(time + 2.3);
    } catch (e) {
      console.warn(e);
    }
  }

  private scheduleBeat(beat: number, time: number) {
    if (!this.ctx) return;
    
    // Evolving 4-chord progression chords
    const CHORDS_DATA = [
      {
        padFreqs: [130.81, 196.00, 246.94], // C3, G3, B3 (Cmaj9)
        pianoChord: [130.81, 164.81, 196.00, 246.94, 293.66], // C3, E3, G3, B3, D4
        melodies: [329.63, 392.00, 493.88, 523.25, 587.33, 659.25], // E4, G4, B4, C5, D5, E5
        bellNotes: [783.99, 987.77, 1046.50, 1174.66] // G5, B5, C6, D6
      },
      {
        padFreqs: [87.31, 174.61, 261.63], // F2, F3, C4 (Fmaj9)
        pianoChord: [174.61, 220.00, 261.63, 329.63, 392.00], // F3, A3, C4, E4, G4
        melodies: [349.23, 440.00, 523.25, 659.25, 698.46, 783.99], // F4, A4, C5, E5, F5, G5
        bellNotes: [880.00, 1046.50, 1318.51, 1396.91] // A5, C6, E6, F6
      },
      {
        padFreqs: [110.00, 164.81, 220.00], // A2, E3, A3 (Am9)
        pianoChord: [110.00, 130.81, 164.81, 196.00, 220.00], // A2, C3, E3, G3, A3
        melodies: [261.63, 329.63, 392.00, 440.00, 523.25, 587.33], // C4, E4, G4, A4, C5, D5
        bellNotes: [783.99, 880.00, 1046.50, 1174.66] // G5, A5, C6, D6
      },
      {
        padFreqs: [98.00, 146.83, 196.00], // G2, D3, G3 (G13sus / G9)
        pianoChord: [146.83, 196.00, 246.94, 293.66, 349.23], // D3, G3, B3, D4, F4
        melodies: [293.66, 349.23, 392.00, 440.00, 493.88, 587.33], // D4, F4, G4, A4, B4, D5
        bellNotes: [783.99, 880.00, 987.77, 1174.66] // G5, A5, B5, D6
      }
    ];

    const beatsPerChord = 8;
    const currentChordIdx = Math.floor((beat % 32) / beatsPerChord) % CHORDS_DATA.length;
    const chord = CHORDS_DATA[currentChordIdx];

    const relativeBeat = beat % beatsPerChord; // 0 to 7
    const phraseIndex = Math.floor(beat / 32) % 4; // 0 to 3 progressive phrases (A, B, C, D)
    const bgmVol = 0.28; // Beautiful quiet background volume (keeps BGM soft and SFX crisp)
    const beatDuration = 60.0 / 70.0; // 70 BPM (0.857s per beat)

    // 1. Play Ambient Pad at the beginning of each chord cycle (beat 0)
    // Only played in Phrase 1, 2, and 3 to let Phrase 0 remain clean and peaceful!
    if (relativeBeat === 0 && phraseIndex > 0) {
      const padVolume = phraseIndex === 2 ? bgmVol * 0.16 : bgmVol * 0.10;
      this.playAmbientPad(this.ctx, chord.padFreqs, time, beatDuration * 8.0, padVolume);
    }

    // 2. Play soft Piano Chords
    if (relativeBeat === 0) {
      const duration = beatDuration * 7.0;
      chord.pianoChord.forEach((freq, idx) => {
        const strum = idx * 0.025; // elegant humanized arpeggiation delay
        this.playPianoNote(this.ctx!, freq, time + strum, duration, bgmVol * 0.08);
      });
    } else if (relativeBeat === 4 && phraseIndex !== 0) {
      // Add extra mid-chord hits in Phrases 1, 2, 3
      const duration = beatDuration * 3.5;
      chord.pianoChord.forEach((freq, idx) => {
        const strum = idx * 0.02;
        this.playPianoNote(this.ctx!, freq, time + strum, duration, bgmVol * 0.06);
      });
    } else if (relativeBeat === 2 && phraseIndex === 2) {
      // Rhythmic decoration in cascade phrase (Phrase 2)
      const duration = beatDuration * 1.5;
      const lightChord = [chord.pianoChord[1], chord.pianoChord[2], chord.pianoChord[3]];
      lightChord.forEach((freq, idx) => {
        this.playPianoNote(this.ctx!, freq, time + idx * 0.02, duration, bgmVol * 0.04);
      });
    }

    // 3. Play gentle Marimba notes
    if (phraseIndex === 0) {
      // Phrase 0: Minimal & quiet introduction
      if (relativeBeat === 1 || relativeBeat === 5) {
        // Only play on beats 1 and 5
        const freq = chord.melodies[relativeBeat % chord.melodies.length];
        this.playMarimbaNote(this.ctx, freq, time, bgmVol * 0.05);
      }
    } else if (phraseIndex === 1 || phraseIndex === 3) {
      // Phrase 1 & 3: Standard relaxing melody
      if (relativeBeat === 1 || relativeBeat === 3 || relativeBeat === 5 || relativeBeat === 7) {
        const melodiesIndices = [1, 3, 5, 2];
        const melIdx = melodiesIndices[relativeBeat % melodiesIndices.length] % chord.melodies.length;
        const freq = chord.melodies[melIdx];
        this.playMarimbaNote(this.ctx, freq, time, bgmVol * 0.07);
      }
    } else if (phraseIndex === 2) {
      // Phrase 2: High-fidelity "Liquid Flow Cascade" with sparkling off-beat notes!
      if (relativeBeat === 1 || relativeBeat === 3 || relativeBeat === 5 || relativeBeat === 7) {
        const melIdx = (relativeBeat + 1) % chord.melodies.length;
        const freq1 = chord.melodies[melIdx];
        const freq2 = chord.melodies[(melIdx + 2) % chord.melodies.length];
        
        // On the beat
        this.playMarimbaNote(this.ctx, freq1, time, bgmVol * 0.08);
        
        // Off the half-beat (creates a flowing water drop trickle effect!)
        const halfBeatTime = time + beatDuration * 0.5;
        this.playMarimbaNote(this.ctx, freq2, halfBeatTime, bgmVol * 0.05);
      }
    }

    // 4. Play light crystalline Bell notes
    if (phraseIndex === 2) {
      // Celestial bells play on beat 2 and 6 in Phrase 2
      if (relativeBeat === 2 || relativeBeat === 6) {
        const freq = chord.bellNotes[Math.floor(Math.random() * chord.bellNotes.length)];
        this.playBellNote(this.ctx, freq, time, bgmVol * 0.06);
      }
    } else if (phraseIndex === 1 || phraseIndex === 3) {
      // Sparser bells in Phrase 1 and 3 (only beat 3, 50% chance)
      if (relativeBeat === 3 && Math.random() < 0.6) {
        const freq = chord.bellNotes[0];
        this.playBellNote(this.ctx, freq, time, bgmVol * 0.04);
      }
    }
  }

  public startBGM() {
    if (this.isMusicMuted) {
      this.stopBGM();
      return;
    }
    try {
      this.init();
      if (!this.ctx) return;
      
      if (!this.bgmGain) {
        this.bgmGain = this.ctx.createGain();
        this.bgmGain.connect(this.ctx.destination);
      }
      
      // Keep background music volume quiet, ambient, and satisfying
      this.bgmGain.gain.setValueAtTime(0.28, this.ctx.currentTime);

      if (this.bgmStarted) {
        if (this.ctx.state === 'suspended') {
          this.ctx.resume().then(() => {
            if (this.ctx) {
              this.nextNoteTime = this.ctx.currentTime + 0.1;
            }
          }).catch((e) => console.warn(e));
        }
        return;
      }
      this.bgmStarted = true;

      this.nextNoteTime = this.ctx.currentTime + 0.1;
      this.currentBeat = 0;

      const lookahead = 0.25; // 250ms lookahead
      const scheduleDelay = 100; // run scheduler every 100ms

      const scheduler = () => {
        if (!this.ctx || this.isMusicMuted || !this.bgmStarted) return;
        try {
          if (this.ctx.state === 'suspended') {
            this.ctx.resume().catch((e) => console.warn(e));
          }
          while (this.nextNoteTime < this.ctx.currentTime + lookahead) {
            this.scheduleBeat(this.currentBeat, this.nextNoteTime);
            // Advance to next beat at a relaxing 70 BPM (0.857 seconds per beat)
            const beatDuration = 60.0 / 70.0;
            this.nextNoteTime += beatDuration;
            this.currentBeat = (this.currentBeat + 1) % 128; // Full 128-beat progressive cycle!
          }
        } catch (e) {
          console.warn('BGM scheduling error', e);
        }
      };

      this.bgmInterval = setInterval(scheduler, scheduleDelay);
    } catch (err) {
      console.warn('Failed to start BGM engine', err);
    }
  }

  public stopBGM() {
    this.bgmStarted = false;
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
    if (this.bgmGain) {
      try {
        if (this.ctx) {
          this.bgmGain.gain.setValueAtTime(0, this.ctx.currentTime);
        } else {
          this.bgmGain.gain.value = 0;
        }
      } catch (err) {
        this.bgmGain.gain.value = 0;
      }
    }
  }

  public playSelect() {
    if (this.isSoundMuted) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const osc3 = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Crystalline triple-oscillator glass tap resonance structure
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1400, now);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(2250, now);

      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(3200, now); // crystalline peak strike frequency

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800, now);
      filter.Q.setValueAtTime(3.0, now);

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.18, now + 0.001); // ultra fast attack
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

      osc1.connect(filter);
      osc2.connect(filter);
      osc3.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc3.start(now);

      osc1.stop(now + 0.12);
      osc2.stop(now + 0.12);
      osc3.stop(now + 0.12);
    } catch (e) {
      console.warn('Audio playSelect error', e);
    }
  }

  public playInvalid() {
    if (this.isSoundMuted) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Soft, low frequency wooden/bottle knock tap instead of electronic buzzer
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(140, now + 0.12);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {
      console.warn('Audio playInvalid error', e);
    }
  }

  // Realistic high-quality water flowing sound with fill-up resonance simulation
  public startPour() {
    if (this.isSoundMuted) return null;
    try {
      this.init();
      if (!this.ctx) return null;

      const now = this.ctx.currentTime;

      // 1. High frequency sparkling drops
      const bubbleInterval = setInterval(() => {
        if (!this.ctx || this.isSoundMuted) return;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        const f = this.ctx.createBiquadFilter();

        o.type = 'sine';
        const startFreq = 850 + Math.random() * 350;
        o.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
        o.frequency.exponentialRampToValueAtTime(startFreq * 1.7, this.ctx.currentTime + 0.08);

        f.type = 'lowpass';
        f.frequency.setValueAtTime(1400, this.ctx.currentTime);

        g.gain.setValueAtTime(0.035, this.ctx.currentTime); // Soft, elegant bubble volume
        g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.08);

        o.connect(f);
        f.connect(g);
        g.connect(this.ctx.destination);

        o.start();
        o.stop(this.ctx.currentTime + 0.09);
      }, 55);

      // 2. Continuous flowing water stream using bandpass filtered white noise
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(420, now); // Warm, hollow resonance frequency
      noiseFilter.Q.setValueAtTime(1.8, now);

      // Emulate acoustic chamber rising pitch as the bottle fills up!
      noiseFilter.frequency.exponentialRampToValueAtTime(680, now + 1.2);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0, now);
      noiseGain.gain.linearRampToValueAtTime(0.08, now + 0.04); // Fast, soft fade-in

      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      noiseSource.start(now);

      return {
        stop: () => {
          clearInterval(bubbleInterval);
          try {
            if (this.ctx) {
              const currentNow = this.ctx.currentTime;
              noiseGain.gain.cancelScheduledValues(currentNow);
              noiseGain.gain.setValueAtTime(noiseGain.gain.value, currentNow);
              noiseGain.gain.exponentialRampToValueAtTime(0.0001, currentNow + 0.05); // Clean instant fade-out

              setTimeout(() => {
                try {
                  noiseSource.stop();
                } catch (e) {}
              }, 60);
            }
          } catch (err) {}
        }
      };
    } catch (e) {
      console.warn('Audio startPour error', e);
      return null;
    }
  }

  public playWin() {
    if (this.isSoundMuted) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      // Beautiful sparkling pentatonic ascensions for dynamic winning satisfaction
      const notes = [329.63, 392.00, 523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; // E4, G4, C5, E5, G5, C6, E6, G6
      
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Use standard triangles with high-pitched sine layers to make it sound energetic
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08); // Speed up for snappier feedback
        
        gain.gain.setValueAtTime(0, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.08 + 0.04); // Significant volume boost
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.7);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.75);
      });
    } catch (e) {
      console.warn('Audio playWin error', e);
    }
  }

  public playUndo() {
    if (this.isSoundMuted) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.2);

      gain.gain.setValueAtTime(0.2, now); // Volume boost
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {
      console.warn('Audio playUndo error', e);
    }
  }

  public playClick() {
    if (this.isSoundMuted) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(620, now);
      gain.gain.setValueAtTime(0.18, now); // Louder snap clicks
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch (e) {
      console.warn('Audio playClick error', e);
    }
  }

  public playCelebration() {
    if (this.isSoundMuted) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      
      // Beautiful harmonic progression scales sounding like a jackpot / magical cascade - much louder!
      const chimeNotes = [261.63, 311.13, 329.63, 392.00, 440.00, 523.25, 587.33, 622.25, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51, 1567.98, 1760.00];
      chimeNotes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const noteTime = now + idx * 0.04; // Super fast sparkle cascade

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteTime);

        // Gentle sweeping frequency to make it sound premium and interactive
        osc.frequency.exponentialRampToValueAtTime(freq * 1.08, noteTime + 0.07);

        gain.gain.setValueAtTime(0, noteTime);
        gain.gain.linearRampToValueAtTime(0.24, noteTime + 0.025); // Louder sparkle!
        gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(noteTime);
        osc.stop(noteTime + 0.5);
      });

      // Quick coin plonk sounds to simulate dropping coins - loud & metallic!
      const coinOffsets = [0.0, 0.06, 0.12, 0.18, 0.24, 0.30, 0.36, 0.42, 0.48, 0.54, 0.60];
      coinOffsets.forEach((delay) => {
        if (!this.ctx) return;
        const time = now + delay;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        const startFreq = 1050 + Math.random() * 600;
        osc.frequency.setValueAtTime(startFreq, time);
        osc.frequency.setValueAtTime(startFreq * 1.45, time + 0.03);

        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.2, time + 0.015); // Loud coin drops!
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(time);
        osc.stop(time + 0.25);
      });

      // Warm retro swell bass fanfare - much more prominent!
      const swellOsc1 = this.ctx.createOscillator();
      const swellOsc2 = this.ctx.createOscillator();
      const swellGain = this.ctx.createGain();

      swellOsc1.type = 'triangle';
      swellOsc1.frequency.setValueAtTime(261.63, now); // C4
      swellOsc1.frequency.linearRampToValueAtTime(523.25, now + 0.45); // Slide up to C5

      swellOsc2.type = 'triangle';
      swellOsc2.frequency.setValueAtTime(329.63, now); // E4
      swellOsc2.frequency.linearRampToValueAtTime(659.25, now + 0.45); // Slide up to E5

      swellGain.gain.setValueAtTime(0.22, now);
      swellGain.gain.linearRampToValueAtTime(0.32, now + 0.15);
      swellGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);

      swellOsc1.connect(swellGain);
      swellOsc2.connect(swellGain);
      swellGain.connect(this.ctx.destination);

      swellOsc1.start(now);
      swellOsc1.stop(now + 0.7);
      swellOsc2.start(now);
      swellOsc2.stop(now + 0.7);

    } catch (e) {
      console.warn('Audio playCelebration error', e);
    }
  }
}

export const audio = new AudioEngine();
