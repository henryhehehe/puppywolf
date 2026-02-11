// Web Audio API Synthesizer — Cute Puppy-themed sound effects
class AudioService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private getContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.ctx;
  }

  get muted() { return this.isMuted; }
  toggleMute() { this.isMuted = !this.isMuted; return this.isMuted; }

  private playTone(freq: number, type: OscillatorType, duration: number, vol: number = 0.1) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  // ── Cute puppy yip (short high pitch) ──
  playPop() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    const now = ctx.currentTime;
    // Quick double yip
    [880, 1100].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.06);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.2, now + i * 0.06 + 0.04);
      gain.gain.setValueAtTime(0.08, now + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.08);
    });
  }

  // ── Sad whimper ──
  playError() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, now);
    osc.frequency.exponentialRampToValueAtTime(250, now + 0.3);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  // ── Happy bark celebration (correct word / win) ──
  playSuccess() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    const now = ctx.currentTime;
    // Ascending happy yips + final celebratory note
    [660, 880, 1100, 1320, 1760].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.1, now + i * 0.08 + 0.05);
      gain.gain.setValueAtTime(0.07, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.15);
    });
  }

  // ── Soft tick ──
  playTick() {
    this.playTone(1000, 'sine', 0.025, 0.02);
  }

  // ── Warning growl ──
  playWarning() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.linearRampToValueAtTime(100, now + 0.3);
    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  }

  // ── Cute puppy howl for werewolf phases ──
  playHowl() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    const now = ctx.currentTime;
    // Two-tone puppy howl: low then rising
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(220, now);
    osc1.frequency.exponentialRampToValueAtTime(380, now + 0.4);
    osc1.frequency.exponentialRampToValueAtTime(200, now + 0.8);
    gain1.gain.setValueAtTime(0.06, now);
    gain1.gain.setValueAtTime(0.06, now + 0.3);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.9);
    // Add shimmer
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(440, now + 0.1);
    osc2.frequency.exponentialRampToValueAtTime(760, now + 0.5);
    osc2.frequency.exponentialRampToValueAtTime(400, now + 0.9);
    gain2.gain.setValueAtTime(0.025, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.9);
  }

  // ── Magical reveal chime (role reveal) ──
  playReveal() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    const now = ctx.currentTime;
    // Twinkling ascending notes like magic dust
    [523, 659, 784, 1047, 1319].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.06, now + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.35);
    });
  }

  // ── Sad puppy whine (defeat) ──
  playDefeat() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    const now = ctx.currentTime;
    // Descending whimper
    [500, 420, 340, 280].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.18);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.85, now + i * 0.18 + 0.15);
      gain.gain.setValueAtTime(0.07, now + i * 0.18);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.18 + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.18);
      osc.stop(now + i * 0.18 + 0.3);
    });
  }

  // ── Quick nose boop (button click) ──
  playClick() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.04);
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  // ── Paw stamp vote sound ──
  playVote() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    const now = ctx.currentTime;
    // Firm paw thud + rising confirm
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(200, now);
    gain1.gain.setValueAtTime(0.1, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.08);
    // Confirm chime
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(800, now + 0.06);
    osc2.frequency.exponentialRampToValueAtTime(1200, now + 0.12);
    gain2.gain.setValueAtTime(0.06, now + 0.06);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.06);
    osc2.stop(now + 0.18);
  }

  // ── Token given sound (Mayor assigns a token to a player) ──
  playTokenGiven() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    const now = ctx.currentTime;
    // Playful two-note chime like a squeaky toy
    [700, 1050].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.9, now + i * 0.08 + 0.1);
      gain.gain.setValueAtTime(0.09, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.15);
    });
  }

  // ── Token received sound (player receives YES/NO etc.) ──
  playTokenReceived() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    const now = ctx.currentTime;
    // Squeaky bounce
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.05);
    osc.frequency.exponentialRampToValueAtTime(750, now + 0.12);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  // ── Guess submitted (little bark) ──
  playGuess() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    const now = ctx.currentTime;
    // Short playful bark
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.04);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.08);
    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  // ── New guess from another player (soft notification) ──
  playNewGuess() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.06);
    gain.gain.setValueAtTime(0.03, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  // ── Avatar hover (tiny playful squeak) ──
  playHoverSqueak() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1800, now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.03);
    gain.gain.setValueAtTime(0.02, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  // ── Breed-specific selection bark/yip ──
  // Each breed family gets a unique sound character
  playBreedSelect(earType: 'floppy' | 'pointy' | 'bat' | 'round', hasTongue: boolean) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    const now = ctx.currentTime;

    if (earType === 'floppy') {
      // Floppy ears → deep friendly "boof" + waggy overtone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.12);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.18);
      // Friendly overtone
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(560, now + 0.06);
      osc2.frequency.exponentialRampToValueAtTime(700, now + 0.1);
      gain2.gain.setValueAtTime(0.04, now + 0.06);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      osc2.connect(gain2); gain2.connect(ctx.destination);
      osc2.start(now + 0.06); osc2.stop(now + 0.16);
    } else if (earType === 'pointy') {
      // Pointy ears → alert sharp "yip yip!" (two quick high notes)
      [900, 1200].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.07);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.3, now + i * 0.07 + 0.03);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.9, now + i * 0.07 + 0.07);
        gain.gain.setValueAtTime(0.08, now + i * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.09);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(now + i * 0.07); osc.stop(now + i * 0.07 + 0.09);
      });
    } else if (earType === 'bat') {
      // Bat ears → snorty little "pff-squeak" (french bulldog style)
      // Low snort
      const noise = ctx.createOscillator();
      const noiseGain = ctx.createGain();
      noise.type = 'sawtooth';
      noise.frequency.setValueAtTime(150, now);
      noise.frequency.exponentialRampToValueAtTime(100, now + 0.06);
      noiseGain.gain.setValueAtTime(0.04, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      noise.connect(noiseGain); noiseGain.connect(ctx.destination);
      noise.start(now); noise.stop(now + 0.08);
      // High squeak after
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, now + 0.07);
      osc.frequency.exponentialRampToValueAtTime(1800, now + 0.1);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
      gain.gain.setValueAtTime(0.06, now + 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now + 0.07); osc.stop(now + 0.17);
    } else {
      // Round/poofy ears → playful bouncy "boing boing" (poodle)
      [600, 800, 1000].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.06);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.7, now + i * 0.06 + 0.08);
        gain.gain.setValueAtTime(0.07, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.12);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(now + i * 0.06); osc.stop(now + i * 0.06 + 0.12);
      });
    }

    // If tongue is out, add a little panting "heh" after
    if (hasTongue) {
      const pant = ctx.createOscillator();
      const pantGain = ctx.createGain();
      pant.type = 'sine';
      pant.frequency.setValueAtTime(2200, now + 0.18);
      pant.frequency.exponentialRampToValueAtTime(1800, now + 0.22);
      pantGain.gain.setValueAtTime(0.02, now + 0.18);
      pantGain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
      pant.connect(pantGain); pantGain.connect(ctx.destination);
      pant.start(now + 0.18); pant.stop(now + 0.24);
    }
  }

  // ── Dramatic tension drum (voting phase) ──
  playDramaticDrum() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    const now = ctx.currentTime;
    // Deep dramatic thud
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.2);
    // Second lighter beat
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(60, now + 0.3);
    osc2.frequency.exponentialRampToValueAtTime(35, now + 0.4);
    gain2.gain.setValueAtTime(0.06, now + 0.3);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc2.connect(gain2); gain2.connect(ctx.destination);
    osc2.start(now + 0.3); osc2.stop(now + 0.45);
  }

  // ── Word chosen by mayor (magical sparkle) ──
  playWordChosen() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    const now = ctx.currentTime;
    [880, 1175, 1397, 1760].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.05, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.25);
    });
  }
}

export const audioService = new AudioService();
