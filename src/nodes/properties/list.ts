import BaseProperty from './base-property';
import Properties from './properties';

interface ListParams {
    value?: Array<BaseProperty>,
    items?: {
        type: string,
        [prop: string]: any;
     }
}

export default class ListProperty implements BaseProperty {

    /**
     * Contains the resolved property array
     */
    private _value: Array<BaseProperty>;

    /**
     * Contains the params object for a property type
     */
    private _itemTypeConfig: { [key: string]: any };

    constructor(params: ListParams){
        this._itemTypeConfig = params.items || {};
        if (!params.value || !Array.isArray(params.value)) {
            this._value = [];
        } else {
            /**
             * Merges prop values as defined in params.values w/ the item config,
             * creating the params object for the given property class
             */
            this._value = params.value.map((propValues) => {
                return new Properties[this._itemTypeConfig.type](
                    Object.assign({}, params.items, { value: propValues})
                );
            })
        }
    }

    get value(): Array<any> {
        return this._value.map((prop) => prop.value);
    }

    set value(value: Array<any>) {
        this._value = value.map((propValues) => {
            return new Properties[this._itemTypeConfig.type](
                Object.assign({}, this._itemTypeConfig, { value: propValues})
            );
        })
    }

}