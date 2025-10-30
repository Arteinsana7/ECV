// ============================================
// CONFIGURATION & CONSTANTES
// ============================================
const CONFIG = {
  CAROUSEL_INTERVAL: 5000,
  TOAST_DURATION: 3000,
  MIN_COLORS: 2,
  COLORS_DATA_URL: './colors-data.json',
};

// ============================================
// DONNÉES & ÉTAT DE L'APPLICATION
// ============================================
const AppState = {
  products: document.querySelectorAll('[data-product]'),
  menu: document.querySelector('.menu'),
  chosenGradient: [],
  carrouselRunning: false,
  colorsData: null,
};

// ============================================
// GESTION DES DONNÉES (JSON)
// ============================================
const DataManager = {
  async loadColorsData() {
    try {
      const response = await fetch(CONFIG.COLORS_DATA_URL);
      AppState.colorsData = await response.json();
      console.log('✅ Données des couleurs chargées:', AppState.colorsData);
      return AppState.colorsData;
    } catch (error) {
      console.error('❌ Erreur chargement JSON:', error);
      return null;
    }
  },

  getColorInfo(productId) {
    if (!AppState.colorsData) return null;
    return AppState.colorsData.colors.find((color) => color.id === productId);
  },

  getColorDescription(productId) {
    const colorInfo = this.getColorInfo(productId);
    return colorInfo ? colorInfo.description : 'Couleur non trouvée';
  },
};

// ============================================
// GESTION DU STORAGE
// ============================================
const StorageManager = {
  saveGradient(gradient) {
    localStorage.setItem('gradient', gradient);
  },

  loadGradient() {
    return localStorage.getItem('gradient');
  },

  saveProducts(productIds) {
    localStorage.setItem('chosenProducts', JSON.stringify(productIds));
  },

  loadProducts() {
    const saved = localStorage.getItem('chosenProducts');
    return saved ? JSON.parse(saved) : [];
  },

  clear() {
    localStorage.clear();
  },
};

// ============================================
// GESTION DU CARROUSEL
// ============================================
const CarouselManager = {
  currentIndex: 0,

  async start() {
    if (AppState.chosenGradient.length < CONFIG.MIN_COLORS) {
      UIManager.showToast(`Sélectionnez au moins ${CONFIG.MIN_COLORS} couleurs pour le carrousel`);
      return;
    }

    AppState.carrouselRunning = true;
    const startButton = document.getElementById('start-carousel');

    startButton.textContent = 'ARRÊTER LE CARROUSEL';
    UIManager.showToast('Carrousel démarré');
    console.log('Carrousel démarré avec les couleurs :', AppState.chosenGradient);

    while (AppState.carrouselRunning) {
      await this.sleep(CONFIG.CAROUSEL_INTERVAL);
      this.nextSlide();
    }

    this.cleanup();
  },

  nextSlide() {
    document.querySelectorAll('.product').forEach((p) => {
      p.classList.remove('active-carousel');
    });

    this.currentIndex = (this.currentIndex + 1) % AppState.chosenGradient.length;
    const productId = AppState.chosenGradient[this.currentIndex];
    const product = document.getElementById(productId);
    const gradient = window.getComputedStyle(product).background;

    product.classList.add('active-carousel');
    AppState.menu.style.background = gradient;
    StorageManager.saveGradient(gradient);

    console.log(`Gradient ${this.currentIndex + 1}/${AppState.chosenGradient.length}`);
  },

  stop() {
    AppState.carrouselRunning = false;
  },

  cleanup() {
    const startButton = document.getElementById('start-carousel');
    startButton.textContent = 'LANCER LE CARROUSEL';

    document.querySelectorAll('.product').forEach((p) => {
      p.classList.remove('active-carousel');
    });

    console.log('Carrousel arrêté');
  },

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },
};

