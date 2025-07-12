import React, { useState, useEffect, useRef } from 'react';
import styles from './CinematicIntro.module.css';

const CinematicIntro = ({ onFinished }) => {
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadText, setLoadText] = useState('BUFFERING CINEMATIC INTRO...');
  const [isReady, setIsReady] = useState(false); // State to track if video is ready
  const [phase, setPhase] = useState('loading'); // loading -> ready -> video -> logo -> finished
  const videoRef = useRef(null);

  useEffect(() => {
    // This is the working URL you confirmed.
    const videoUrl = './videos/MonGPT-Intro.mp4';

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
        setLoadText('[ CLICK TO BEGIN ]');
        setIsReady(true); // Video is loaded and ready to be played
      } else {
        setLoadText('ERROR: FAILED TO LOAD ASSETS. SKIPPING INTRO.');
        setTimeout(() => onFinished(), 2000);
      }
    };
    
    xhr.onerror = () => {
      setLoadText('ERROR: FAILED TO LOAD ASSETS. SKIPPING INTRO.');
      setTimeout(() => onFinished(), 2000);
    };

    xhr.send();
  }, [onFinished]);

  const handleStart = () => {
    if (isReady && videoRef.current) {
      setPhase('video');
      // Attempt to play the video with sound
      videoRef.current.play().catch(error => {
          console.error("Video autoplay with sound failed:", error);
          // Fallback for browsers that block audio autoplay
          videoRef.current.muted = true;
          videoRef.current.play();
      });
      
      videoRef.current.onended = () => {
        setPhase('logo');
      };
    }
  };
  
  useEffect(() => {
    if (phase === 'logo') {
      const timer = setTimeout(() => {
        setPhase('finished');
        onFinished();
      }, 3000); // Duration of logo screen before fading to app
      return () => clearTimeout(timer);
    }
  }, [phase, onFinished]);

  return (
    <>
      {/* Phase 1: Loading / Ready Screen */}
      <div 
        className={`${styles.fullscreenContainer} ${phase === 'loading' || phase === 'ready' ? styles.visible : ''}`}
        onClick={handleStart}
        style={{ cursor: isReady ? 'pointer' : 'default' }}
      >
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
          <p className={styles.clickToBegin}>{loadText}</p>
        )}
      </div>

      {/* Phase 2: Video Player */}
      <div className={`${styles.fullscreenContainer} ${styles.videoPlayer} ${phase === 'video' ? styles.visible : ''}`}>
        <video ref={videoRef} className={styles.introVideo} playsInline preload="auto"></video> {/* Sound is enabled by default, muted is removed */}
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
