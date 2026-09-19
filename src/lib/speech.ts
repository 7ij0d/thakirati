// Speech-to-Text (Arabic) and Voice Memo Recorder

export class SpeechHelper {
  public static isSpeechRecognitionSupported(): boolean {
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  }

  public static createRecognizer(
    onInterim: (text: string) => void,
    onFinal: (text: string) => void,
    onError: (err: string) => void,
    onEnd: () => void
  ) {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'ar-LY'; // Libyan Arabic / Standard Arabic fallback

    recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          onFinal(event.results[i][0].transcript);
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      if (interim) {
        onInterim(interim);
      }
    };

    recognition.onerror = (event: any) => {
      onError(event.error || 'حدث خطأ أثناء التعرف على الصوت');
    };

    recognition.onend = () => {
      onEnd();
    };

    return recognition;
  }
}

// MediaRecorder for standalone voice memos
export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private startTime: number = 0;

  public async start(): Promise<boolean> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioChunks = [];
      this.mediaRecorder = new MediaRecorder(this.stream);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.startTime = Date.now();
      this.mediaRecorder.start();
      return true;
    } catch (err) {
      console.error('Failed to access microphone:', err);
      return false;
    }
  }

  public stop(): Promise<{ audioDataUrl: string; durationSeconds: number }> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        return reject(new Error('Recorder not started'));
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const durationSeconds = Math.max(1, Math.round((Date.now() - this.startTime) / 1000));

        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          // Stop stream tracks to turn off microphone indicator
          this.stream?.getTracks().forEach(track => track.stop());
          resolve({ audioDataUrl: base64, durationSeconds });
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }
}
