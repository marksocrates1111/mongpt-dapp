import React, { useState, useEffect, useRef } from 'react';
import styles from './CinematicIntro.module.css';

const CinematicIntro = ({ onFinished }) => {
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadText, setLoadText] = useState('BUFFERING CINEMATIC INTRO...');
  const [isReady, setIsReady] = useState(false);
  const [phase, setPhase] = useState('loading');
  const videoRef = useRef(null);

  useEffect(() => {
    const videoUrl = 'https://raw.githubusercontent.com/marksocrates1111/mongpt-dapp/refs/heads/main/public/videos/MonGPT-Intro.mp4';

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
        setLoadText(''); // Clear loading text
        setIsReady(true);
      } else {
        setLoadText('ERROR: FAILED TO LOAD ASSETS.');
        // Still show skip button on error
        setIsReady(true); 
      }
    };
    
    xhr.onerror = () => {
      setLoadText('ERROR: FAILED TO LOAD ASSETS.');
      setIsReady(true);
    };

    xhr.send();
  }, []);

  const handleStart = () => {
    if (isReady && videoRef.current && videoRef.current.src) {
      setPhase('video');
      videoRef.current.play().catch(error => {
          console.error("Video autoplay with sound failed:", error);
          videoRef.current.muted = true;
          videoRef.current.play();
      });
      
      videoRef.current.onended = () => {
        setPhase('logo');
      };
    } else {
      // If video failed to load, just skip
      onFinished();
    }
  };
  
  useEffect(() => {
    if (phase === 'logo') {
      const timer = setTimeout(() => {
        onFinished();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [phase, onFinished]);

  return (
    <>
      <div className={`${styles.fullscreenContainer} ${phase === 'loading' || phase === 'ready' ? styles.visible : ''}`}>
        <div className={styles.loaderContent}>
            <span className={styles.logoChar} style={{ animationDelay: '0.1s' }}>M</span>
            <span className={styles.logoChar} style={{ animationDelay: '0.2s' }}>o</span>
            <span className={styles.logoChar} style={{ animationDelay: '0.3s' }}>n</span>
            <span className={styles.logoChar} style={{ animationDelay: '0.4s' }}>G</span>
            <span className={styles.logoChar} style={{ animationDelay: '0.5s' }}>P</span>
            <span className={styles.logoChar} style={{ animationDelay: '0.6s' }}>T</span>
        </div>
        { !isReady ? (
          <>
            <div className={styles.progressBarContainer}>
              <div className={styles.progressBar} style={{ width: `${loadProgress}%` }}></div>
            </div>
            <p className={styles.progressText}>{loadText}</p>
          </>
        ) : (
          <div className={styles.buttonContainer}>
            <button onClick={handleStart} className={styles.beginButton}>
              Begin Intro
            </button>
            <button onClick={onFinished} className={styles.skipButton}>
              Skip Intro
            </button>
          </div>
        )}
      </div>

      <div className={`${styles.fullscreenContainer} ${styles.videoPlayer} ${phase === 'video' ? styles.visible : ''}`}>
        <video ref={videoRef} className={styles.introVideo} playsInline preload="auto"></video>
      </div>
      
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
