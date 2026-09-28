/**
 * Re:Connect - WordPress "Moments" Theme Script
 * 모바일 e-동창회 초대장 인터랙션 스크립트
 */

document.addEventListener('DOMContentLoaded', () => {
  initPhotoCarousel();
  initCountdownTimer();
  initVenueMapSwitcher();
  initPetalCanvas();
  initBgmSynth();
  initRsvpAndGuestbook();
  initShareAndCopy();
  initLightbox();
});

/* ==========================================================================
   1. [사진섹션] 부드러운 에디토리얼 캐러셀 애니메이션 (요구사항 4)
   ========================================================================== */
function initPhotoCarousel() {
  const track = document.getElementById('sliderTrack');
  const slides = document.querySelectorAll('.slide');
  const prevBtn = document.getElementById('prevSlideBtn');
  const nextBtn = document.getElementById('nextSlideBtn');
  const dots = document.querySelectorAll('.dot');
  const currentNumEl = document.getElementById('currentSlideNum');
  const autoplayBtn = document.getElementById('autoplayToggleBtn');
  const viewport = document.getElementById('sliderViewport');

  if (!track || slides.length === 0) return;

  let currentIndex = 0;
  const totalSlides = slides.length;
  let autoplayTimer = null;
  let isAutoplayRunning = true;

  function updateCarousel(index, smooth = true) {
    if (index < 0) index = totalSlides - 1;
    if (index >= totalSlides) index = 0;
    currentIndex = index;

    if (smooth) {
      track.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
    } else {
      track.style.transition = 'none';
    }

    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    // 인디케이터 도트
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentIndex);
    });

    // 카운터 (01 / 04 포맷)
    if (currentNumEl) {
      currentNumEl.textContent = String(currentIndex + 1).padStart(2, '0');
    }
  }

  function nextSlide() {
    updateCarousel(currentIndex + 1);
  }

  function prevSlide() {
    updateCarousel(currentIndex - 1);
  }

  if (nextBtn) nextBtn.addEventListener('click', () => {
    nextSlide();
    resetAutoplay();
  });

  if (prevBtn) prevBtn.addEventListener('click', () => {
    prevSlide();
    resetAutoplay();
  });

  dots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      const idx = parseInt(e.target.dataset.index, 10);
      updateCarousel(idx);
      resetAutoplay();
    });
  });

  // 자동 재생
  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(nextSlide, 3800);
    isAutoplayRunning = true;
    if (autoplayBtn) {
      autoplayBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
      autoplayBtn.setAttribute('aria-label', '슬라이드 일시정지');
    }
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
    isAutoplayRunning = false;
    if (autoplayBtn) {
      autoplayBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
      autoplayBtn.setAttribute('aria-label', '슬라이드 재생');
    }
  }

  function resetAutoplay() {
    if (isAutoplayRunning) {
      startAutoplay();
    }
  }

  if (autoplayBtn) {
    autoplayBtn.addEventListener('click', () => {
      if (isAutoplayRunning) {
        stopAutoplay();
        showToast('슬라이드가 일시정지되었습니다.');
      } else {
        startAutoplay();
        showToast('슬라이드 자동 재생을 시작합니다.');
      }
    });
  }

  // 모바일 터치 스와이프 제스처
  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;
  let isSwiping = false;

  viewport.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isSwiping = true;
    stopAutoplay();
  }, { passive: true });

  viewport.addEventListener('touchmove', (e) => {
    if (!isSwiping) return;
    touchEndX = e.touches[0].clientX;
    touchEndY = e.touches[0].clientY;
  }, { passive: true });

  viewport.addEventListener('touchend', () => {
    if (!isSwiping) return;
    isSwiping = false;

    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 35) {
      if (diffX < 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    startAutoplay();
  });

  viewport.addEventListener('mouseenter', stopAutoplay);
  viewport.addEventListener('mouseleave', () => {
    if (!isAutoplayRunning) startAutoplay();
  });

  updateCarousel(0);
  startAutoplay();
}

/* ==========================================================================
   2. [카운트다운 섹션] 실시간 카운트다운 애니메이션 (요구사항 5)
   ========================================================================== */
