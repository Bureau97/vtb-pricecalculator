import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {TemplateResult} from 'lit-element';
// import {styleMap, StyleInfo} from 'lit/directives/style-map.js';
import {ifDefined} from 'lit/directives/if-defined.js';

export enum VtbSegmentTypes {
  DESTINATION = 1,
  FLIGHT = 2,
  ADDITIONAL = 3,
  HIDDEN = 4,
}

export enum VtbUnitTypes {
  ACCO = 2,
  TRANSPORT = 4,
  TRANSFER = 5,
  CARRENTAL = 6,
  SURCHARGE = 11,
}

export class VtbPriceCalculatorDataPriceElement {
  title?: string;
  price = 0.0;
  optional = false;
  nights = 0;
  hidden = false;
}

export class VtbPriceCalculatorDataPriceList {
  title?: string;
  total = 0.0;
  displayPrices = false;
  displayPricesIfZero = false;

  private _elements: Array<VtbPriceCalculatorDataPriceElement>;

  constructor() {
    this._elements = [];
    this.title = '';
  }

  addElement(element: VtbPriceCalculatorDataPriceElement) {
    this._elements?.push(element);

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
  elements: VtbPriceCalculatorDataPriceList;
  optionals: VtbPriceCalculatorDataPriceList;
  surcharges: VtbPriceCalculatorDataPriceList;
  per_participant: Array<VtbPriceCalculatorDataPriceList>;

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
  load(vtbSrcData: any) {  // eslint-disable-line @typescript-eslint/no-explicit-any
    const _data = new VtbPriceCalculatorData();

    for (const segment of vtbSrcData.segments) {
      for (const element of segment.elements) {
        const _element:VtbPriceCalculatorDataPriceElement =
            this.parseVtbElement(element);

        if (
          segment.typeId == VtbSegmentTypes.DESTINATION ||
          segment.typeId == VtbSegmentTypes.FLIGHT
        ) {
          if (_element.optional) {
            _data.optionals?.addElement(_element);
          } else {
            _data.elements?.addElement(_element);
          }
        }
        if (
          segment.typeId == VtbSegmentTypes.ADDITIONAL ||
          segment.typeId == VtbSegmentTypes.HIDDEN
        ) {
          _element.hidden = segment.typeId == VtbSegmentTypes.HIDDEN;

          _data.surcharges?.addElement(_element);
        }
      }
    }

    return _data;
  }

  protected parseVtbElement(element: any) {  // eslint-disable-line @typescript-eslint/no-explicit-any
    const _element = new VtbPriceCalculatorDataPriceElement();
    _element.title = element.title;
    _element.optional = element.optional;
    _element.price = parseFloat(element.olPrices.salesTotal || 0);
    _element.nights = element.flexNights || element.nights;

    return _element;
  }
}

@customElement('vtb-pricecalculator-element')
export class VtbPriceCalculatorElement extends LitElement {
  static override styles = css`
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

  @property({type: String})
  locale = 'nl-NL';

  @property({type: String})
  currency = 'EUR';

  @property({type: Number})
  price = 0;

  @property({type: String, attribute: 'price-type'})
  priceType = 'pp';

  @property({
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
  displayPrice: boolean | string = false;

  @property({
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
  displayPricesIfZero = false;

  override render() {
    const priceRenderer = new Intl.NumberFormat(this.locale, {
      style: 'currency',
      currency: this.currency,
    });

    let priceDisplay = '';
    if (this.displayPrice && typeof this.displayPrice == 'boolean') {
      priceDisplay = priceRenderer.format(this.price) as string;
    }

    if (!this.displayPrice && typeof this.displayPrice == 'boolean') {
      priceDisplay = '';
    }

    if (this.displayPrice && typeof this.displayPrice == 'string') {
      priceDisplay = this.displayPrice;
    }

    if (
      this.displayPrice &&
      typeof this.displayPrice == 'boolean' &&
      this.price == 0 &&
      !this.displayPricesIfZero
    ) {
      priceDisplay = '';
    }

    return html`
      <div class="price-calculator-element">
        <div class="description">
          <slot></slot>
        </div>
        <div class="price">${priceDisplay} &nbsp;</div>
      </div>
    `;
  }
}

@customElement('vtb-pricecalculator-list')
export class VtbPriceCalculatorElementList extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }
  `;

