import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {TemplateResult} from 'lit-element';
import {ifDefined} from 'lit/directives/if-defined.js';

class VtbPriceCalculatorDataPriceParticipant {
  participant_id = '';
  price = 0.0;
}

export class VtbPriceCalculatorDataPriceElement {
  title?: string;
  subtitle?: string;
  price = 0.0;
  optional = false;
  nights = 0;
  hidden = false;
  day?: number;
  unitid?: number;
  participants?: Array<VtbPriceCalculatorDataPriceParticipant>;
  grouptitle?: string;
}

export class FilterConfig {
  segments?: Array<Array<number | string>> = [];
  units?: Array<Array<number | string>> = [];
  participants?: Array<number | string> = [];
  optional?: boolean;
}

export class VtbPriceCalculatorData {
  _data: any; // eslint-disable-line @typescript-eslint/no-explicit-any

  filter(config?: FilterConfig) {
    const price_elements: Array<VtbPriceCalculatorDataPriceElement> = [];

    const _segment_ids = config?.segments || Object.keys(this._data);
    const segment_ids = _segment_ids.flat(Infinity);

    const _unit_ids = config?.units || [];
    const unit_ids = _unit_ids.flat(Infinity);

    const _participant_ids = config?.participants || [];
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
    if (config?.optional === false) {
      skip_optional = true;
    }

    let only_optional = false;
    if (config?.optional === true) {
      only_optional = true;
    }

    for (const segment_id of segment_ids) {
      const segment = this._data[Number(segment_id)];

      for (const unit_id of Object.keys(segment)) {
        if (
          !check_unit_ids ||
          (check_unit_ids && unit_ids.includes(Number(unit_id)))
        ) {
          if (!skip_optional && !check_participant_ids && !only_optional) {
            price_elements.push(...segment[unit_id]);
            continue;
          }

          // additional checks
          const units = segment[unit_id].map(
            (u: VtbPriceCalculatorDataPriceElement) => {
              // check on optional
              if (
                (skip_optional && u.optional) ||
                (only_optional && !u.optional)
              ) {
                return;
              }

              // if no check for participants is required
              if (!check_participant_ids) {
                return u;
              }

              // check participants
              if (check_participant_ids && u.participants) {
                // make a shallow copy so we're not messing with the original price element
                const u_copy = {...u};

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
            }
          );

          price_elements.push(...units);
        }
      }
    }

    return price_elements;
  }

  calculate(elements: Array<VtbPriceCalculatorDataPriceElement>) {
    let total = 0.0;

    for (const element of elements) {
      if (!element.optional) {
        total += element.price;
      }
    }

    return total;
  }

  load(vtbSrcData: any) {  // eslint-disable-line @typescript-eslint/no-explicit-any
    const parsed_data: any = {}; // eslint-disable-line @typescript-eslint/no-explicit-any

    for (const segment of vtbSrcData.segments) {
      if (!(segment.typeId in parsed_data)) {
        parsed_data[segment.typeId] = {};
      }

      for (const element of segment.elements) {
        if (!(element.unitId in parsed_data[segment.typeId])) {
          parsed_data[segment.typeId][element.unitId] = [];
        }

        const price_element: VtbPriceCalculatorDataPriceElement =
          this.parseVtbElement(element, segment.title);

        parsed_data[segment.typeId][element.unitId].push(price_element);
      }
    }
    this._data = parsed_data;

    return this;
  }

  protected parseVtbElement(element: any, grouptitle?: string) {  // eslint-disable-line @typescript-eslint/no-explicit-any
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
      participant_element.price = parseFloat(
        element.olPrices.participants[participant_id]?.salesPrice || 0
      );
      price_element.participants.push(participant_element);
    }

    return price_element;
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

  // @property({type: Object, attribute: false})
  // priceData?: VtbPriceCalculatorData;

  @property({type: Array, attribute: false})
  priceData?: Array<VtbPriceCalculatorDataPriceElement>;

  @property({type: Array, attribute: false})
  groups = ['elements', 'surcharges', 'optionals'];

  @property({type: Boolean, attribute: false})
  showPerParticipant = false;

  override render() {
    let slotHTML: string | TemplateResult = '';

    if (this.children.length == 0 && this.priceData) {
      slotHTML = this._renderPriceData();
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
        <slot>${slotHTML}</slot>
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

  public renderElementDescription(element: VtbPriceCalculatorDataPriceElement) {
    return `${element.nights + 1} dgn. - ${element.title}`;
  }

  private _renderPriceData() {
    const priceData = this
      .priceData as Array<VtbPriceCalculatorDataPriceElement>;
    return html`
      <vtb-pricecalculator-list title=${ifDefined(this.title)}>
        ${this._renderPriceList(priceData)}
      </vtb-pricecalculator-list>
    `;
  }

  private _renderPriceList(
    priceList: Array<VtbPriceCalculatorDataPriceElement>
  ) {
    const elementTemplates: Array<TemplateResult> = [];

    for (const element of priceList) {
      if (element.hidden) {
        continue;
      }

      elementTemplates.push(
        html`
          <vtb-pricecalculator-element
            price=${element.price}
            currency=${this.currency}
            price-type=""
            display-price="true"
          >
            ${this.renderElementDescription(element)}
          </vtb-pricecalculator-element>
        `
      );
    }

    return elementTemplates;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vtb-pricecalculator': VtbPriceCalculator;
    'vtb-pricecalculator-list': VtbPriceCalculatorElementList;
    'vtb-pricecalculator-element': VtbPriceCalculatorElement;
  }
}
