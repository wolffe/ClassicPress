/* jshint es3: false, esversion: 9 */
/**
 * Internal dependencies
 */
const { normalizeJoin, baseConfig, baseDir, camelCaseDash } = require( './shared' );
const { dependencies } = require( '../../package' );

module.exports = function( env = { environment: 'production', buildTarget: false, minify: false } ) {
	const suffix = env.minify === true ? '.min' : '';
	let buildTarget = env.buildTarget + '/wp-includes';

	const WORDPRESS_NAMESPACE = '@wordpress/';
	/**
	 * Only packages whose entry module has an ECMAScript *default export* should use `export: 'default'`.
	 * Named-export-only modules (hooks, url, i18n, a11y, …) must expose the webpack namespace object
	 * on `window.wp.*` so callers get functions like `wp.url.addQueryArgs` and `wp.hooks.addAction`.
	 */
	const defaultExportPackages = new Set([
		'api-fetch',
		'dom-ready',
	]);

	const packages = Object.keys( dependencies )
		.filter( ( packageName ) =>
 			packageName.startsWith( WORDPRESS_NAMESPACE )
 		)
		.map( ( packageName ) => packageName.replace( WORDPRESS_NAMESPACE, '' ) );

	const config = {
		...baseConfig( env ),
		entry: packages.reduce( ( memo, packageName ) => {
			memo[ packageName] = {
				import: memo[ packageName ] = normalizeJoin( baseDir, `node_modules/@wordpress/${ packageName }` ),
				library: defaultExportPackages.has( packageName )
					? {
						name: [ 'wp', camelCaseDash( packageName ) ],
						type: 'window',
						export: 'default',
					}
					: {
						name: [ 'wp', camelCaseDash( packageName ) ],
						type: 'window',
						export: undefined,
					}
			};

			return memo;
		}, {} ),
		output: {
			devtoolNamespace: 'wp',
			filename: `[name]${ suffix }.js`,
			path: normalizeJoin( baseDir, `${ buildTarget }/js/dist` ),
			environment: {
				arrowFunction: env.minify,
				const: env.minify
			}
		}
	};

	return config;
};
