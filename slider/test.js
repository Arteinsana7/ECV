// const word = 'chien';
// const wordSplited = word.split('');
// const Word2 = 'niche';
// const word2Splited = Word2.split('');

// console.log(word2Splited.sort());

// console.log(wordSplited);

// const sortedWord = wordSplited.sort().join('-');

// const number = [10, 33, 2, 100, 7, 2];
// console.log(number.sort((a, b) => a - b));

// Emplacement pour afficher les données
const boxTxt = document.querySelector('#boxTxt');
// const myUrl= 'https://blockchain.info/ticker';
const myUrl2 =
  'https://best-daily-astrology-and-horoscope-api.p.rapidapi.com/api/Detailed-Horoscope/?zodiacSign=leo';
let previousValue;

const getHoroscope = async (url) => {
  // Fetch nécessite 2 choses : 1 url et 1 objet js
  const myRequest = await fetch(url, { method: 'GET' });
  console.log(myRequest);
  if (!myRequest.ok) {
    alert('Error');
  } else {
    let data = await myRequest.json();
    console.log(data);
    // console.log(data.EUR);
    // console.log(data.EUR.buy);
    // document.querySelector('#boxTxt').textContent = `${data.EUR.last} €`;
  }
};
// setInterval(getBitcoinValue, 1000, myUrl);
getBitcoinValue(myUrl2);
