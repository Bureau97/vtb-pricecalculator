var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
class VtbPriceCalculatorDataPriceParticipant {
    constructor() {
        this.participant_id = '';
        this.price = 0.0;
    }
}
export class VtbPriceCalculatorDataPriceElement {
    constructor() {
        this.price = 0.0;
        this.optional = false;
        this.nights = 0;
        this.hidden = false;
    }
}
export class FilterConfig {
    constructor() {
        this.segments = [];
        this.units = [];
        this.participants = [];
    }
}
export class VtbPriceCalculatorData {
    filter(config) {
        const price_elements = [];
        const _segment_ids = (config === null || config === void 0 ? void 0 : config.segments) || Object.keys(this._data);
        const segment_ids = _segment_ids.flat(Infinity);
        const _unit_ids = (config === null || config === void 0 ? void 0 : config.units) || [];
        const unit_ids = _unit_ids.flat(Infinity);
        const _participant_ids = (config === null || config === void 0 ? void 0 : config.participants) || [];
        const participant_ids = _participant_ids.flat(Infinity);
        let check_unit_ids = false;
        if (unit_ids.length >= 1) {
            check_unit_ids = true;
        }
        let check_participant_ids = false;
        if (participant_ids.length >= 1) {
            check_participant_ids = true;
        }
        let skip_optional = false;
        if ((config === null || config === void 0 ? void 0 : config.optional) === false) {
            skip_optional = true;
        }
        let only_optional = false;
        if ((config === null || config === void 0 ? void 0 : config.optional) === true) {
            only_optional = true;
        }
        for (const segment_id of segment_ids) {
            const segment = this._data[Number(segment_id)];
            for (const unit_id of Object.keys(segment)) {
                if (!check_unit_ids ||
                    (check_unit_ids && unit_ids.includes(Number(unit_id)))) {
                    if (!skip_optional && !check_participant_ids && !only_optional) {
                        price_elements.push(...segment[unit_id]);
                        continue;
                    }
                    // additional checks
                    const units = segment[unit_id].map((u) => {
                        // check on optional
                        if ((skip_optional && u.optional) ||
                            (only_optional && !u.optional)) {
                            return;
                        }
                        // if no check for participants is required
                        if (!check_participant_ids) {
                            return u;
                        }
                        // check participants
                        if (check_participant_ids && u.participants) {
                            // make a shallow copy so we're not messing with the original price element
                            const u_copy = { ...u };
                            let participants_unit_price = 0.0;
                            for (const p of u.participants) {
                                if (participant_ids.includes(p.participant_id.toString())) {
                                    participants_unit_price += p.price;
                                }
                            }
                            u_copy.price = participants_unit_price;
                            return u_copy;
                        }
                        return;
                    });
                    price_elements.push(...units);
                }
            }
        }
        return price_elements;
    }
    calculate(elements) {
        let total = 0.0;
        for (const element of elements) {
            if (!element.optional) {
                total += element.price;
            }
        }
        return total;
    }
    load(vtbSrcData) {
        const parsed_data = {}; // eslint-disable-line @typescript-eslint/no-explicit-any
        for (const segment of vtbSrcData.segments) {
            if (!(segment.typeId in parsed_data)) {
                parsed_data[segment.typeId] = {};
            }
            for (const element of segment.elements) {
                if (!(element.unitId in parsed_data[segment.typeId])) {
                    parsed_data[segment.typeId][element.unitId] = [];
                }
                const price_element = this.parseVtbElement(element, segment.title);
                parsed_data[segment.typeId][element.unitId].push(price_element);
            }
        }
        this._data = parsed_data;
        return this;
    }
    parseVtbElement(element, grouptitle) {
        var _a;
        const price_element = new VtbPriceCalculatorDataPriceElement();
        price_element.title = element.title;
        price_element.subtitle = element.subTitle;
        price_element.optional = element.optional;
        price_element.price = parseFloat(element.olPrices.salesTotal || 0);
        price_element.nights = element.flexNights || element.nights;
        price_element.day = element.day;
        price_element.unitid = element.unitId;
        price_element.grouptitle = grouptitle;
        price_element.participants = [];
        for (const participant_id of Object.keys(element.olPrices.participants)) {
            const participant_element = new VtbPriceCalculatorDataPriceParticipant();
            participant_element.participant_id = participant_id;
            participant_element.price = parseFloat(((_a = element.olPrices.participants[participant_id]) === null || _a === void 0 ? void 0 : _a.salesPrice) || 0);
            price_element.participants.push(participant_element);
        }
        return price_element;
    }
}
let VtbPriceCalculatorElement = class VtbPriceCalculatorElement extends LitElement {
    constructor() {
        super(...arguments);
        this.locale = 'nl-NL';
        this.currency = 'EUR';
        this.price = 0;
        this.priceType = 'pp';
        this.displayPrice = false;
        this.displayPricesIfZero = false;
    }
    render() {
        const priceRenderer = new Intl.NumberFormat(this.locale, {
            style: 'currency',
            currency: this.currency,
        });
        let priceDisplay = '';
        if (this.displayPrice && typeof this.displayPrice == 'boolean') {
            priceDisplay = priceRenderer.format(this.price);
        }
        if (!this.displayPrice && typeof this.displayPrice == 'boolean') {
            priceDisplay = '';
        }
        if (this.displayPrice && typeof this.displayPrice == 'string') {
            priceDisplay = this.displayPrice;
        }
        if (this.displayPrice &&
            typeof this.displayPrice == 'boolean' &&
            this.price == 0 &&
            !this.displayPricesIfZero) {
            priceDisplay = '';
        }
        return html `
      <div class="price-calculator-element">
        <div class="description">
          <slot></slot>
        </div>
        <div class="price">${priceDisplay} &nbsp;</div>
      </div>
    `;
    }
};
VtbPriceCalculatorElement.styles = css `
    .price-calculator-element:after {
      content: '';
      display: block;
      clear: both;
    }

    .price-calculator-element > div {
      float: left;
    }

    .description {
      width: 70%;
    }

    .price {
      width: 30%;
      text-align: right;
    }

    h3 {
      display: block;
    }
  `;
