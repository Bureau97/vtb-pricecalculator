import '../vtb-pricecalculator';

import {
  VtbPriceCalculatorData,
  VtbPriceCalculator,
} from '../vtb-pricecalculator';

const travelplan_source_url = '/optionals.json';

async function loadTravelplanData(sourceurl: string) {
  const response = await fetch(sourceurl);
  const data = await response.json();
  return data;
}

// class SegmentTypes {
//   readonly ADDITIONEEL: Array<number> = [3];
//   readonly ARRANGEMENT: Array<number> = [1];
//   readonly CARRENTAL: Array<number> = [7];
//   readonly HIDE: Array<number> = [8];
//   readonly FLIGHT: Array<number> = [4];
//   readonly FLIGHT_ADDITIONAL: Array<number> = [6];

//   readonly INTRO: Array<number> = [12];
//   readonly PRAKTISCH: Array<number> = [13];
//   readonly REISBESCHEIDEN: Array<number> = [19];
//   readonly AANVULLINGEN: Array<number> = [14];
// }

class SegmentTypesOptional {
  readonly ADDITIONEEL: Array<number> = [3];
  readonly ARRANGEMENT: Array<number> = [13];
  readonly CARRENTAL: Array<number> = [15];
  readonly HIDE: Array<number> = [9];
  readonly FLIGHT: Array<number> = [2, 14];
  readonly FLIGHT_ADDITIONAL: Array<number> = [6, 18];
  readonly NATIONAL_FLIGHT: Array<number> = [14];
  readonly AREA: Array<number> = [13];
  readonly INCLUSIVE: Array<number> = [7];

  readonly INTRO: Array<number> = [12];
  readonly PRAKTISCH: Array<number> = [13];
  readonly REISBESCHEIDEN: Array<number> = [19];
  readonly AANVULLINGEN: Array<number> = [14, 16];
}

const segmentTypes = new SegmentTypesOptional();

// class UnitTypes {
//   readonly FLIGHT: Array<number> = [6, 18];
//   readonly CARRENTAL: Array<number> = [5];
//   readonly MAAL: Array<number> = [3];
//   readonly NACHTEN: Array<number> = [2];
//   readonly INTRO_TEXT: Array<number> = [19];
//   readonly TEXT: Array<number> = [13];
//   readonly VRIJE_DAGEN_TEXT: Array<number> = [11];
// }

class UnitTypesOptional {
  readonly FLIGHT: Array<number> = [12];
  readonly FLIGHT_ADDITIONAL: Array<number> = [18];
  readonly CARRENTAL: Array<number> = [10];
  readonly MAAL: Array<number> = [3];
  readonly ACCO: Array<number> = [2];
  readonly EXCURSION: Array<number> = [17];
  readonly INTRO_TEXT: Array<number> = [19];
  readonly TEXT: Array<number> = [7];
  readonly VRIJE_DAGEN_TEXT: Array<number> = [11];
}

const unitTypes = new UnitTypesOptional();

