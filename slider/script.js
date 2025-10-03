const products = document.querySelectorAll('[data-product]');
console.log(products);
const chosenGradient = [];

const prod = document.getElementById('1');
console.log(prod);

// const article = document.querySelector("#electric-cars");

window.addEventListener('DOMContentLoaded', () => {
  const saveGradient = localStorage.getItem('gradient');
  if (saveGradient) {
    document.body.style.background = saveGradient;
  }
});

products.forEach((product) => {
  product.addEventListener('click', function () {
    const productId = this.id;

    // si l'id n'est pas présente :
    // if (!chosenGradient.includes(productId)) {
    //   chosenGradient.push(productId);
    // }
    console.log(productId);

    chosenGradient.push(productId);
    console.table(chosenGradient);
    const gradient = window.getComputedStyle(this).background;
    document.body.style.background = gradient;
    localStorage.setItem('chosenProducts', JSON.stringify(chosenGradient));
    localStorage.setItem('gradient', gradient);
  });
});
