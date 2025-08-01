/** @type {import('stylelint').Config} */
export default {
	extends: ['stylelint-config-standard-scss', 'stylelint-config-clean-order'],
	rules: {
		'selector-class-pattern':
			'([A-Za-z0-9]+(?:-[A-Za-z0-9]+)*)(?:__([A-Za-z0-9]+(?:-[A-Za-z0-9]+)*))?(?:--([A-Za-z0-9]+(?:-[A-Za-z0-9]+)*))?',
		'selector-pseudo-class-no-unknown': [
			true,
			{
				ignorePseudoClasses: ['global'],
			},
		],
	},
};
