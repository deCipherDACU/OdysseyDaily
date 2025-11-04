'use client';

import { useState, useEffect } from 'react';

type FireflyStyle = React.CSSProperties & {
  className: string;
};

interface FirefliesProps {
    count: number;
    layer: 'background' | 'midground' | 'foreground';
}

export const Fireflies: React.FC<FirefliesProps> = ({ count, layer }) => {
  const [fireflies, setFireflies] = useState<FireflyStyle[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const generateFireflies = () => {
        const newFireflies: FireflyStyle[] = [];
        for (let i = 0; i < count; i++) {
          let className = 'firefly';
          const rand = Math.random();

          // Add size variations based on layer
          if (layer === 'background') {
             if (rand > 0.8) className += ' small'; else className += ' tiny';
          } else if (layer === 'midground') {
             if (rand > 0.7) className += ' large'; else className += ' small';
          } else {
             if (rand > 0.6) className += ' xl'; else className += ' large';
          }
          
          // Add themed variations
          const themeRand = Math.random();
          if (themeRand > 0.98) className += ' xp-glow';
          else if (themeRand > 0.96) className += ' achievement-glow';
          else if (themeRand > 0.94) className += ' boost-glow';
          
          className += ` ${layer}-layer`;

          // Add blink/pulse variants
          const specialAnimRand = Math.random();
          if (specialAnimRand > 0.95) className += ' fast-blink';
          else if (specialAnimRand > 0.90) className += ' slow-blink';
          else if (specialAnimRand > 0.85) className += ' pulse';


          newFireflies.push({
            '--x-start': `${Math.random() * 100}vw`,
            '--x-end': `${Math.random() * 100}vw`,
            '--scale-start': `${0.2 + Math.random() * 0.4}`,
            '--scale-end': `${0.2 + Math.random() * 0.4}`,
            '--opacity-start': `${0.1 + Math.random() * 0.5}`,
            '--opacity-end': `${0.1 + Math.random() * 0.5}`,
            animationDuration: `${8 + Math.random() * 12}s`,
            animationDelay: `${Math.random() * -15}s`,
            className: className,
          } as FireflyStyle);
        }
        setFireflies(newFireflies);
      };
      generateFireflies();
    }
  }, [isClient, count, layer]);

  if (!isClient) {
    return null;
  }

  const containerClass = `firefly-${layer}`;

  return (
    <div className={containerClass}>
      {fireflies.map((style, i) => (
        <div key={i} className={style.className} style={style} />
      ))}
    </div>
  );
};
