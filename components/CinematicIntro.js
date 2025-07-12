import React, { useState, useEffect, useRef } from 'react';
import styles from './CinematicIntro.module.css';

// The onFinished prop is a function that will be called when the intro is over.
const CinematicIntro = ({ onFinished }) => {
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadText, setLoadText] = useState('BUFFERING CINEMATIC INTRO...');
  const [phase, setPhase] = useState('loading'); // loading -> video -> logo -> finished
  const videoRef = useRef(null);

  useEffect(() => {
    const videoUrl = './public/videos/MonGPT-Intro.mp4'; 

    const xhr = new XMLHttpRequest();
    xhr.open('GET', videoUrl, true);
    xhr.responseType = 'blob';

    xhr.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100;
        setLoadProgress(percentComplete);
        setLoadText(`DECRYPTING DATA STREAM... ${Math.round(percentComplete)}%`);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const videoBlob = xhr.response;
        const blobUrl = URL.createObjectURL(videoBlob);
        if (videoRef.current) {
            videoRef.current.src = blobUrl;
        }
        setLoadText('SEQUENCE READY. INITIALIZING...');
        setTimeout(() => setPhase('video'), 1500);
      } else {
        console.error('Video load failed with status:', xhr.status);
        setLoadText('ERROR: FAILED TO LOAD ASSETS. SKIPPING INTRO.');
        setTimeout(() => onFinished(), 2000);
      }
    };
    
    xhr.onerror = () => {
        console.error('Video load failed due to a network error.');
        setLoadText('ERROR: FAILED TO LOAD ASSETS. SKIPPING INTRO.');
        setTimeout(() => onFinished(), 2000);
    };

    xhr.send();
  }, [onFinished]);

  useEffect(() => {
    if (phase === 'video' && videoRef.current) {
      videoRef.current.play().catch(error => {
        console.error("Video autoplay failed:", error);
        // If autoplay is blocked by the browser, we skip the intro.
        onFinished();
      });
      videoRef.current.onended = () => {
        setPhase('logo');
      };
    }
  }, [phase, onFinished]);

  // This effect handles the logo animation after the video ends
  useEffect(() => {
    if (phase === 'logo') {
      const timer = setTimeout(() => {
        setPhase('finished');
        onFinished(); // Signal to the parent component that the intro is done
      }, 3000); // Duration of the logo animation + fade out
      return () => clearTimeout(timer);
    }
  }, [phase, onFinished]);

  return (
    <>
      {/* Phase 1: Loading Screen */}
      <div className={`${styles.fullscreenContainer} ${phase === 'loading' ? styles.visible : ''}`}>
         <div className={styles.loaderContent}>
            <span className={styles.logoChar} style={{ animationDelay: '0.1s' }}>M</span>
            <span className={styles.logoChar} style={{ animationDelay: '0.2s' }}>o</span>
            <span className={styles.logoChar} style={{ animationDelay: '0.3s' }}>n</span>
            <span className={styles.logoChar} style={{ animationDelay: '0.4s' }}>G</span>
            <span className={styles.logoChar} style={{ animationDelay: '0.5s' }}>P</span>
            <span className={styles.logoChar} style={{ animationDelay: '0.6s' }}>T</span>
        </div>
        <div className={styles.progressBarContainer}>
            <div className={styles.progressBar} style={{ width: `${loadProgress}%` }}></div>
        </div>
        <p className={styles.progressText}>{loadText}</p>
      </div>

      {/* Phase 2: Video Player */}
      <div className={`${styles.fullscreenContainer} ${styles.videoPlayer} ${phase === 'video' ? styles.visible : ''}`}>
        <video ref={videoRef} className={styles.introVideo} muted playsInline preload="auto"></video>
      </div>
      
      {/* Phase 3: Logo Transformation */}
      <div className={`${styles.fullscreenContainer} ${phase === 'logo' ? styles.visible : ''}`}>
        <div className={styles.logoContainer}>
            <div className={styles.logoMark}></div>
            <div className={styles.logoText}>MonGPT</div>
        </div>
      </div>
    </>
  );
};

export default CinematicIntro;
