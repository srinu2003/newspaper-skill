/* ==========================================================================
   THE DAILY CHRONICLE - INTERACTION SCRIPT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // --- THEME PICKER ---
  const body = document.body;
  const themeBtns = document.querySelectorAll('.theme-btn');

  // Load saved theme or default to parchment
  const savedTheme = localStorage.getItem('newspaper-theme') || 'parchment';
  setTheme(savedTheme);

  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const theme = btn.getAttribute('data-theme');
      setTheme(theme);
    });
  });

  function setTheme(themeName) {
    // Remove previous theme classes
    body.classList.remove('theme-parchment', 'theme-light', 'theme-dark');
    // Add current theme class
    body.classList.add(`theme-${themeName}`);
    // Save in storage
    localStorage.setItem('newspaper-theme', themeName);

    // Update active button state
    themeBtns.forEach(btn => {
      if (btn.getAttribute('data-theme') === themeName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // --- PRINT NEWSPAPER EVENT ---
  const printBtn = document.getElementById('print-newspaper-btn');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }


  // --- MINI-CROSSWORD SOLVER ---
  const crosswordAnswers = [
    ['B', 'I', 'T'],
    ['I', 'C', 'E'],
    ['T', 'E', 'N']
  ];

  const crosswordCells = document.querySelectorAll('.crossword-cell');
  const verifyBtn = document.getElementById('verify-crossword-btn');
  const resetBtn = document.getElementById('reset-crossword-btn');
  const feedback = document.getElementById('crossword-feedback');

  // Input Auto-Focus behavior: jump to next cell on entry
  crosswordCells.forEach(cell => {
    cell.addEventListener('input', (e) => {
      const value = e.target.value.toUpperCase();
      e.target.value = value; // Force uppercase in view

      if (value.length === 1) {
        // Move focus to next input in grid order
        const row = parseInt(e.target.getAttribute('data-row'));
        const col = parseInt(e.target.getAttribute('data-col'));
        
        let nextCol = col + 1;
        let nextRow = row;
        
        if (nextCol > 2) {
          nextCol = 0;
          nextRow = row + 1;
        }

        if (nextRow <= 2) {
          const nextCell = document.getElementById(`cell-${nextRow}-${nextCol}`);
          if (nextCell) nextCell.focus();
        }
      }
    });

    // Add backspace navigation support
    cell.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && e.target.value === '') {
        const row = parseInt(e.target.getAttribute('data-row'));
        const col = parseInt(e.target.getAttribute('data-col'));
        
        let prevCol = col - 1;
        let prevRow = row;

        if (prevCol < 0) {
          prevCol = 2;
          prevRow = row - 1;
        }

        if (prevRow >= 0) {
          const prevCell = document.getElementById(`cell-${prevRow}-${prevCol}`);
          if (prevCell) {
            prevCell.focus();
            prevCell.value = '';
          }
        }
      }
    });
  });

  // Verify solution
  if (verifyBtn) {
    verifyBtn.addEventListener('click', () => {
      let isCorrect = true;
      let isAnyEmpty = false;

      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const cell = document.getElementById(`cell-${r}-${c}`);
          const val = cell.value.trim().toUpperCase();

          if (!val) {
            isAnyEmpty = true;
            isCorrect = false;
          } else if (val !== crosswordAnswers[r][c]) {
            isCorrect = false;
          }
        }
      }

      if (isAnyEmpty) {
        feedback.textContent = "INCOMPLETE. Fill all cells.";
        feedback.className = "crossword-feedback error";
      } else if (isCorrect) {
        feedback.textContent = "CORRECT! The Printing Syndicate salutes your intellect.";
        feedback.className = "crossword-feedback success";
        // Highlight grid border as green
        const grid = document.getElementById('crossword-grid');
        grid.style.boxShadow = '0 0 10px rgba(46, 125, 50, 0.6)';
      } else {
        feedback.textContent = "INCORRECT. Recalculate your coordinates.";
        feedback.className = "crossword-feedback error";
      }
    });
  }

  // Reset grid
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      crosswordCells.forEach(cell => cell.value = '');
      feedback.textContent = '';
      feedback.className = 'crossword-feedback';
      const grid = document.getElementById('crossword-grid');
      grid.style.boxShadow = 'none';
      
      const firstCell = document.getElementById('cell-0-0');
      if (firstCell) firstCell.focus();
    });
  }


  // --- ARTICLE TRANSLATION / READING MODAL VIEW ---
  const modal = document.getElementById('article-modal');
  const modalClose = document.getElementById('modal-close-btn');
  const modalBackdrop = document.getElementById('modal-backdrop');
  const modalContent = document.getElementById('modal-article-content');
  const readMoreButtons = document.querySelectorAll('.read-more-btn');

  // Complete articles library content mapping
  const articleLibrary = {
    'lead-story': {
      title: "STEAM-POWERED AIRSHIPS REVOLUTIONIZE TRANSATLANTIC TRAVEL",
      subtitle: "The full telegraphic ledger from the maiden voyage of the Aeon Star.",
      author: "By ARTHUR PENDRICK, Aviation Correspondent",
      date: "Wednesday, July 8, 2026",
      image: "lead_story.png",
      caption: "The majestic 'Aeon Star' preparing for departure from the Royal Aerodrome.",
      paragraphs: [
        "In a spectacular display of industrial prowess, the skies above the Atlantic have officially been conquered by steam. Yesterday evening at exactly seven minutes past eight, the HMS Aeon Star cast off its lines from the New York mooring tower, having successfully crossed the ocean from London in just over forty-eight hours.",
        "The vessel represents a marvel of modern metallurgy and aerodynamic research. Sporting a hull of gold-dusted duralumin and gas bags filled with premium lift-helium, it handles heavy weather with unprecedented grace. Powered by four triple-expansion coal-fired steam turbine systems, the airship generates over twelve thousand horsepower, driving four massive bronze propellers.",
        "Passengers reported a travel experience rivaling the finest hotels. The grand dining hall served roast pheasant and champagne, while the lounge was filled with the music of a mechanical pianola. Famous passengers included several high-ranking diplomats, industrialists, and artists.",
        "The success of the Aeon Star marks the end of the slow two-week sea voyage. The Royal Mail Service has already contracted for six additional airships, promising regular bi-weekly deliveries between the continents before the end of the decade."
      ]
    },
    'calc-machines': {
      title: "THE COAL-FIRED ANALYTICAL ENGINE",
      subtitle: "Babbage's steam machines set up in national database centres.",
      author: "By LADY ADA LOVELACE II",
      date: "Wednesday, July 8, 2026",
      image: null,
      paragraphs: [
        "The Ministry of Calculating has officially activated the Central mechanical computing grid at the Birmingham Ironworks. Designed to streamline census computation, tax records, and shipping timetables, the machine is powered by two dedicated steam boilers feeding high-pressure cylinders.",
        "Constructed using over seventy thousand hand-milled brass wheels and shafts, the system functions via binary card stacks designed by mathematical theorists. A staff of cardpunchers works in shifts to input raw logistics data, which is parsed and printed by mechanical drums at the speed of sixty figures per minute.",
        "Skeptics argue that the mechanical gears are prone to friction faults, but operators note that self-lubricating graphite oilers have reduced maintenance delays. This represents a monumental leap in state organization, setting a precedent for global numerical networks."
      ]
    },
    'rail-expansion': {
      title: "TRANS-SIBERIAN LINE EXPANDS EASTWARD",
      subtitle: "Locomotives break through deep sub-zero conditions to link markets.",
      author: "By NIKOLAI VOLKOV",
      date: "Wednesday, July 8, 2026",
      image: null,
      paragraphs: [
        "Steel tracks continue their relentless progression through the Siberian wilderness. Engineers in Irkutsk report that the final spikes have been driven to secure the link between Moscow and Vladivostok, uniting the vast expanse under a single standard timetable.",
        "The flagship locomotive, 'The Northern Giant', completed its winter test run hauling over fifty coaches of freight in temperatures reaching negative forty degrees. Equipped with a rotary snow-clearing plow, the train cleared snowdrifts up to ten feet deep without losing steam pressure.",
        "This engineering triumph promises to accelerate trading between East and West. Timber, silk, tea, and minerals will now flow across Eurasia in a matter of days, completely bypassing the perilous ocean voyages around the Cape."
      ]
    },
    'star-signal': {
      title: "HARMONIC COSMIC SIGNAL DETECTED",
      subtitle: "Greenwich astronomers record repeating mathematical pulses from Orion.",
      author: "By DR. ALISTAIR VANE, Royal Astronomer",
      date: "Wednesday, July 8, 2026",
      image: "science_story.png",
      caption: "An illustration of the astronomical mechanism utilized to track the celestial signal.",
      paragraphs: [
        "Using the sensitive metal antennas of the new Greenwich Optical and Electromagnetic Array, scientists have recorded a persistent, rhythmic radio oscillation originating from the constellation Orion.",
        "The signal is composed of a series of three short pulses, followed by a pause of exactly three point one seconds. Unlike solar radiation or planetary magnetic fields, which produce random static, this signal maintains a precise mathematical progression that mirrors the Fibonacci sequence.",
        "Members of the Royal Society are split on the discovery. Some suggest it could be the electromagnetic signature of a rotating neutron star, while others hypothesize that a foreign intelligence may be attempting to signal across the cosmic void. Further observations are scheduled using the Paris observatory to verify the coordinates."
      ]
    },
    'editorial-speed': {
      title: "THE SPEED OF MODERN LIFE: A CAUTIONARY TALE",
      subtitle: "A philosophical reflection on computing engines, airships, and human thought.",
      author: "By SAMUEL SPENCER, Editor",
      date: "Wednesday, July 8, 2026",
      image: null,
      paragraphs: [
        "As we watch the great mechanical gears of the Birmingham Analytical Engine click and the boilers of the Aeon Star hiss, we must ask ourselves: whither goest the human mind in this frantic age?",
        "Progress is undeniably efficient. Information flies along telegraph wires at the speed of light; passengers sleep in staterooms while flying over the Atlantic. But the human soul is not geared for speed. Reflective thought requires quiet, boredom, and empty space—luxuries that are rapidly being digitized and mechanized away.",
        "Let us not forget to close the papers, step away from the clicking machinery, and walk among the quiet trees. Lest in calculations we lose our values, and in speed we lose our direction."
      ]
    }
  };

  // Open modal handler
  readMoreButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.article-card');
      if (!card) return;
      
      const articleId = card.getAttribute('data-article-id');
      const article = articleLibrary[articleId];
      
      if (article) {
        // Build modal content html
        let mediaHtml = '';
        if (article.image) {
          mediaHtml = `
            <div class="article-media">
              <img src="${article.image}" alt="${article.title}" class="newspaper-img">
              ${article.caption ? `<p class="img-caption">${article.caption}</p>` : ''}
            </div>`;
        }

        const paragraphsHtml = article.paragraphs.map((p, idx) => {
          if (idx === 0) {
            const firstChar = p.charAt(0);
            const remaining = p.slice(1);
            return `<p class="paragraph-lead"><span class="dropcap">${firstChar}</span>${remaining}</p>`;
          }
          return `<p>${p}</p>`;
        }).join('');

        modalContent.innerHTML = `
          <h2 class="article-headline font-display" id="modal-headline">${article.title}</h2>
          ${article.subtitle ? `<h3 class="article-subhead">${article.subtitle}</h3>` : ''}
          <div class="article-author-line">
            <span>${article.author}</span>
            <span class="dot-separator"></span>
            <span>${article.date}</span>
          </div>
          ${mediaHtml}
          <div class="modal-article-body">
            ${paragraphsHtml}
          </div>
        `;

        // Open modal
        modal.classList.add('open');
        document.body.style.overflow = 'hidden'; // Disable background scrolling
        
        // Put focus inside the modal
        modalClose.focus();
      }
    });
  });

  // Close modal handler
  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = ''; // Enable background scrolling
  }

  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', closeModal);
  }

  // Handle escape key to close modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });

});
