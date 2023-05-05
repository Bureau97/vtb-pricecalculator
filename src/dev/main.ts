import '../vtb-pricecalculator';

import {
  VtbPriceCalculatorDataTransformer,
  VtbPriceCalculator,
} from '../vtb-pricecalculator';

async function loadTravelplanData() {
  const response = await fetch('/travelplan.json');
  const data = await response.json();
  return data;
}

async function renderPricecalculator(
  container: HTMLElement | VtbPriceCalculator | null
) {
  const travelplanData = await loadTravelplanData();
  const priceData = new VtbPriceCalculatorDataTransformer().load(
    travelplanData
  );

  // priceData.elements.displayPrices = true;
  priceData.optionals.title = 'Opties en upgrades';
  priceData.optionals.displayPrices = true;
  priceData.optionals.displayPricesIfZero = false;

  priceData.surcharges.title = 'Toeslagen';
  priceData.surcharges.displayPrices = true;
  priceData.surcharges.displayPricesIfZero = true;

  const pricecalculator = container as VtbPriceCalculator;
  if (pricecalculator) {
    pricecalculator.priceData = priceData;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const calculator: HTMLElement | VtbPriceCalculator | null =
    document.getElementById('calc-dynamic');
  renderPricecalculator(calculator);
});