async function documentDomLoaded() {
  const travelplanData = await loadTravelplanData(travelplan_source_url);
  const calculator = new VtbPriceCalculatorData().load(travelplanData);

  const additions_elements = calculator.filter({
    segments: [segmentTypes.ADDITIONEEL],
    // units: [unitTypes.additions],
    // optional: false,
    // participants: ['1211769']
  });
  const additions_total = calculator.calculate(additions_elements);

  const additionsTable = document.getElementById(
    'calc-dynamic-additions'
  ) as VtbPriceCalculator;
  additionsTable.renderElementDescription = function (element) {
    return `${element.title}`;
  };
  additionsTable.displayTotals = false;
  additionsTable.priceData = additions_elements;
  additionsTable.totalPrice = additions_total;

  const acco_elements = calculator.filter({
    segments: [segmentTypes.ARRANGEMENT],
    units: [unitTypes.ACCO],
    // optional: false,
  });
  console.info(acco_elements);

  const acco_total = calculator.calculate(acco_elements);

  const accoTable = document.getElementById(
    'calc-dynamic-accos'
  ) as VtbPriceCalculator;
  accoTable.renderElementDescription = function (element) {
    console.info(element);
    return `Dag: ${element.day} / ${element.nights} ${element.nights == 1 ? 'nacht' : 'nachten'} - ${
      element.title
    } (kamertype: ${element.subtitle}) ${element.optional ? '[optioneel]' : ''} (${element.price})`;
  };
  accoTable.getElementPrice = function (element) {
    return `${element.optional ? element.price_diff : element.price}`;
  }
  accoTable.displayTotals = false;
  accoTable.priceData = acco_elements;
  accoTable.totalPrice = acco_total;

  const carrental_elements = calculator.filter({
    segments: [segmentTypes.CARRENTAL],
    // units: [unitTypes.NACHTEN]
  });
  console.info('carrental_elements', carrental_elements);
  const carrental_total = calculator.calculate(carrental_elements);

  const carrentalTable = document.getElementById(
    'calc-dynamic-carrental'
  ) as VtbPriceCalculator;
  carrentalTable.renderElementDescription = (element) =>
    `${element.nights + 1} dgn. ${element.subtitle?.replace('Type', '')} ${element.optional ? '[optioneel]' : ''} (${element.price})`;
  carrentalTable.getElementPrice = function (element) {
    return `${element.optional ? element.price_diff : element.price}`;    
  }
  carrentalTable.displayTotals = false;
  carrentalTable.priceData = carrental_elements;
  carrentalTable.totalPrice = carrental_total;

  const flight_elements = calculator.filter({
    segments: [segmentTypes.FLIGHT],
    // units: [unitTypes.NACHTEN]
  });
  const flight_total = calculator.calculate(flight_elements);

  const flightTable = document.getElementById(
    'calc-dynamic-flight'
  ) as VtbPriceCalculator;
  flightTable.renderElementDescription = function (element) {
    if (element.subtitle) {
      return `${element.subtitle} ${element.optional ? '[optioneel]' : ''}`;
    }
    return `${element.grouptitle} ${element.optional ? '[optioneel]' : ''}`;
  };
  flightTable.displayTotals = false;
  flightTable.priceData = flight_elements;
  flightTable.totalPrice = flight_total;

  const flightAdditional_elements = calculator.filter({
    segments: [segmentTypes.FLIGHT_ADDITIONAL],
    // units: [unitTypes.NACHTEN]
  });
  const flightAdditional_total = calculator.calculate(
    flightAdditional_elements
  );

  const flightAdditionalTable = document.getElementById(
    'calc-dynamic-flightadditional'
  ) as VtbPriceCalculator;
  flightAdditionalTable.renderElementDescription = function (element) {
    if (element.subtitle) {
      return `${element.subtitle}`;
    }

    return `${element.title}`;
  };
  flightAdditionalTable.displayTotals = false;
  flightAdditionalTable.priceData = flightAdditional_elements;
  flightAdditionalTable.totalPrice = flightAdditional_total;

  // const flightTotal_elements = [...flight_elements, ...flightAdditional_elements];
  // const flightTotal_total = calculator.calculate(flightTotal_elements);

  // const flightTotalTable = document.getElementById('calc-dynamic-flighttotal') as VtbPriceCalculator;
  // flightTotalTable.renderElementDescription = function (element) {
  //   if (element.subtitle) {
  //     return `${element.subtitle}`;
  //   }

  //   return `${element.title}`;
  // }
  // flightTotalTable.displayTotals = true;
  // flightTotalTable.priceData = [];
  // flightTotalTable.totalPrice = flightTotal_total;

  const test_elements = calculator.filter({
    segments: [segmentTypes.ARRANGEMENT],
    units: [unitTypes.MAAL],
    participants: ['1211769'],
  });

  const test_total = calculator.calculate(
    calculator.filter({
      optional: false,
    })
  );

  const testTable = document.getElementById(
    'calc-dynamic-test'
  ) as VtbPriceCalculator;
  testTable.renderElementDescription = function (element) {
    if (element.subtitle) {
      return `${element.subtitle}`;
    }

    return `${element.title}`;
  };
  testTable.displayTotals = true;
  testTable.priceData = test_elements;
  testTable.totalPrice = test_total;

  // priceData.elements.displayPrices = true;
  // priceData.optionals.title = 'Opties en upgrades';
  // priceData.optionals.displayPrices = true;
  // priceData.optionals.displayPricesIfZero = false;

  // priceData.surcharges.title = 'Toeslagen';
  // priceData.surcharges.displayPrices = true;
  // priceData.surcharges.displayPricesIfZero = true;

  // const pricecalculator = container as VtbPriceCalculator;
  // if (pricecalculator) {
  //   pricecalculator.priceData = {
  //     elements.;
  // }
}

document.addEventListener('DOMContentLoaded', documentDomLoaded);