// ============================================
// GESTION DES PRODUITS/COULEURS
// ============================================
const ProductManager = {
  handleProductClick(product) {
    const productId = product.id;
    const gradient = window.getComputedStyle(product).background;

    AppState.menu.style.background = gradient;

    if (!AppState.chosenGradient.includes(productId)) {
      AppState.chosenGradient.push(productId);
      product.classList.add('selected');
      this.showSelectionFeedback();
    }

    console.log('Produit cliqué:', productId);
    console.log('Historique:', AppState.chosenGradient);

    this.displayColorInfo(productId);

    StorageManager.saveProducts(AppState.chosenGradient);
    StorageManager.saveGradient(gradient);
  },

  showSelectionFeedback() {
    const count = AppState.chosenGradient.length;

    if (count === 1) {
      UIManager.showToast('💡 Sélectionnez une 2ème couleur pour démarrer le carrousel');
    } else if (count === 2) {
      UIManager.showToast('✨ Prêt ! Cliquez sur LANCER LE CARROUSEL');
    }
  },

  displayColorInfo(productId) {
    const colorInfo = DataManager.getColorInfo(productId);

    if (colorInfo) {
      console.log('📌 Couleur sélectionnée:', colorInfo.name);
      console.log('📝 Description:', colorInfo.description);
      console.log('🎨 Associations:', colorInfo.associations.join(', '));
      console.log('😌 Ambiance:', colorInfo.mood);
    }
  },

  restoreSelectedProducts() {
    const savedProducts = StorageManager.loadProducts();

    if (savedProducts.length > 0) {
      AppState.chosenGradient.push(...savedProducts);

      savedProducts.forEach((id) => {
        const product = document.getElementById(id);
        if (product) {
          product.classList.add('selected');
        }
      });

      console.log('✅ Produits restaurés:', AppState.chosenGradient);
    }
  },
};

// ============================================
// GESTION DE L'INTERFACE UTILISATEUR
// ============================================
const UIManager = {
  showToast(message, duration = CONFIG.TOAST_DURATION) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  restoreGradient() {
    const savedGradient = StorageManager.loadGradient();
    if (savedGradient) {
      AppState.menu.style.background = savedGradient;
    }
  },
};

// ============================================
// ANIMATION (Anime.js)
// ============================================
const AnimationManager = {
  init() {
    if (typeof anime === 'undefined') {
      console.error("❌ anime.js n'est pas chargé !");
      return;
    }

    const h2Element = document.querySelector('h2');
    if (!h2Element) {
      console.error('❌ Aucun h2 trouvé !');
      return;
    }

    this.splitTextIntoChars('h2');
    this.startTitleAnimation();
  },

  splitTextIntoChars(selector) {
    const element = document.querySelector(selector);
    const text = element.textContent;
    element.innerHTML = '';

    text.split('').forEach((char) => {
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = char === ' ' ? '\u00A0' : char;
      element.appendChild(span);
    });

    return document.querySelectorAll('.char');
  },

  startTitleAnimation() {
    anime
      .timeline({ loop: true })
      .add({
        targets: '.char',
        translateY: [
          { value: -44, duration: 600, easing: 'easeOutExpo' },
          { value: 0, duration: 800, easing: 'easeOutBounce', delay: 100 },
        ],
        rotate: {
          value: ['-360deg', '0deg'],
          duration: 1400,
          easing: 'easeInOutCirc',
        },
        opacity: [
          { value: 0, duration: 0 },
          { value: 1, duration: 400 },
        ],
        delay: anime.stagger(50),
        duration: 1400,
      })
      .add({
        targets: '.char',
        delay: 1000,
      });

    console.log('✅ Animation lancée !');
  },
};

