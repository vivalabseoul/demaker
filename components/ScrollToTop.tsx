import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // 스크롤이 300px 이상 내려가면 버튼 표시
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="scroll-to-top-button no-full-width"
          style={{
            backgroundColor: 'var(--main-color)',
            color: 'var(--white)',
          }}
          aria-label="맨 위로 이동"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      )}

      <style>{`
        .scroll-to-top-button {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          width: 3.5rem;
          height: 3.5rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          cursor: pointer;
          z-index: 40;
          transition: all 0.3s ease;
          border: none;
          padding: 0 !important;
          min-height: auto;
        }

        .scroll-to-top-button:hover {
          transform: translateY(-4px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
          opacity: 0.9;
        }

        .scroll-to-top-button:active {
          transform: translateY(-2px);
        }

        /* 모바일: 버튼 크기 확대 */
        @media (max-width: 767px) {
          .scroll-to-top-button {
            width: 4rem;
            height: 4rem;
            bottom: 1.5rem;
            right: 1.5rem;
          }

          .scroll-to-top-button svg {
            width: 1.75rem;
            height: 1.75rem;
          }
        }
      `}</style>
    </>
  );
}
