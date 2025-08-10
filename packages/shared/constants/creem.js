/**
 * Creem.io API Configuration Constants
 * Centralized configuration for Creem payment integration
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/**
 * Check if environment is production (client-safe)
 */
var isProduction = function () {
    if (typeof window !== "undefined") {
        return window.location.hostname !== "localhost";
    }
    return process.env.NODE_ENV === "production";
};
/**
 * Creem API endpoints based on environment
 */
export var CREEM_API_CONFIG = {
    get baseUrl() {
        return isProduction() ? "https://api.creem.io" : "https://test-api.creem.io";
    },
    getBaseUrl: function () {
        return this.baseUrl;
    },
    getCustomerBillingEndpoint: function () {
        return "".concat(this.baseUrl, "/v1/customers/billing");
    },
    getApiKey: function () {
        return process.env.CREEM_API_KEY;
    },
    getWebhookSecret: function () {
        return process.env.CREEM_WEBHOOK_SECRET;
    },
    getProductId: function () {
        return process.env.CREEM_PRODUCT_ID;
    },
};
/**
 * Creem API error types
 */
var CreemApiError = /** @class */ (function (_super) {
    __extends(CreemApiError, _super);
    function CreemApiError(message, status) {
        var _this = _super.call(this, message) || this;
        _this.status = status;
        _this.name = "CreemApiError";
        return _this;
    }
    return CreemApiError;
}(Error));
export { CreemApiError };