function initCountdownTimer() {
  // 목표 일시: 2032년 10월 1일 17:00:00 KST
  const targetDate = new Date('2032-10-01T17:00:00+09:00').getTime();

  const daysEl = document.getElementById('daysValue');
  const hoursEl = document.getElementById('hoursValue');
  const minutesEl = document.getElementById('minutesValue');
  const secondsEl = document.getElementById('secondsValue');
  const secondsBox = document.getElementById('secondsBox');
  const ddayBadge = document.getElementById('ddayBadge');

  let prevSeconds = null;

  function updateTimer() {
    const now = new Date().getTime();
    const difference = targetDate - now;

    if (difference <= 0) {
      if (ddayBadge) ddayBadge.textContent = 'D-DAY TODAY!';
      if (daysEl) daysEl.textContent = '00';
      if (hoursEl) hoursEl.textContent = '00';
      if (minutesEl) minutesEl.textContent = '00';
      if (secondsEl) secondsEl.textContent = '00';
      return;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    if (ddayBadge) {
      ddayBadge.textContent = `D - ${days.toLocaleString()}`;
    }

    if (daysEl) daysEl.textContent = days.toLocaleString();
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
    if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');

    if (secondsEl && seconds !== prevSeconds) {
      secondsEl.textContent = String(seconds).padStart(2, '0');
      if (secondsBox) {
        secondsBox.style.transform = 'scale(1.15)';
        setTimeout(() => {
          if (secondsBox) secondsBox.style.transform = 'scale(1)';
        }, 220);
      }
      prevSeconds = seconds;
    }
  }

  updateTimer();
  setInterval(updateTimer, 1000);

  setupCalendarIntegration();
}

function setupCalendarIntegration() {
  const googleBtn = document.getElementById('addToGoogleCalBtn');
  const icsBtn = document.getElementById('downloadIcsBtn');

  // 정확한 '창경궁' URL 파라미터 인코딩
  const title = encodeURIComponent('Re:Connect 동창회');
  const details = encodeURIComponent('세월이 흘러도 변하지 않는 우리들의 이야기, Re:Connect 동창회에 초대합니다.');
  const location = encodeURIComponent('서울특별시 종로구 창경궁로 185 창경궁');
  
  const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=20321001T080000Z/20321001T120000Z&details=${details}&location=${location}`;

  if (googleBtn) {
    googleBtn.addEventListener('click', () => {
      window.open(gcalUrl, '_blank');
    });
  }

  if (icsBtn) {
    icsBtn.addEventListener('click', () => {
      const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//ReConnect//Alumni Reunion//KO',
        'BEGIN:VEVENT',
        'UID:reconnect-20321001@alumni',
        'DTSTAMP:20260929T000000Z',
        'DTSTART:20321001T080000Z',
        'DTEND:20321001T120000Z',
        'SUMMARY:Re:Connect 동창회',
        'DESCRIPTION:세월이 흘러도 변하지 않는 우리들의 이야기, Re:Connect 동창회에 초대합니다.',
        'LOCATION:서울특별시 종로구 창경궁로 185 창경궁',
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n');

      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'ReConnect_동창회.ics';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('캘린더 파일(.ics)이 다운로드되었습니다.');
    });
  }
}

/* ==========================================================================
   3. [지도섹션] 300x300 창경궁 지도 + 구글맵 우회 안정 탑재 (요구사항 6)
   ========================================================================== */
function initVenueMapSwitcher() {
  const tabGoogle = document.getElementById('tabGoogleMap');
  const tabNaver = document.getElementById('tabNaverMap');
  const googleIframe = document.getElementById('googleMapIframe');
  const naverPlaceholder = document.getElementById('naverMapPlaceholder');
  const copyBtn = document.getElementById('copyAddressBtn');

  if (tabGoogle && tabNaver && googleIframe && naverPlaceholder) {
    tabGoogle.addEventListener('click', () => {
      tabGoogle.classList.add('active');
      tabNaver.classList.remove('active');
      googleIframe.classList.add('active');
      naverPlaceholder.classList.remove('active');
      showToast('구글 지도로 전환되었습니다.');
    });

    tabNaver.addEventListener('click', () => {
      tabNaver.classList.add('active');
      tabGoogle.classList.remove('active');
      naverPlaceholder.classList.add('active');
      googleIframe.classList.remove('active');
      showToast('네이버 지도 안내 화면으로 전환되었습니다.');
    });
  }

  // 주소 복사하기 버튼
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const address = "서울특별시 종로구 창경궁로 185 창경궁";
      navigator.clipboard.writeText(address).then(() => {
        showToast('창경궁 주소가 클립보드에 복사되었습니다.');
      }).catch(() => {
        showToast('서울특별시 종로구 창경궁로 185');
      });
    });
  }
}

/* ==========================================================================
   4. 꽃잎 파티클 캔버스
   ========================================================================== */
function initPetalCanvas() {
  const canvas = document.getElementById('petalCanvas');
  const toggleBtn = document.getElementById('petalToggleBtn');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let animationId = null;
  let isRunning = true;

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const petalCount = 26;
  const petals = [];

  const colors = [
    'rgba(255, 218, 228, 0.75)',
    'rgba(255, 235, 240, 0.8)',
    'rgba(250, 212, 222, 0.7)',
    'rgba(255, 242, 245, 0.65)'
  ];

  class Petal {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = -20 - Math.random() * 50;
      this.size = 8 + Math.random() * 11;
      this.speedY = 0.7 + Math.random() * 1.5;
      this.speedX = -0.4 + Math.random() * 1.3;
      this.angle = Math.random() * 360;
      this.angularSpeed = (Math.random() - 0.5) * 1.8;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.swing = Math.random() * 1.8;
      this.swingSpeed = 0.02 + Math.random() * 0.02;
      this.swingStep = Math.random() * Math.PI;
    }

    update() {
      this.y += this.speedY;
      this.x += this.speedX + Math.sin(this.swingStep) * this.swing;
      this.swingStep += this.swingSpeed;
      this.angle += this.angularSpeed;

      if (this.y > height + 20 || this.x < -30 || this.x > width + 30) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.angle * Math.PI) / 180);

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(this.size / 2, -this.size / 2, this.size, 0, 0, this.size);
      ctx.bezierCurveTo(-this.size, 0, -this.size / 2, -this.size / 2, 0, 0);
      ctx.fillStyle = this.color;
      ctx.fill();

      ctx.restore();
    }
  }

  for (let i = 0; i < petalCount; i++) {
    const p = new Petal();
    p.y = Math.random() * height;
    petals.push(p);
  }

  function loop() {
    ctx.clearRect(0, 0, width, height);
    petals.forEach(p => {
      p.update();
      p.draw();
    });
    if (isRunning) {
      animationId = requestAnimationFrame(loop);
    }
  }

  loop();

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      isRunning = !isRunning;
      toggleBtn.classList.toggle('active', isRunning);
      if (isRunning) {
        loop();
        showToast('꽃잎 효과를 켰습니다.');
      } else {
        cancelAnimationFrame(animationId);
        ctx.clearRect(0, 0, width, height);
        showToast('꽃잎 효과를 껐습니다.');
      }
    });
  }
}

/* ==========================================================================
   5. 감성 배경음악 신디사이저 (Web Audio API)
   ========================================================================== */
function initBgmSynth() {
  const bgmBtn = document.getElementById('bgmToggleBtn');
  if (!bgmBtn) return;

  let audioCtx = null;
  let isPlaying = false;
  let timerId = null;

  const notes = [
    { freq: 261.63, dur: 0.85 }, // C4
    { freq: 329.63, dur: 0.85 }, // E4
    { freq: 392.00, dur: 0.85 }, // G4
    { freq: 523.25, dur: 1.25 }, // C5
    { freq: 493.88, dur: 0.85 }, // B4
    { freq: 392.00, dur: 0.85 }, // G4
    { freq: 349.23, dur: 0.85 }, // F4
    { freq: 440.00, dur: 1.25 }, // A4
    { freq: 329.63, dur: 0.85 }, // E4
    { freq: 261.63, dur: 0.85 }, // C4
    { freq: 293.66, dur: 0.85 }, // D4
    { freq: 392.00, dur: 1.60 }  // G4
  ];

  let noteIndex = 0;

  function playNote(freq, duration) {
    if (!audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gain.gain.setValueAtTime(0, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.07, audioCtx.currentTime + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.warn(e);
    }
  }

  function scheduleNextNote() {
    if (!isPlaying) return;
    const currentNote = notes[noteIndex];
    playNote(currentNote.freq, currentNote.dur);

    noteIndex = (noteIndex + 1) % notes.length;
    timerId = setTimeout(scheduleNextNote, currentNote.dur * 900);
  }

  bgmBtn.addEventListener('click', () => {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    if (!isPlaying) {
      isPlaying = true;
      bgmBtn.classList.add('playing', 'active');
      scheduleNextNote();
      showToast('감성 피아노 멜로디가 연주됩니다.');
    } else {
      isPlaying = false;
      bgmBtn.classList.remove('playing', 'active');
      clearTimeout(timerId);
      showToast('멜로디가 일시정지되었습니다.');
    }
  });
}

/* ==========================================================================
   6. 참석 여부 (RSVP) & 방명록 관리
   ========================================================================== */
function initRsvpAndGuestbook() {
  const form = document.getElementById('rsvpForm');
  const listEl = document.getElementById('guestbookList');
  if (!form || !listEl) return;

  const STORAGE_KEY = 'reconnect_alumni_guestbook_v2';

  const defaultGuests = [
    {
      name: '김민준 (15기 회장)',
      attendance: '참석',
      count: '본인 1명',
      message: '손꼽아 기다리던 동창회입니다! 모두 반가운 얼굴로 만나요.',
      date: '방금 전'
    },
    {
      name: '이서연 (15기)',
      attendance: '참석',
      count: '동반 1인 포함 (2명)',
      message: '그 시절 사진 보니까 가슴이 뭉클하네요. 10월 1일 창경궁에서 꼭 만나요!',
      date: '1시간 전'
    },
    {
      name: '박도현 (14기)',
      attendance: '참석',
      count: '본인 1명',
      message: '세월이 참 빠릅니다. 오랜만에 반가운 동기들과 즐거운 시간 보내고 싶습니다.',
      date: '어제'
    }
  ];

  function getStoredGuests() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : defaultGuests;
    } catch {
      return defaultGuests;
    }
  }

  function renderGuestbook() {
    const guests = getStoredGuests();
    listEl.innerHTML = guests.map(guest => `
      <div class="guest-card">
        <div class="guest-header">
          <span class="guest-name">${escapeHtml(guest.name)}</span>
          <span class="guest-status ${guest.attendance}">${guest.attendance}</span>
        </div>
        <p class="guest-msg">${escapeHtml(guest.message || '참석 의사를 전달했습니다.')}</p>
        <div class="guest-date">${guest.date}</div>
      </div>
    `).join('');
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('guestName').value.trim();
    const attendance = form.querySelector('input[name="attendance"]:checked').value;
    const count = document.getElementById('guestCount').value;
    const message = document.getElementById('guestMessage').value.trim();

    if (!name) {
      showToast('이름을 입력해주세요.');
      return;
    }

    const newGuest = {
      name,
      attendance,
      count,
      message,
      date: '방금 전'
    };

    const guests = getStoredGuests();
    guests.unshift(newGuest);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(guests));
    } catch (err) {
      console.warn(err);
    }

    renderGuestbook();
    form.reset();
    showToast(`${name}님의 소중한 마음이 전달되었습니다!`);
  });

  renderGuestbook();
}

/* ==========================================================================
   7. 공유하기 및 링크 복사
   ========================================================================== */
function initShareAndCopy() {
  const shareTopBtn = document.getElementById('shareTopBtn');
  const shareBottomBtn = document.getElementById('shareBottomBtn');
  const copyLinkBtn = document.getElementById('copyLinkBtn');

  const shareData = {
    title: 'Re:Connect - 동창회 초대장',
    text: '세월이 흘러도 변하지 않는 우리들의 이야기, Re:Connect 동창회에 초대합니다! (2032.10.1 창경궁)',
    url: window.location.href
  };

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== 'AbortError') {
          copyToClipboard();
        }
      }
    } else {
      copyToClipboard();
    }
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      showToast('초대장 링크가 복사되었습니다!');
    }).catch(() => {
      showToast('링크 복사 완료: ' + window.location.href);
    });
  }

  if (shareTopBtn) shareTopBtn.addEventListener('click', handleShare);
  if (shareBottomBtn) shareBottomBtn.addEventListener('click', handleShare);
  if (copyLinkBtn) copyLinkBtn.addEventListener('click', copyToClipboard);
}

/* ==========================================================================
   8. 이미지 라이트박스
   ========================================================================== */
function initLightbox() {
  const modal = document.getElementById('lightboxModal');
  const backdrop = document.getElementById('lightboxBackdrop');
  const closeBtn = document.getElementById('lightboxCloseBtn');
  const lightboxImg = document.getElementById('lightboxImage');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const expandBtns = document.querySelectorAll('.expand-btn');

  if (!modal) return;

  function openLightbox(src, caption) {
    lightboxImg.src = src;
    lightboxCaption.textContent = caption || '';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  expandBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const src = btn.dataset.src;
      const caption = btn.dataset.caption;
      openLightbox(src, caption);
    });
  });

  if (backdrop) backdrop.addEventListener('click', closeLightbox);
  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeLightbox();
    }
  });
}

/* ==========================================================================
   공통 토스트 & 이스케이프
   ========================================================================== */
let toastTimeout = null;
function showToast(message) {
  const toast = document.getElementById('toastMessage');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 2600);
}

function escapeHtml(string) {
  if (!string) return '';
  return String(string)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