__decorate([
    property({ type: String })
], VtbPriceCalculatorElement.prototype, "locale", void 0);
__decorate([
    property({ type: String })
], VtbPriceCalculatorElement.prototype, "currency", void 0);
__decorate([
    property({ type: Number })
], VtbPriceCalculatorElement.prototype, "price", void 0);
__decorate([
    property({ type: String, attribute: 'price-type' })
], VtbPriceCalculatorElement.prototype, "priceType", void 0);
__decorate([
    property({
        type: String,
        attribute: 'display-price',
        converter: (value, _type) => {
            if (typeof value == 'string' && value == 'true') {
                return true;
            }
            if (typeof value == 'string' && value == 'false') {
                return false;
            }
            if (typeof value == 'boolean') {
                return value;
            }
            if (value) {
                return value.toString();
            }
            return false;
        },
    })
], VtbPriceCalculatorElement.prototype, "displayPrice", void 0);
__decorate([
    property({
        type: Boolean,
        attribute: 'display-zero',
        converter: (value, _type) => {
            if (typeof value == 'string' && value == 'true') {
                return true;
            }
            if (typeof value == 'string' && value == 'false') {
                return false;
            }
            if (typeof value == 'boolean') {
                return value;
            }
            if (value) {
                return true;
            }
            return false;
        },
    })
], VtbPriceCalculatorElement.prototype, "displayPricesIfZero", void 0);
VtbPriceCalculatorElement = __decorate([
    customElement('vtb-pricecalculator-element')
], VtbPriceCalculatorElement);
export { VtbPriceCalculatorElement };
let VtbPriceCalculatorElementList = class VtbPriceCalculatorElementList extends LitElement {
    constructor() {
        super(...arguments);
        this.calculateTotals = false;
        this.displayTotals = false;
        this.displayPrices = false;
        this.displayPricesIfZero = false;
        this.locale = 'nl-NL';
        this.currency = 'EUR';
        this.totalPrice = 0;
    }
    render() {
        return html `
      <div class="price-calculator-element-list">
        <h3>${this.title}</h3>
        <div class="">
          <slot></slot>
        </div>
      </div>
    `;
    }
};
VtbPriceCalculatorElementList.styles = css `
    :host {
      display: block;
    }
  `;
