import { LitElement } from 'lit';
import { TemplateResult } from 'lit-element';
declare class VtbPriceCalculatorDataPriceParticipant {
    participant_id: string;
    price: number;
}
export declare class VtbPriceCalculatorDataPriceElement {
    title?: string;
    subtitle?: string;
    price: number;
    optional: boolean;
    nights: number;
    hidden: boolean;
    day?: number;
    unitid?: number;
    participants?: Array<VtbPriceCalculatorDataPriceParticipant>;
    grouptitle?: string;
}
export declare class FilterConfig {
    segments?: Array<Array<number | string>>;
    units?: Array<Array<number | string>>;
    participants?: Array<number | string>;
    optional?: boolean;
}
export declare class VtbPriceCalculatorData {
    _data: any;
    filter(config?: FilterConfig): VtbPriceCalculatorDataPriceElement[];
    calculate(elements: Array<VtbPriceCalculatorDataPriceElement>): number;
    load(vtbSrcData: any): this;
    protected parseVtbElement(element: any, grouptitle?: string): VtbPriceCalculatorDataPriceElement;
}
export declare class VtbPriceCalculatorElement extends LitElement {
    static styles: import("lit").CSSResult;
    locale: string;
    currency: string;
    price: number;
    priceType: string;
    displayPrice: boolean | string;
    displayPricesIfZero: boolean;
    render(): TemplateResult<1>;
}
export declare class VtbPriceCalculatorElementList extends LitElement {
    static styles: import("lit").CSSResult;
    calculateTotals: boolean;
    displayTotals: boolean;
    displayPrices: boolean;
    displayPricesIfZero: boolean;
    locale: string;
    currency: string;
    totalPrice: number;
    render(): TemplateResult<1>;
}
export declare class VtbPriceCalculator extends LitElement {
    static styles: import("lit").CSSResult;
    calculateTotals: boolean;
    displayTotals: boolean;
    locale: string;
    currency: string;
    totalPrice: number;
    customStyles: string;
    priceData?: Array<VtbPriceCalculatorDataPriceElement>;
    groups: string[];
    showPerParticipant: boolean;
    render(): TemplateResult<1>;
    private renderTotals;
    renderElementDescription(element: VtbPriceCalculatorDataPriceElement): string;
    private _renderPriceData;
    private _renderPriceList;
}
declare global {
    interface HTMLElementTagNameMap {
        'vtb-pricecalculator': VtbPriceCalculator;
        'vtb-pricecalculator-list': VtbPriceCalculatorElementList;
        'vtb-pricecalculator-element': VtbPriceCalculatorElement;
    }
}
export {};
//# sourceMappingURL=vtb-pricecalculator.d.ts.map