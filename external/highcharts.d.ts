/**
 * Enabling the usage of ES6 module loading.
 */
declare var Highcharts: any;

/**
 * Declaration for ES6 module loading.
 */
declare module "highcharts" {
    export = Highcharts;
}
