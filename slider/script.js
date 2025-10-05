const products = document.querySelectorAll('[data-product]');
console.log(products);
const chosenGradient = [];
const menu = document.querySelector('.menu');
// creation d'un carrusel pou la selection des diferents produits (couleurs)
let carrouselRunning = false;

// Au chargement de la page, appliquer le dégradé sauvegardé

window.addEventListener('DOMContentLoaded', () => {
  const saveGradient = localStorage.getItem('gradient');
  if (saveGradient) {
    menu.style.background = saveGradient;
  }

  //  Restaurer les produits sélectionnés
  const savedProducts = localStorage.getItem('chosenProducts');
  if (savedProducts) {
    const productIds = JSON.parse(savedProducts);

    // Remplir le tableau chosenGradient
    chosenGradient.push(...productIds);

    // Remettre la classe "selected" sur chaque produit
    productIds.forEach((id) => {
      const product = document.getElementById(id);
      if (product) {
        product.classList.add('selected');
      }
    });

    console.log('Produits restaurés:', chosenGradient);
  }

  initAnimation();
});

products.forEach((product) => {
  product.addEventListener('click', () => {
    const productId = product.id;
    const gradient = window.getComputedStyle(product).background;

    menu.style.background = gradient;

    //si l'id n'est pas présente :
    if (!chosenGradient.includes(productId)) {
      chosenGradient.push(productId);
      product.classList.add('selected');

      if (chosenGradient.length === 1) {
        showToast('💡 Sélectionnez une 2ème couleur pour démarrer le carrousel');
      } else if (chosenGradient.length === 2) {
        // ⭐ MODIFIÉ - Nouveau message pour le 2ème produit
        showToast('Prêt ! Cliquez sur LANCER LE CARROUSEL');
      }
    }

    console.log('Produit cliqué:', productId);
    console.log('Historique:', chosenGradient);

    // if (chosenGradient.length >= 2) {
    //   stopCarrousel();
    //   startCarrousel();
    // } else {
    //   stopCarrousel();
    // }

    // document.body.style.background = gradient;

    localStorage.setItem('chosenProducts', JSON.stringify(chosenGradient));
    localStorage.setItem('gradient', gradient);
  });
});

// sleep function pour le carrousel (utilisation de async/await) defilement d'images. (couleurs)
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function startCarrousel() {
  if (chosenGradient.length < 2) {
    showToast('Sélectionnez au moins 2 couleurs pour le carrousel');
    return;
  }
  const startButton = document.getElementById('start-carousel');

  carrouselRunning = true;
  let currentIndex = 0;

  startButton.textContent = 'ARRÊTER LE CARROUSEL';
  showToast('Carrousel démarré');
  console.log('Carrousel démarré avec les couleurs :', chosenGradient);

  while (carrouselRunning) {
    await sleep(5000);

    // Retirer la classe "active-carousel" de tous les produits
    document.querySelectorAll('.product').forEach((p) => {
      p.classList.remove('active-carousel');
    });

    currentIndex = (currentIndex + 1) % chosenGradient.length;

    const productId = chosenGradient[currentIndex];
    const product = document.getElementById(productId);
    const gradient = window.getComputedStyle(product).background;

    // Ajouter la classe "active-carousel" au produit actuel
    product.classList.add('active-carousel');

    menu.style.background = gradient;
    localStorage.setItem('gradient', gradient);
    console.log(`Gradient ${currentIndex + 1}/${chosenGradient.length}`);
  }

  // Nettoyer quand le carrousel s'arrête
  startButton.textContent = 'LANCER LE CARROUSEL';
  document.querySelectorAll('.product').forEach((p) => {
    p.classList.remove('active-carousel');
  });

  console.log('Carrousel arrêté');
}

function stopCarrousel() {
  carrouselRunning = false;
}

function showToast(message, duration = 3000) {
  // Créer le toast
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  // Afficher avec animation
  setTimeout(() => toast.classList.add('show'), 10);

  // Masquer et supprimer après X secondes
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Gestion des boutons pour lancer/arrêter le carrousel et réinitialiser
const startButton = document.getElementById('start-carousel');
const resetButton = document.getElementById('reset-all');

startButton.addEventListener('click', () => {
  if (chosenGradient.length < 2) {
    showToast("Sélectionnez au moins 2 couleurs d'abord");
    return;
  }

  if (carrouselRunning) {
    stopCarrousel();
    showToast('Carrousel arrêté');
  } else {
    startCarrousel();
  }
});

resetButton.addEventListener('click', () => {
  stopCarrousel();
  localStorage.clear();
  location.reload();
});

// Animation test pour rajouter du dynamisme (anime.js)

function initAnimation() {
  if (typeof anime === 'undefined') {
    console.error("❌ anime.js n'est pas chargé !");
    return;
  }

  const h2Element = document.querySelector('h2');
  if (!h2Element) {
    console.error('❌ Aucun h2 trouvé !');
    return;
  }

  splitTextIntoChars('h2');

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
}

function splitTextIntoChars(selector) {
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
}
