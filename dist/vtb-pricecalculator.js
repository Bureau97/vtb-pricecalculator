var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
// import {styleMap, StyleInfo} from 'lit/directives/style-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
export var VtbSegmentTypes;
(function (VtbSegmentTypes) {
    VtbSegmentTypes[VtbSegmentTypes["DESTINATION"] = 1] = "DESTINATION";
    VtbSegmentTypes[VtbSegmentTypes["FLIGHT"] = 2] = "FLIGHT";
    VtbSegmentTypes[VtbSegmentTypes["ADDITIONAL"] = 3] = "ADDITIONAL";
    VtbSegmentTypes[VtbSegmentTypes["HIDDEN"] = 4] = "HIDDEN";
})(VtbSegmentTypes || (VtbSegmentTypes = {}));
export var VtbUnitTypes;
(function (VtbUnitTypes) {
    VtbUnitTypes[VtbUnitTypes["ACCO"] = 2] = "ACCO";
    VtbUnitTypes[VtbUnitTypes["TRANSPORT"] = 4] = "TRANSPORT";
    VtbUnitTypes[VtbUnitTypes["TRANSFER"] = 5] = "TRANSFER";
    VtbUnitTypes[VtbUnitTypes["CARRENTAL"] = 6] = "CARRENTAL";
    VtbUnitTypes[VtbUnitTypes["SURCHARGE"] = 11] = "SURCHARGE";
})(VtbUnitTypes || (VtbUnitTypes = {}));
export class VtbPriceCalculatorDataPriceElement {
    constructor() {
        this.price = 0.0;
        this.optional = false;
        this.nights = 0;
        this.hidden = false;
    }
}
export class VtbPriceCalculatorDataPriceList {
    constructor() {
        this.total = 0.0;
        this.displayPrices = false;
        this.displayPricesIfZero = false;
        this._elements = [];
        this.title = '';
    }
    addElement(element) {
        var _a;
        (_a = this._elements) === null || _a === void 0 ? void 0 : _a.push(element);
        if (!element.optional) {
            this.total += element.price;
        }
        return this;
    }
    getElements() {
        return this._elements;
    }
}
export class VtbPriceCalculatorData {
    constructor() {
        this.elements = new VtbPriceCalculatorDataPriceList();
        this.optionals = new VtbPriceCalculatorDataPriceList();
        this.surcharges = new VtbPriceCalculatorDataPriceList();
        this.per_participant = [];
    }
    getTotalPrice() {
        let totals = 0.0;
        if (this.elements) {
            totals += this.elements.total;
        }
        if (this.surcharges) {
            totals += this.surcharges.total;
        }
        return totals;
    }
}
export class VtbPriceCalculatorDataTransformer {
    load(vtbSrcData) {
        var _a, _b, _c;
        const _data = new VtbPriceCalculatorData();
        for (const segment of vtbSrcData.segments) {
            for (const element of segment.elements) {
                const _element = this.parseVtbElement(element);
                if (segment.typeId == VtbSegmentTypes.DESTINATION ||
                    segment.typeId == VtbSegmentTypes.FLIGHT) {
                    if (_element.optional) {
                        (_a = _data.optionals) === null || _a === void 0 ? void 0 : _a.addElement(_element);
                    }
                    else {
                        (_b = _data.elements) === null || _b === void 0 ? void 0 : _b.addElement(_element);
                    }
                }
                if (segment.typeId == VtbSegmentTypes.ADDITIONAL ||
                    segment.typeId == VtbSegmentTypes.HIDDEN) {
                    _element.hidden = segment.typeId == VtbSegmentTypes.HIDDEN;
                    (_c = _data.surcharges) === null || _c === void 0 ? void 0 : _c.addElement(_element);
                }
            }
        }
        return _data;
    }
    parseVtbElement(element) {
        const _element = new VtbPriceCalculatorDataPriceElement();
        _element.title = element.title;
        _element.optional = element.optional;
        _element.price = parseFloat(element.olPrices.salesTotal || 0);
        _element.nights = element.flexNights || element.nights;
        return _element;
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
        let _innerHTML = '';
        if (this.children.length == 0 && this.priceData) {
            _innerHTML = this._renderPriceData();
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
        <slot>${_innerHTML}</slot>
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
    _renderPriceList(priceList) {
        const elementTemplates = [];
        for (const element of priceList.getElements()) {
            if (element.hidden) {
                continue;
            }
            elementTemplates.push(html `
          <vtb-pricecalculator-element
            price=${element.price}
            currency=${this.currency}
            price-type=""
            display-price=${ifDefined(priceList.displayPrices)}
            display-zero=${ifDefined(priceList.displayPricesIfZero)}
          >
            ${element.title}
          </vtb-pricecalculator-element>
        `);
        }
        return elementTemplates;
    }
    _renderPriceData() {
        const priceData = this.priceData;
        const listTemplates = [];
        for (const group of this.groups) {
            const _group = group;
            const priceList = priceData[_group];
            listTemplates.push(html `
          <vtb-pricecalculator-list
            title=${ifDefined(priceList.title)}
          >
            ${this._renderPriceList(priceList)}
          </vtb-pricecalculator-list>
        `);
        }
        // if (this.showPerParticipant) {
        //     for (const participantPriceLists of this.per_participant) {
        //     }
        // }
        this.totalPrice = priceData.getTotalPrice();
        return html `${listTemplates}`;
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
    property({ type: Object, attribute: false })
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