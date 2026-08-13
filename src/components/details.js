import React, { useEffect } from 'react';

import { useStateValue } from '../state';
import Button from './button';
import Fade from './fade';
import { normalizeMediaUrl } from '../utils/mediaUtils';
import { extractYouTubeVideoId, isYouTubeUrl } from '../utils/youtubeUtils';

export function getRandomMarker({ focusedMarker, markers }) {
  if (!markers || !Array.isArray(markers) || markers.length === 0) return null;

  const filteredMarkers = markers.filter((marker) => {
    return marker?.id && focusedMarker?.id && marker.id !== focusedMarker.id;
  });

  if (filteredMarkers.length === 0) return null;

  return filteredMarkers[Math.floor(Math.random() * filteredMarkers.length)];
}

// MediaDisplay component to handle both images and YouTube videos
function MediaDisplay({ mediaUrl, eventName, currentIndex = 0, onError }) {
  const normalizedUrl = normalizeMediaUrl(mediaUrl);

  // Check if mediaUrl is a YouTube URL
  if (isYouTubeUrl(normalizedUrl)) {
    const videoId = extractYouTubeVideoId(normalizedUrl);

    if (videoId) {
      return (
        <iframe
          className="event-media youtube-video"
          width="100%"
          height="auto"
          src={`https://www.youtube.com/embed/${videoId}`}
          title={`${eventName || 'YouTube Video'} - ${currentIndex + 1}`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      );
    }
  }

  // Check if mediaUrl is a video file
  if (
    typeof normalizedUrl === 'string' &&
    (normalizedUrl.endsWith('.mp4') ||
      normalizedUrl.endsWith('.mov') ||
      normalizedUrl.endsWith('.avi'))
  ) {
    return (
      <video controls src={normalizedUrl} className="event-media" onError={onError}>
        Your browser does not support the video tag.
      </video>
    );
  }

  // Default to image
  return (
    <img
      src={normalizedUrl}
      alt={`${eventName || 'Historical media'} - Item ${currentIndex + 1}`}
      className="event-media"
      onError={onError}
    />
  );
}

// Định nghĩa ngoài Details để reference ổn định, tránh unmount/remount khi state (isReferencesOpen) đổi → không mất scroll
function MediaDisplaySection({ focusedMarker, templateType = 'normal' }) {
    const { eventName, mediaUrl, sourceMedia, description } = focusedMarker;
    const mediaArray = (Array.isArray(mediaUrl) ? mediaUrl : mediaUrl != null ? [mediaUrl] : []).filter(Boolean);
    const descArray = Array.isArray(description) ? description : [description];
    const [currentIndex, setCurrentIndex] = React.useState(0);

    // Reset carousel index khi đổi sự kiện (prev/next) – tránh index vượt quá mediaArray mới
    useEffect(() => {
      setCurrentIndex(0);
    }, [focusedMarker?.id]);

    // Clamp index để luôn nằm trong [0, mediaArray.length - 1]
    const safeIndex = mediaArray.length > 0 ? Math.min(currentIndex, mediaArray.length - 1) : 0;

    // Normal template: single media only, no carousel
    if (templateType === 'normal') {
      const singleMediaUrl = mediaArray[0];
      if (!singleMediaUrl) return null;
      return (
        <div className="media-container">
          <MediaDisplay
            key={`${focusedMarker?.id}-img`}
            mediaUrl={singleMediaUrl}
            eventName={eventName}
            currentIndex={0}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          {sourceMedia && (
            <div className="media-caption">
              {typeof sourceMedia === 'string'
                ? sourceMedia
                : Array.isArray(sourceMedia) ? sourceMedia[0] || 'Source' : 'Source'}
            </div>
          )}
        </div>
      );
    }

    // Determine which description array to use based on template type
    const useSynchronizedDescription = templateType === 'story_scroll';
    const displayDescription = useSynchronizedDescription ? descArray : [description];

    // Navigation buttons based on template type
    const navButtonsClass = 'story-nav-buttons';
    const tabsClass = 'story-tabs';
    const tabClass = 'story-tab';

    // Calculate thumbnail carousel offset
    const calculateThumbnailOffset = (currentIdx, totalItems, type) => {
      const thumbnailSize = type === 'grid' ? 70 : 70; // width of thumbnail
      const gap = 12; // gap
      const itemWidth = thumbnailSize + gap;
      const containerWidth = 600; // Approximate container width in full screen
      const visibleItems = Math.floor(containerWidth / itemWidth);

      if (totalItems <= visibleItems) {
        return 0;
      }

      const centerPosition = Math.floor(visibleItems / 2);
      let offset = 0;

      if (currentIdx < centerPosition) {
        offset = 0;
      } else if (currentIdx >= totalItems - centerPosition) {
        offset = -(totalItems - visibleItems) * itemWidth;
      } else {
        offset = -(currentIdx - centerPosition) * itemWidth;
      }

      return offset;
    };

    return (
      <>
        {/* Media (image/video) from mediaUrl - template with navigation */}
        {mediaArray.length > 0 && (
          <div className="media-container">
            <div className={`${templateType}-container`}>
              <div className={navButtonsClass}>
                <button
                  className="nav-btn prev-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex((prev) =>
                      prev > 0 ? prev - 1 : Math.max(0, mediaArray.length - 1)
                    );
                  }}
                >
                  &#8249;
                </button>

                <div className="media-display">
                  <MediaDisplay
                    key={`${focusedMarker?.id}-${safeIndex}-${mediaArray[safeIndex]}`}
                    mediaUrl={mediaArray[safeIndex]}
                    eventName={eventName}
                    currentIndex={safeIndex}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />

                  {/* Source media caption */}
                  {sourceMedia && (
                    <div className="media-caption">
                      {typeof sourceMedia === 'string'
                        ? sourceMedia
                        : Array.isArray(sourceMedia)
                          ? Array.isArray(sourceMedia) &&
                            sourceMedia[safeIndex]
                            ? sourceMedia[safeIndex]
                            : sourceMedia[0] || 'Source'
                          : 'Source'}
                    </div>
                  )}
                </div>

                <button
                  className="nav-btn next-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex((prev) =>
                      prev < mediaArray.length - 1 ? prev + 1 : 0
                    );
                  }}
                >
                  &#8250;
                </button>
              </div>

              {/* Thumbnail Previews */}
              {mediaArray.length > 1 && (
                <div className={tabsClass}>
                  <div
                    className={`${tabsClass}-track`}
                    style={{
                      transform: `translateX(${calculateThumbnailOffset(safeIndex, mediaArray.length, templateType)}px)`
                    }}
                  >
                    {mediaArray.map((mediaUrl, idx) => {
                      let thumbnailElement;

                      if (isYouTubeUrl(mediaUrl)) {
                        const videoId = extractYouTubeVideoId(mediaUrl);
                        if (videoId) {
                          const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
                          thumbnailElement = (
                            <img
                              src={thumbnailUrl}
                              alt={`Thumbnail ${idx + 1}`}
                              className="thumbnail-image"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          );
                        }
                      } else if (
                        typeof mediaUrl === 'string' &&
                        (mediaUrl.endsWith('.mp4') ||
                          mediaUrl.endsWith('.mov') ||
                          mediaUrl.endsWith('.avi'))
                      ) {
                        thumbnailElement = (
                          <div className="thumbnail-video-icon">▶</div>
                        );
                      } else {
                        thumbnailElement = (
                          <img
                            src={normalizeMediaUrl(mediaUrl)}
                            alt={`Thumbnail ${idx + 1}`}
                            className="thumbnail-image"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        );
                      }

                      return (
                        <div
                          key={idx}
                          className={`${tabClass} ${safeIndex === idx ? 'active' : ''}`}
                          onClick={() => setCurrentIndex(idx)}
                        >
                          {thumbnailElement || <span>{idx + 1}</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Detailed description - synchronized with media for story_scroll, static for others */}
        <div className="event-description">
          {displayDescription.length > 0 && (
            <p>
              {displayDescription[safeIndex] ||
                displayDescription[0] ||
                'No description available.'}
            </p>
          )}
        </div>
      </>
    );
}

// Định nghĩa ngoài Details để reference ổn định → mở dropdown Tham khảo không gây unmount → scroll không nhảy lên đầu
function DetailPanel({
  focusedMarker,
  dispatch,
  isReferencesOpen,
  setIsReferencesOpen,
  validatedEvents,
  validatedMarkers,
}) {
    const templateType = focusedMarker.templateType || 'normal';
    const { description, references } = focusedMarker;

    const findMarkerForEvent = (eventId) => {
      if (!validatedMarkers || !Array.isArray(validatedMarkers)) return null;
      return validatedMarkers.find((m) => {
        if (m.id === eventId) return true;
        if (m.eventsAtLocation) {
          return m.eventsAtLocation.some((e) => e.id === eventId);
        }
        return false;
      });
    };

    const sortedEvents = [...validatedEvents].sort((a, b) => a.id - b.id);
    const currentIndex = sortedEvents.findIndex((event) => event.id === focusedMarker.id);
    const hasPrevEvent = currentIndex > 0;
    const hasNextEvent = currentIndex >= 0 && currentIndex < sortedEvents.length - 1;

    return (
      <>
        {/* Vùng cuộn riêng để bookmark không bị overflow cắt */}
        <div className="detail-scroll">
          <div className="detail-content">
            <h2 className="event-title">{focusedMarker.eventName || 'Historical Event'}</h2>

            <MediaDisplaySection focusedMarker={focusedMarker} templateType={templateType} />

            {templateType === 'normal' && (
              <div className="event-description">
                {description &&
                  (typeof description === 'string' ? (
                    <p>{description}</p>
                  ) : Array.isArray(description) ? (
                    <p>{description[0]}</p>
                  ) : (
                    <p>No description available.</p>
                  ))}
              </div>
            )}

            {/* Tham khảo ở cuối trang – cuộn xuống mới thấy */}
            <div className="references-section-end">
              {((Array.isArray(references) && references.length > 0) ||
                (typeof references === 'string' && references.trim() !== '')) && (
                <div className="references-dropdown">
                  <button
                    className="references-dropdown-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsReferencesOpen(!isReferencesOpen);
                    }}
                  >
                    Tham khảo {isReferencesOpen ? '▼' : '▲'}
                  </button>
                  <div className={`references-dropdown-content ${isReferencesOpen ? 'show' : ''}`}>
                    {Array.isArray(references) ?
                      references.map((reference, index) => (
                        <a
                          key={index}
                          href={
                            reference.startsWith('http')
                              ? reference
                              : `https://${reference}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="reference-link-item"
                        >
                          {reference}
                        </a>
                      )) :
                      <a
                        href={
                          references.startsWith('http')
                            ? references
                            : `https://${references}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="reference-link-item"
                      >
                        {references}
                      </a>
                    }
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bookmark gắn cạnh trái detail page – ngoài vùng cuộn nên không bị cắt */}
        <div className="event-navigation-fixed">
          <div className="event-navigation-buttons">
            {hasNextEvent && (
              <button
                className="next-event-button"
                onClick={() => {
                  const nextEvent = sortedEvents[currentIndex + 1];
                  if (nextEvent) {
                    const nextMarker = findMarkerForEvent(nextEvent.id);
                    if (nextMarker) {
                      const tempMarker = {
                        ...nextMarker,
                        id: nextEvent.id,
                        phase: nextEvent.phase,
                        year: nextEvent.year,
                        city: nextEvent.location,
                        eventName: nextEvent.eventName,
                        description: nextEvent.description,
                        mediaUrl: nextEvent.mediaUrl,
                        sourceMedia: nextEvent.sourceMedia,
                        templateType: nextEvent.templateType,
                        references: nextEvent.references,
                        eventsAtLocation: undefined,
                      };
                      
                      // Bắt đầu chuyển cảnh: Ẩn nội dung chữ, Hiện bản đồ
                      dispatch({ type: 'START_TRANSITION' });
                      // Cập nhật tọa độ mới để bản đồ bay (flyTo) và vẽ đường nối
                      dispatch({ type: 'FOCUS', payload: tempMarker });
                      
                      // Sau 2.5s, ẩn bản đồ đi và hiện lại nội dung chữ mới
                      setTimeout(() => {
                        dispatch({ type: 'END_TRANSITION' });
                      }, 2500);
                    }
                  }
                }}
              >
                Sự kiện tiếp theo →
              </button>
            )}
            {hasPrevEvent && (
              <button
                className="prev-event-button"
                onClick={() => {
                  const prevEvent = sortedEvents[currentIndex - 1];
                  if (prevEvent) {
                    const prevMarker = findMarkerForEvent(prevEvent.id);
                    if (prevMarker) {
                      const tempMarker = {
                        ...prevMarker,
                        id: prevEvent.id,
                        phase: prevEvent.phase,
                        year: prevEvent.year,
                        city: prevEvent.location,
                        eventName: prevEvent.eventName,
                        description: prevEvent.description,
                        mediaUrl: prevEvent.mediaUrl,
                        sourceMedia: prevEvent.sourceMedia,
                        templateType: prevEvent.templateType,
                        references: prevEvent.references,
                        eventsAtLocation: undefined,
                      };
                      dispatch({ type: 'FOCUS', payload: tempMarker });
                    }
                  }
                }}
              >
                Sự kiện trước đó ←
              </button>
            )}
          </div>
        </div>
      </>
    );
}

export default function Details() {
  const [{ focusedMarker, markers, events, isMapTransitioning }, dispatch] = useStateValue();

  const validatedEvents = events && Array.isArray(events) ? events : [];
  const validatedMarkers = markers && Array.isArray(markers) ? markers : [];

  const [isReferencesOpen, setIsReferencesOpen] = React.useState(false);

  React.useEffect(() => {
    if (focusedMarker && focusedMarker.id && focusedMarker.phase) {
      const currentPhase = focusedMarker.phase;
      const viewedEvents =
        JSON.parse(
          localStorage.getItem(`viewedEvents_phase_${currentPhase}`)
        ) || [];
      if (!viewedEvents.includes(focusedMarker.id)) {
        localStorage.setItem(
          `viewedEvents_phase_${currentPhase}`,
          JSON.stringify([...viewedEvents, focusedMarker.id])
        );
      }
    }
  }, [focusedMarker?.id, focusedMarker?.phase]);

  React.useEffect(() => {
    setIsReferencesOpen(false);
  }, [focusedMarker?.id]);

  let content;
  if (focusedMarker) {
    content = (
      <DetailPanel
        focusedMarker={focusedMarker}
        dispatch={dispatch}
        isReferencesOpen={isReferencesOpen}
        setIsReferencesOpen={setIsReferencesOpen}
        validatedEvents={validatedEvents}
        validatedMarkers={validatedMarkers}
      />
    );
  }

  return (
    <>
      <Fade className="details-full-screen" show={!!focusedMarker && !isMapTransitioning}>
        <div className="historical-background" style={{ backgroundImage: 'url(./image/vietnam-pattern.jpg)' }}>
          <button 
            className="home-button-fixed"
            onClick={() => dispatch({ type: 'GO_HOME' })}
          >
            &#8962; Trang chủ
          </button>
          {content}
        </div>
      </Fade>
    </>
  );
}
