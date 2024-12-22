const axios = require('axios');

// Fetch crypto price from CoinGecko API
async function fetchCryptoPrice(symbol) {
  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${symbol.toLowerCase()}&vs_currencies=usd`
    );
    return response.data[symbol.toLowerCase()]?.usd || 0;
  } catch (error) {
    console.error('Error fetching crypto price:', error);
    return 0;
  }
}

// Fetch forex price from ExchangeRate API
async function fetchForexPrice(symbol) {
  try {
    const response = await axios.get(
      `https://api.exchangerate-api.com/v4/latest/USD`
    );
    return response.data.rates[symbol.toUpperCase()] || 0;
  } catch (error) {
    console.error('Error fetching forex price:', error);
    return 0;
  }
}

module.exports = {
  fetchCryptoPrice,
  fetchForexPrice
};
