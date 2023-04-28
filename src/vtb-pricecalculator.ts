import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
// import {styleMap, StyleInfo} from 'lit/directives/style-map.js';
// import {ifDefined} from 'lit/directives/if-defined.js';


@customElement('vtb-pricecalculator-element')
export class VtbPriceCalculatorElement extends LitElement {

    static override styles = css`

        :host {
            display: block;
        }

        .price-calculator-element span {
            display: block;
        }

        .description {
            float: left;
            min-width: 15rem;
            width: 69%;
        }

        .price {
            float: right;
            min-width: 10rem;
            width: 30%;
            text-align: left;
        }

        .price-calculator-element:after {
            content: " ";
            clear: both;
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

    @property({type: String, attribute: 'display-price'})
    displayPrice: string|boolean = false

    override render() {
        const currencyRenderer = new Intl.NumberFormat(this.locale, {
            style: 'currency',
            currency: this.currency,
        });

        let priceDisplay = '';
        if (this.displayPrice
            && (this.displayPrice == 'true' || this.displayPrice == '1')) {
            priceDisplay = currencyRenderer.format(this.price) as string;
        }

        if (this.displayPrice
            && this.displayPrice != 'true'
            && this.displayPrice != 'false'
            && this.displayPrice != '1') {
            priceDisplay = this.displayPrice as string;
        }

        return html`
            <div class="price-calculator-element">
                <span class="description"><slot></slot></span>
                <span class="price">${priceDisplay} &nbsp;</span>
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
    calculateTotals = false;

    @property({type: Boolean, attribute: false})
    displayPrices = false;

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
    `;

    @property({type: Boolean, attribute: 'calculate-totals'})
    calculateTotals = false;

    @property({type: Boolean, attribute: 'display-totals'})
    calculateTotals = false;

    @property({type: String})
    locale = 'nl-NL';

    @property({type: String})
    currency = 'EUR';

    @property({type: Number, attribute: 'total-price'})
    totalPrice = 0;

    override render() {
        return html`
            <div class="price-calculator"><slot></slot></div>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'vtb-pricecalculator': VtbPriceCalculator,
        'vtb-pricecalculator-list': VtbPriceCalculatorElementList,
    }
}


export class VtbPriceCalculatorTransformer {

}