__decorate([
    property({ type: Boolean, attribute: 'calculate-totals' })
], VtbPriceCalculatorElementList.prototype, "calculateTotals", void 0);
__decorate([
    property({ type: Boolean, attribute: 'display-totals' })
], VtbPriceCalculatorElementList.prototype, "displayTotals", void 0);
__decorate([
    property({ type: Boolean, attribute: false })
], VtbPriceCalculatorElementList.prototype, "displayPrices", void 0);
__decorate([
    property({ type: Boolean, attribute: 'display-zero' })
], VtbPriceCalculatorElementList.prototype, "displayPricesIfZero", void 0);
__decorate([
    property({ type: String })
], VtbPriceCalculatorElementList.prototype, "locale", void 0);
__decorate([
    property({ type: String })
], VtbPriceCalculatorElementList.prototype, "currency", void 0);
__decorate([
    property({ type: Number, attribute: 'total-price' })
], VtbPriceCalculatorElementList.prototype, "totalPrice", void 0);
VtbPriceCalculatorElementList = __decorate([
    customElement('vtb-pricecalculator-list')
], VtbPriceCalculatorElementList);
export { VtbPriceCalculatorElementList };
let VtbPriceCalculator = class VtbPriceCalculator extends LitElement {
    constructor() {
        super(...arguments);
        this.calculateTotals = false;
        this.displayTotals = false;
        this.locale = 'nl-NL';
        this.currency = 'EUR';
        this.totalPrice = 0;
        this.customStyles = '';
        this.groups = ['elements', 'surcharges', 'optionals'];
        this.showPerParticipant = false;
    }
    render() {
        let slotHTML = '';
        if (this.children.length == 0 && this.priceData) {
            slotHTML = this._renderPriceData();
        }
        let customStyles;
        if (this.customStyles) {
            customStyles = html `
                <style type=text/css>${this.customStyles}</style>
            `;
        }
        return html `
      ${customStyles}
      <div class="price-calculator">
        <slot>${slotHTML}</slot>
        ${this.renderTotals()}
      </div>
    `;
    }
    renderTotals() {
        if (this.displayTotals) {
            return html `
        <div class="price-calculator-totals">
          <vtb-pricecalculator-element
            price=${this.totalPrice}
            currency=${this.currency}
            locale=${this.locale}
            display-price="true"
          >
            Totaal
          </vtb-pricecalculator-element>
        </div>
      `;
        }
        return '';
    }
    renderElementDescription(element) {
        return `${element.nights + 1} dgn. - ${element.title}`;
    }
    _renderPriceData() {
        const priceData = this
            .priceData;
        return html `
      <vtb-pricecalculator-list title=${ifDefined(this.title)}>
        ${this._renderPriceList(priceData)}
      </vtb-pricecalculator-list>
    `;
    }
    _renderPriceList(priceList) {
        const elementTemplates = [];
        for (const element of priceList) {
            if (element.hidden) {
                continue;
            }
            elementTemplates.push(html `
          <vtb-pricecalculator-element
            price=${element.price}
            currency=${this.currency}
            price-type=""
            display-price="true"
          >
            ${this.renderElementDescription(element)}
          </vtb-pricecalculator-element>
        `);
        }
        return elementTemplates;
    }
};
VtbPriceCalculator.styles = css `
    :host {
      display: block;
    }

    .price-calculator-totals {
      font-weight: bold;
      font-size: 110%;
      border-top: 1px solid #444;
      margin-top: 1rem;
      padding-top: 1rem;
    }
  `;
__decorate([
    property({ type: Boolean, attribute: 'calculate-totals' })
], VtbPriceCalculator.prototype, "calculateTotals", void 0);
__decorate([
    property({ type: Boolean, attribute: 'display-totals' })
], VtbPriceCalculator.prototype, "displayTotals", void 0);
__decorate([
    property({ type: String })
], VtbPriceCalculator.prototype, "locale", void 0);
__decorate([
    property({ type: String })
], VtbPriceCalculator.prototype, "currency", void 0);
__decorate([
    property({ type: Number, attribute: 'total-price' })
], VtbPriceCalculator.prototype, "totalPrice", void 0);
__decorate([
    property({ type: String, attribute: false })
], VtbPriceCalculator.prototype, "customStyles", void 0);
__decorate([
    property({ type: Array, attribute: false })
], VtbPriceCalculator.prototype, "priceData", void 0);
__decorate([
    property({ type: Array, attribute: false })
], VtbPriceCalculator.prototype, "groups", void 0);
__decorate([
    property({ type: Boolean, attribute: false })
], VtbPriceCalculator.prototype, "showPerParticipant", void 0);
VtbPriceCalculator = __decorate([
    customElement('vtb-pricecalculator')
], VtbPriceCalculator);
export { VtbPriceCalculator };
//# sourceMappingURL=vtb-pricecalculator.js.map