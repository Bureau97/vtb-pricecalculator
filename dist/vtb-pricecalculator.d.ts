import { LitElement } from 'lit';
import { TemplateResult } from 'lit-element';
export declare enum VtbSegmentTypes {
    DESTINATION = 1,
    FLIGHT = 2,
    ADDITIONAL = 3,
    HIDDEN = 4
}
export declare enum VtbUnitTypes {
    ACCO = 2,
    TRANSPORT = 4,
    TRANSFER = 5,
    CARRENTAL = 6,
    SURCHARGE = 11
}
export declare class VtbPriceCalculatorDataPriceElement {
    title?: string;
    price: number;
    optional: boolean;
    nights: number;
    hidden: boolean;
}
export declare class VtbPriceCalculatorDataPriceList {
    title?: string;
    total: number;
    displayPrices: boolean;
    displayPricesIfZero: boolean;
    private _elements;
    constructor();
    addElement(element: VtbPriceCalculatorDataPriceElement): this;
    getElements(): VtbPriceCalculatorDataPriceElement[];
}
export declare class VtbPriceCalculatorData {
    elements: VtbPriceCalculatorDataPriceList;
    optionals: VtbPriceCalculatorDataPriceList;
    surcharges: VtbPriceCalculatorDataPriceList;
    per_participant: Array<VtbPriceCalculatorDataPriceList>;
    constructor();
    getTotalPrice(): number;
}
export declare class VtbPriceCalculatorDataTransformer {
    load(vtbSrcData: any): VtbPriceCalculatorData;
    protected parseVtbElement(element: any): VtbPriceCalculatorDataPriceElement;
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
    priceData?: VtbPriceCalculatorData;
    groups: string[];
    showPerParticipant: boolean;
    render(): TemplateResult<1>;
    private renderTotals;
    private _renderPriceList;
    private _renderPriceData;
}
declare global {
    interface HTMLElementTagNameMap {
        'vtb-pricecalculator': VtbPriceCalculator;
        'vtb-pricecalculator-list': VtbPriceCalculatorElementList;
        'vtb-pricecalculator-element': VtbPriceCalculatorElement;
    }
}
//# sourceMappingURL=vtb-pricecalculator.d.ts.map