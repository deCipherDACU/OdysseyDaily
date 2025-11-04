import { useState, useEffect } from 'react';

export const useSound = (soundUrl: string, volume = 1) => {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audioInstance = new Audio(soundUrl);
    audioInstance.volume = volume;
    setAudio(audioInstance);
  }, [soundUrl, volume]);

  const play = () => {
    if (audio) {
      audio.currentTime = 0;
      audio.play();
    }
  };

  return play;
};