// ============================================
// CHAT MANAGER - VERSION PROPRE ET UNIFIÉE
// ============================================
const ChatManager = {
  colorsData: null,
  conversationHistory: [],

  // Configuration musique
  lastfmApiKey: '86377a41bcd8efc2f866a9b3e20a868d',
  musicEnabled: true,

  // Contexte système enrichi
  systemContext: `Tu es Chromatix 🎨, expert passionné en théorie des couleurs, design et psychologie visuelle.

🎯 TON RÔLE :
- Conseiller artistique avec expertise en harmonies chromatiques
- Spécialiste de l'impact émotionnel des couleurs
- Guide créatif pour palettes web, design d'intérieur et branding

💬 TON STYLE :
- Conversationnel et chaleureux comme un mentor bienveillant
- Utilise des emojis 🎨✨💡 pour la personnalité
- Réponses courtes (3-5 phrases) SAUF si détails demandés
- Utilise des NOMS POÉTIQUES pour les couleurs (jamais de codes hex)
- Pose UNE question engageante à la fin

🎨 COULEURS DISPONIBLES DANS L'APPLICATION :
1. Pastel Blue - relaxante (sérénité, fraîcheur)
2. Sunset Orange - énergisante (chaleur, passion)
3. Mint Green - rafraîchissante (nature, harmonie)
4. Lavender Sky - contemplative (spiritualité, sagesse)
5. Coral Reef - accueillante (convivialité, joie)
6. Ocean Breeze - méditative (liberté, confiance)
7. Rose Gold - sophistiquée (élégance, féminité)
8. Purple Haze - inspirante (créativité, imagination)
9. Peachy Keen - réconfortante (douceur, tendresse)
10. Lime Twist - stimulante (vitalité, dynamisme)

🧠 TES EXPERTISES :
- Harmonies : complémentaires, triadiques, analogues, monochromes
- Psychologie des couleurs et associations culturelles
- Applications créatives : web, branding, décoration, mode

IMPORTANT : Garde la mémoire de la conversation pour un dialogue naturel et évolutif.`,

  // Charger les données des couleurs
  async loadColors() {
    try {
      const response = await fetch('./colors-data.json');
      this.colorsData = await response.json();
      console.log('✅ Données couleurs chargées:', this.colorsData.colors.length, 'couleurs');
      return true;
    } catch (error) {
      console.error('❌ Erreur chargement colors-data.json:', error);
      return false;
    }
  },

  // Trouver une couleur par ID
  getColorById(id) {
    if (!this.colorsData) return null;
    return this.colorsData.colors.find((color) => color.id === id);
  },

  // Chercher de la musique sur Last.fm
  async searchMusicByMood(mood, colorName) {
    if (!this.musicEnabled || !this.lastfmApiKey) {
      console.log('🎵 Musique désactivée (pas de clé API Last.fm)');
      return null;
    }

    try {
      const url = `https://ws.audioscrobbler.com/2.0/?method=tag.gettoptracks&tag=${encodeURIComponent(
        mood
      )}&api_key=${this.lastfmApiKey}&format=json&limit=5`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.tracks && data.tracks.track) {
        return data.tracks.track.slice(0, 3);
      }
      return null;
    } catch (error) {
      console.error('❌ Erreur Last.fm:', error);
      return null;
    }
  },

  // Créer un player audio pour la musique
  createMusicPlayer(tracks, colorName) {
    if (!tracks || tracks.length === 0) return;

    const responseBox = document.getElementById('response');

    const playerDiv = document.createElement('div');
    playerDiv.className = 'music-player';
    playerDiv.innerHTML = `
      <div class="music-player-header">
        🎵 Playlist pour ${colorName}
      </div>
      <div class="music-player-tracks">
        ${tracks
          .map(
            (track, index) => `
          <div class="track-item">
            <span class="track-number">${index + 1}.</span>
            <span class="track-info">
              <strong>${track.name}</strong> - ${track.artist.name}
            </span>
          </div>
        `
          )
          .join('')}
      </div>
    `;

    responseBox.appendChild(playerDiv);
    responseBox.scrollTop = responseBox.scrollHeight;
  },

  // Envoyer un message avec historique ET contexte enrichi
  async sendMessage(customMessage = null, showUserMessage = true) {
    const input = customMessage || document.getElementById('userInput')?.value;
    const responseBox = document.getElementById('response');

    if (!input || !input.trim()) {
      alert('⚠️ Veuillez entrer un message');
      return;
    }

    // Vérifier Puter
    if (typeof puter === 'undefined' || !puter.ai) {
      this.addMessage('❌ Puter AI non disponible', false);
      console.error('Puter non chargé');
      return;
    }

    // Afficher message utilisateur
    if (showUserMessage) {
      this.addMessage(input, true);
    }

    // Message de chargement
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message bot-message';
    loadingDiv.textContent = '⏳ PROCESSING...';
    loadingDiv.id = 'loading-message';
    responseBox.appendChild(loadingDiv);
    responseBox.scrollTop = responseBox.scrollHeight;

    // Enrichir le contexte avec les couleurs sélectionnées
    let contextEnrichi = input;

    if (AppState.chosenGradient.length > 0) {
      const selectedColors = AppState.chosenGradient
        .map((id) => {
          const c = this.getColorById(id.replace('product-', ''));
          return c ? c.name : null;
        })
        .filter(Boolean);

      if (selectedColors.length > 0) {
        contextEnrichi = `${input}

[CONTEXTE : L'utilisateur a sélectionné ces couleurs : ${selectedColors.join(', ')}]`;
      }
    }

    // Ajouter à l'historique
    this.conversationHistory.push({
      role: 'user',
      content: contextEnrichi,
    });

    try {
      console.log('📤 Envoi avec historique:', this.conversationHistory.length, 'messages');

      const result = await puter.ai.chat(contextEnrichi, {
        system: this.systemContext,
        messages: this.conversationHistory,
        temperature: 0.9,
        max_tokens: 500,
      });

      console.log('📥 Réponse:', result);

      document.getElementById('loading-message')?.remove();

      if (!result || String(result).trim() === '') {
        console.error('❌ Réponse vide');
        this.addMessage("❌ Réponse vide de l'API", false);
        return;
      }

      // Ajouter la réponse à l'historique
      this.conversationHistory.push({
        role: 'assistant',
        content: result,
      });

      // Afficher la réponse
      this.addMessage(String(result), false);

      // Vider l'input
      if (!customMessage) {
        const inputEl = document.getElementById('userInput');
        if (inputEl) inputEl.value = '';
      }
    } catch (error) {
      console.error('❌ Erreur:', error);
      document.getElementById('loading-message')?.remove();
      this.addMessage(`❌ ERREUR: ${error.message}`, false);
    }
  },

  // Demander infos sur une couleur avec contexte enrichi
  async askAboutColor(productId) {
    const colorId = productId.replace('product-', '');
    const color = this.getColorById(colorId);

    if (!color) {
      console.error('Couleur non trouvée:', productId, colorId);
      this.addMessage(`❌ Couleur ${productId} non trouvée`, false);
      return;
    }

    console.log('🎨 Couleur trouvée:', color);

    // Afficher un message court
    this.addMessage(`🎨 ${color.name}`, true);

    // Contexte enrichi avec couleurs déjà sélectionnées
    const selectedColors = AppState.chosenGradient
      .map((id) => {
        const c = this.getColorById(id.replace('product-', ''));
        return c ? c.name : null;
      })
      .filter(Boolean);

    const message = `Je viens de cliquer sur "${color.name}".

📌 INFORMATIONS :
💭 Mood : ${color.mood}
🎨 Dégradé : ${color.colors.join(' → ')}
🏷️ Associations : ${color.associations.join(', ')}
📝 ${color.description}

${
  selectedColors.length > 1
    ? `\n🎯 CONTEXTE : J'ai déjà sélectionné : ${selectedColors.join(', ')}\n`
    : ''
}