  @property({type: Boolean, attribute: 'calculate-totals'})
  calculateTotals = false;

  @property({type: Boolean, attribute: 'display-totals'})
  displayTotals = false;

  @property({type: Boolean, attribute: false})
  displayPrices = false;

  @property({type: Boolean, attribute: 'display-zero'})
  displayPricesIfZero = false;

  @property({type: String})
  locale = 'nl-NL';

  @property({type: String})
  currency = 'EUR';

  @property({type: Number, attribute: 'total-price'})
  totalPrice = 0;

  override render() {
    return html`
      <div class="price-calculator-element-list">
        <h3>${this.title}</h3>
        <div class="">
          <slot></slot>
        </div>
      </div>
    `;
  }
}

@customElement('vtb-pricecalculator')
export class VtbPriceCalculator extends LitElement {
  static override styles = css`
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

  @property({type: Boolean, attribute: 'calculate-totals'})
  calculateTotals = false;

  @property({type: Boolean, attribute: 'display-totals'})
  displayTotals = false;

  @property({type: String})
  locale = 'nl-NL';

  @property({type: String})
  currency = 'EUR';

  @property({type: Number, attribute: 'total-price'})
  totalPrice = 0;

  @property({type: String, attribute: false})
  customStyles = '';

  @property({type: Object, attribute: false})
  priceData?: VtbPriceCalculatorData;

  @property({type: Array, attribute: false})
  groups = ['elements', 'surcharges', 'optionals'];

  @property({type: Boolean, attribute: false})
  showPerParticipant = false;

  override render() {
    let _innerHTML: string | TemplateResult = '';

    if (this.children.length == 0 && this.priceData) {
      _innerHTML = this._renderPriceData();
    }

    let customStyles;
    if (this.customStyles) {
      customStyles = html`
                <style type=text/css>${this.customStyles}</style>
            `;
    }

    return html`
      ${customStyles}
      <div class="price-calculator">
        <slot>${_innerHTML}</slot>
        ${this.renderTotals()}
      </div>
    `;
  }

  private renderTotals() {
    if (this.displayTotals) {
      return html`
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

  private _renderPriceList(priceList: VtbPriceCalculatorDataPriceList) {
    const elementTemplates: Array<TemplateResult> = [];

    for (const element of priceList.getElements()) {
      if (element.hidden) {
        continue;
      }

      elementTemplates.push(
        html`
          <vtb-pricecalculator-element
            price=${element.price}
            currency=${this.currency}
            price-type=""
            display-price=${ifDefined(priceList.displayPrices)}
            display-zero=${ifDefined(priceList.displayPricesIfZero)}
          >
            ${element.title}
          </vtb-pricecalculator-element>
        `
      );
    }

    return elementTemplates;
  }

  private _renderPriceData() {
    const priceData = this.priceData as VtbPriceCalculatorData;
    const listTemplates: Array<TemplateResult> = [];
    type ObjectKey = keyof typeof priceData;

    for (const group of this.groups) {
      const _group = group as ObjectKey;
      const priceList = priceData[_group] as VtbPriceCalculatorDataPriceList;

      listTemplates.push(
        html`
          <vtb-pricecalculator-list
            title=${ifDefined(priceList.title)}
          >
            ${this._renderPriceList(priceList)}
          </vtb-pricecalculator-list>
        `
      );
    }

    // if (this.showPerParticipant) {
    //     for (const participantPriceLists of this.per_participant) {

    //     }
    // }

    this.totalPrice = priceData.getTotalPrice();

    return html`${listTemplates}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vtb-pricecalculator': VtbPriceCalculator;
    'vtb-pricecalculator-list': VtbPriceCalculatorElementList;
    'vtb-pricecalculator-element': VtbPriceCalculatorElement;
  }
}
