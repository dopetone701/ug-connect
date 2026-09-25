"use client";

import { useEffect, useState, useCallback } from "react";
import { useGlobalCast, type Device } from "@/stores/use-global-cast";
import "./cast.css";

declare global {
  interface Window {
    cast?: any;
    chrome?: any;
    __onGCastApiAvailable?: (isAvailable: boolean) => void;
  }
}

export default function Cast() {
  const {
    isScanning,
    devices,
    setScanning,
    setDevices,
    selectDevice,
    setOpen,
  } = useGlobalCast();

  const [castReady, setCastReady] = useState(false);
  const [remoteAvailable, setRemoteAvailable] = useState(false);

  /*
   * ------------------------------------------------------------
   * Google Cast initialization
   * ------------------------------------------------------------
   */
  const initCast = useCallback(() => {
    try {
      const CastContext = window.cast?.framework?.CastContext;

      if (!CastContext) {
        setCastReady(false);
        return false;
      }

      const ctx = CastContext.getInstance();

      const receiverApplicationId =
        window.chrome?.cast?.media?.DEFAULT_MEDIA_RECEIVER_APP_ID;

      const autoJoinPolicy =
        window.chrome?.cast?.AutoJoinPolicy?.ORIGIN_SCOPED;

      if (!receiverApplicationId) {
        setCastReady(false);
        return false;
      }

      ctx.setOptions({
        receiverApplicationId,
        autoJoinPolicy,
      });

      setCastReady(true);
      return true;
    } catch (error) {
      console.error("Google Cast initialization failed:", error);
      setCastReady(false);
      return false;
    }
  }, []);

  /*
   * ------------------------------------------------------------
   * Load Google Cast SDK
   * ------------------------------------------------------------
   */
  const loadCastSDK = useCallback(() => {
    return new Promise<boolean>((resolve) => {
      if (typeof window === "undefined") {
        resolve(false);
        return;
      }

      // Already available
      if (
        window.cast?.framework?.CastContext &&
        window.chrome?.cast?.media
      ) {
        resolve(initCast());
        return;
      }

      const existing = document.getElementById(
        "ug-connect-cast-sdk"
      ) as HTMLScriptElement | null;

      const previousCallback = window.__onGCastApiAvailable;

      window.__onGCastApiAvailable = (available: boolean) => {
        previousCallback?.(available);

        if (!available) {
          resolve(false);
          return;
        }

        resolve(initCast());
      };

      if (existing) {
        // SDK is already loading. Give it time to initialize.
        const started = Date.now();

        const check = () => {
          if (
            window.cast?.framework?.CastContext &&
            window.chrome?.cast?.media
          ) {
            resolve(initCast());
            return;
          }

          if (Date.now() - started > 6000) {
            resolve(false);
            return;
          }

          window.setTimeout(check, 100);
        };

        check();
        return;
      }

      const script = document.createElement("script");

      script.id = "ug-connect-cast-sdk";
      script.src =
        "https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1";
      script.async = true;

      script.onerror = () => {
        console.error("Could not load Google Cast SDK");
        resolve(false);
      };

      document.head.appendChild(script);

      // Safety fallback in case the callback fires before our
      // polling sees the SDK.
      const started = Date.now();

      const check = () => {
        if (
          window.cast?.framework?.CastContext &&
          window.chrome?.cast?.media
        ) {
          resolve(initCast());
          return;
        }

        if (Date.now() - started > 8000) {
          resolve(false);
          return;
        }

        window.setTimeout(check, 100);
      };

      check();
    });
  }, [initCast]);

  /*
   * ------------------------------------------------------------
   * Remote Playback API
   *
   * This is NOT Bluetooth.
   * It only works when the browser/video implementation exposes
   * the Remote Playback API.
   * ------------------------------------------------------------
   */
  const setupRemotePlayback = useCallback(() => {
    try {
      const video = document.querySelector("video") as any;

      if (!video?.remote) {
        setRemoteAvailable(false);
        return () => {};
      }

      let cancelled = false;

      const handleAvailability = (event: any) => {
        if (cancelled) return;

        setRemoteAvailable(event?.availability === "available");
      };

      video.remote.addEventListener?.(
        "connecting",
        handleAvailability
      );

      video.remote.addEventListener?.(
        "connect",
        handleAvailability
      );

      video.remote.addEventListener?.(
        "disconnect",
        () => {
          if (!cancelled) {
            setRemoteAvailable(false);
          }
        }
      );

      if (typeof video.remote.watchAvailability === "function") {
        video.remote
          .watchAvailability(handleAvailability)
          .catch(() => {
            // Browser does not support availability watching.
          });
      }

      return () => {
        cancelled = true;

        video.remote.removeEventListener?.(
          "connecting",
          handleAvailability
        );

        video.remote.removeEventListener?.(
          "connect",
          handleAvailability
        );

        video.remote.cancelWatchAvailability?.().catch?.(() => {});
      };
    } catch {
      setRemoteAvailable(false);
      return () => {};
    }
  }, []);

  /*
   * ------------------------------------------------------------
   * Start scanning / initialize casting
   * ------------------------------------------------------------
   */
  useEffect(() => {
    let mounted = true;
    let remoteCleanup: (() => void) | undefined;

    setScanning(true);
    setDevices([]);
    setCastReady(false);
    setRemoteAvailable(false);

    const start = async () => {
      const castAvailable = await loadCastSDK();

      if (!mounted) return;

      setCastReady(castAvailable);

      remoteCleanup = setupRemotePlayback();

      // Give the Cast SDK a moment to discover available
      // devices through the native browser Cast picker.
      window.setTimeout(() => {
        if (mounted) {
          setScanning(false);
        }
      }, 1800);
    };

    start();

    // Absolute safety timeout.
    const timeout = window.setTimeout(() => {
      if (mounted) {
        setScanning(false);
      }
    }, 5000);

    return () => {
      mounted = false;
      window.clearTimeout(timeout);
      remoteCleanup?.();
    };
  }, [
    loadCastSDK,
    setupRemotePlayback,
    setDevices,
    setScanning,
  ]);

  /*
   * ------------------------------------------------------------
   * Cast current video
   * ------------------------------------------------------------
   */
  const handleCast = async () => {
    try {
      /*
       * 1. Google Cast
       */
      const ctx =
        window.cast?.framework?.CastContext?.getInstance();

      if (ctx) {
        await ctx.requestSession();

        const session = ctx.getCurrentSession();

        if (session) {
          const video = document.querySelector(
            "video"
          ) as HTMLVideoElement | null;

          const src =
            video?.currentSrc ||
            video?.src;

          if (!src) {
            console.warn("No video source available for casting.");
            return;
          }

          const MediaInfo =
            window.chrome?.cast?.media?.MediaInfo;

          const LoadRequest =
            window.chrome?.cast?.media?.LoadRequest;

          if (!MediaInfo || !LoadRequest) {
            console.warn("Google Cast media API unavailable.");
            return;
          }

          /*
           * Use the actual video MIME type where possible.
           */
          let contentType = "video/mp4";

          if (src.includes(".m3u8")) {
            contentType = "application/x-mpegURL";
          } else if (src.includes(".webm")) {
            contentType = "video/webm";
          }

          const mediaInfo = new MediaInfo(
            src,
            contentType
          );

          /*
           * Start from the current playback position.
           */
          if (video && Number.isFinite(video.currentTime)) {
            mediaInfo.metadata = new window.chrome.cast.media.GenericMediaMetadata();

            mediaInfo.metadata.title =
              document.title || "UG Connect";

            const request = new LoadRequest(mediaInfo);

            request.currentTime = video.currentTime;

            if (!video.paused) {
              request.autoplay = true;
            }

            await session.loadMedia(request);
          } else {
            const request = new LoadRequest(mediaInfo);
            request.autoplay = true;

            await session.loadMedia(request);
          }

          setOpen(false);
          return;
        }
      }

      /*
       * 2. Browser Remote Playback fallback
       */
      const video = document.querySelector(
        "video"
      ) as any;

      if (
        video?.remote &&
        typeof video.remote.prompt === "function"
      ) {
        await video.remote.prompt();
        setOpen(false);
        return;
      }

      /*
       * No supported casting method.
       */
      console.warn(
        "No supported casting method is available on this device/browser."
      );
    } catch (error: any) {
      /*
       * User cancelled the native Cast picker.
       */
      if (
        error?.name === "NotFoundError" ||
        error?.name === "AbortError" ||
        error?.code === "cancel"
      ) {
        return;
      }

      console.error("Cast error:", error);
    }
  };

  /*
   * ------------------------------------------------------------
   * Retry
   * ------------------------------------------------------------
   */
  const handleRetry = async () => {
    setScanning(true);
    setDevices([]);

    try {
      const ready = await loadCastSDK();
      setCastReady(ready);

      setupRemotePlayback();

      window.setTimeout(() => {
        setScanning(false);
      }, 1200);
    } catch {
      setScanning(false);
    }
  };

  /*
   * IMPORTANT:
   *
   * Do not manufacture fake "TV" devices.
   *
   * Google Cast devices are selected by the native Cast picker.
   * Remote Playback is represented separately.
   */
  const hasDevices =
    devices.length > 0 || remoteAvailable;

  const isEmpty =
    !isScanning &&
    !hasDevices;

  return (
    <div className="cast-content">

      <div className="cast-title">
        Cast to device
      </div>

      <div className="cast-subtitle">
        {isScanning
          ? "Searching for nearby devices..."
          : castReady
            ? "Ready to cast"
            : "Make sure your TV and phone are on the same Wi-Fi"}
      </div>

      <div className="cast-list">

        {/* SCANNING */}
        {isScanning && (
          <div className="cast-scan-row">
            <span className="cast-scan-dot" />
            Scanning...
          </div>
        )}

        {/* GOOGLE CAST / REMOTE PLAYBACK */}
        {!isScanning && hasDevices && (
          <>
            {castReady && (
              <button
                type="button"
                className="cast-device cast-device-primary"
                onClick={handleCast}
              >
                <div className="cast-device-name">
                  Cast to TV / Chromecast
                </div>

                <div className="cast-device-type">
                  Tap to choose a device
                </div>
              </button>
            )}

            {remoteAvailable && !castReady && (
              <button
                type="button"
                className="cast-device cast-device-primary"
                onClick={handleCast}
              >
                <div className="cast-device-name">
                  Nearby wireless display
                </div>

                <div className="cast-device-type">
                  Tap to connect
                </div>
              </button>
            )}

            {devices.map((device: Device) => (
              <button
                key={device.id}
                type="button"
                className="cast-device"
                onClick={() => {
                  selectDevice(device);
                  setOpen(false);
                }}
              >
                <div className="cast-device-name">
                  {device.name}
                </div>

                <div className="cast-device-type">
                  {device.type}
                </div>
              </button>
            ))}
          </>
        )}

        {/* EMPTY */}
        {isEmpty && (
          <div className="cast-empty">

            <div className="cast-empty-icon">
  <svg
    width="40"
    height="40"
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    {/* Cast dot */}
    <path d="M3 18v3h3c0-1.66-1.34-3-3-3Z" />

    {/* Small cast wave */}
    <path d="M3 13v2c3.31 0 6 2.69 6 6h2c0-4.42-3.58-8-8-8Z" />

    {/* Large cast wave */}
    <path d="M3 8v2c5.52 0 10 4.48 10 10h2C15 13.37 9.63 8 3 8Z" />

    {/* TV / Cast screen */}
    <path d="M5 4h14c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2h-4v-2h4V6H5v3H3V6c0-1.1.9-2 2-2Z" />
  </svg>
</div>


            <div className="cast-empty-title">
              No devices found
            </div>

            <div className="cast-empty-text">
              Make sure your Smart TV or Chromecast is on
              and connected to the same Wi-Fi as this phone.
            </div>

            <div className="cast-empty-tips">
              <span>
                • Turn on your TV and enable casting
              </span>

              <span>
                • Connect your phone and TV to the same Wi-Fi
              </span>

              <span>
                • Chromecast / Google TV works through the Cast picker
              </span>
            </div>

            <button
              type="button"
              className="cast-retry"
              onClick={handleRetry}
            >
              Scan again
            </button>

          </div>
        )}

      </div>
    </div>
  );
}