💬 MISSION :
1. Décris le MOOD et l'ambiance émotionnelle de "${color.name}"
2. Suggère 3 couleurs complémentaires avec NOMS POÉTIQUES (explique l'harmonie)
3. ${
      selectedColors.length > 1
        ? `Analyse l'harmonie avec mes couleurs (${selectedColors.join(', ')})`
        : 'Suggère un usage créatif (web, intérieur, mode...)'
    }
4. Termine par UNE question engageante

Reste conversationnel et inspirant ! 🌈`;

    // Envoyer le message
    await this.sendMessage(message, false);

    // Chercher de la musique si activé
    if (this.musicEnabled) {
      const tracks = await this.searchMusicByMood(color.mood, color.name);
      if (tracks) {
        this.createMusicPlayer(tracks, color.name);
      }
    }
  },

  // Analyser la palette sélectionnée
  async analyzePalette() {
    if (AppState.chosenGradient.length < 2) {
      this.addMessage('⚠️ Sélectionnez au moins 2 couleurs pour analyser la palette', false);
      return;
    }

    const colors = AppState.chosenGradient
      .map((id) => {
        const c = this.getColorById(id.replace('product-', ''));
        return c ? `${c.name} (${c.mood})` : null;
      })
      .filter(Boolean);

    const message = `Analyse ma palette actuelle : ${colors.join(' + ')}

🎨 PALETTE :
${AppState.chosenGradient
  .map((id) => {
    const c = this.getColorById(id.replace('product-', ''));
    return c ? `- ${c.name} : ${c.description}` : '';
  })
  .join('\n')}

💬 ANALYSE DEMANDÉE :
1. Quelle harmonie chromatique cette palette crée-t-elle ?
2. Quel mood/ambiance globale se dégage ?
3. Pour quel type de projet serait-elle parfaite ?
4. Une suggestion pour l'améliorer

Sois précis et inspirant ! 🌟`;

    await this.sendMessage(message, false);
  },

  // Ajouter un message
  addMessage(message, isUser = false) {
    const responseBox = document.getElementById('response');
    if (!responseBox) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = isUser ? 'message user-message' : 'message bot-message';
    messageDiv.textContent = message;
    responseBox.appendChild(messageDiv);
    responseBox.scrollTop = responseBox.scrollHeight;
  },

  // Effacer conversation
  clearConversation() {
    this.conversationHistory = [];
    const responseBox = document.getElementById('response');
    if (responseBox) responseBox.innerHTML = '';
    console.log('💬 Conversation et historique effacés');
  },

  // Initialiser
  async init() {
    console.log('🎨 Initialisation ChatManager...');

    await this.loadColors();

    // Bouton Envoyer
    const btnSend = document.getElementById('btn-send');
    if (btnSend) {
      btnSend.addEventListener('click', () => this.sendMessage());
      console.log('✅ Bouton Envoyer connecté');
    }

    // Enter dans input
    const userInput = document.getElementById('userInput');
    if (userInput) {
      userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.sendMessage();
      });
      console.log('✅ Input Enter connecté');
    }

    // Produits couleurs
    const products = document.querySelectorAll('[data-product="product"]');
    console.log(`🎨 ${products.length} couleurs trouvées`);

    products.forEach((product) => {
      product.addEventListener('click', (e) => {
        e.stopPropagation();
        const productId = product.id;
        const colorName = product.querySelector('.title-produits')?.textContent;
        console.log(`🎨 Clic: ${colorName} (${productId})`);
        this.askAboutColor(productId);
      });
    });

    console.log('✅ ChatManager prêt! Contexte enrichi activé 💬');
  },
};

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

// Demander des suggestions de couleurs par mood
function suggestColorsByMood(mood) {
  const message = `Je cherche des couleurs qui évoquent l'ambiance "${mood}". 
Peux-tu me suggérer 3-4 couleurs avec leurs noms poétiques et pourquoi elles correspondent à ce mood ?`;
  ChatManager.sendMessage(message);
}

// Demander un camaïeu
function askForMonochrome(colorName) {
  const message = `Crée-moi un camaïeu (variations monochromes) basé sur la couleur ${colorName}. 
Donne-moi 5 variations du plus clair au plus foncé avec des noms poétiques !`;
  ChatManager.sendMessage(message);
}

// Demander une palette saisonnière
function askForSeasonalPalette(season) {
  const message = `Crée-moi une palette de couleurs inspirée de ${season}. 
Donne des noms évocateurs et explique l'ambiance !`;
  ChatManager.sendMessage(message);
}

// ============================================
// GESTION DES ÉVÉNEMENTS
// ============================================
const EventsManager = {
  init() {
    // Click sur les produits
    AppState.products.forEach((product) => {
      product.addEventListener('click', () => {
        ProductManager.handleProductClick(product);
      });
    });

    // Bouton Start/Stop Carrousel
    const startButton = document.getElementById('start-carousel');
    if (startButton) {
      startButton.addEventListener('click', () => {
        if (AppState.chosenGradient.length < CONFIG.MIN_COLORS) {
          UIManager.showToast(`Sélectionnez au moins ${CONFIG.MIN_COLORS} couleurs d'abord`);
          return;
        }

        if (AppState.carrouselRunning) {
          CarouselManager.stop();
          UIManager.showToast('Carrousel arrêté');
        } else {
          CarouselManager.start();
        }
      });
    }

    // Bouton Reset
    const resetButton = document.getElementById('reset-all');
    if (resetButton) {
      resetButton.addEventListener('click', () => {
        CarouselManager.stop();
        StorageManager.clear();
        ChatManager.clearConversation();
        location.reload();
      });
    }
  },
};

// ============================================
// INITIALISATION UNIQUE
// ============================================

// Attendre que Puter soit chargé
async function waitForPuter() {
  return new Promise((resolve) => {
    if (typeof puter !== 'undefined' && puter.ai) {
      resolve();
    } else {
      const check = setInterval(() => {
        if (typeof puter !== 'undefined' && puter.ai) {
          clearInterval(check);
          resolve();
        }
      }, 100);

      setTimeout(() => {
        clearInterval(check);
        console.error('❌ Timeout: Puter non chargé');
        resolve();
      }, 10000);
    }
  });
}

// Initialisation complète de l'application
async function initApp() {
  console.log("🚀 Initialisation de l'application...");

  // Charger les données JSON
  await DataManager.loadColorsData();

  // Restaurer l'état sauvegardé
  UIManager.restoreGradient();
  ProductManager.restoreSelectedProducts();

  // Initialiser les animations
  AnimationManager.init();

  // Initialiser les événements
  EventsManager.init();

  // Attendre Puter puis initialiser ChatManager
  await waitForPuter();
  await ChatManager.init();

  console.log('✅ Application prête avec contexte enrichi! 🎨');
}

// Lancement au chargement de la page
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Export des fonctions utiles
window.ChatManager = ChatManager;
window.AppState = AppState;
window.suggestColorsByMood = suggestColorsByMood;
window.askForMonochrome = askForMonochrome;
window.askForSeasonalPalette = askForSeasonalPalette;

console.log('🎨 Script corrigé chargé!');
