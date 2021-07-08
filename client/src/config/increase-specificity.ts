import { Root, Plugin, Rule } from 'postcss';

export const postcssIncreaseSpecificity = (): Plugin => {
  return {
    postcssPlugin: 'postcss-increase-specificity',
    Root: (root: Root) => {
      const sourceFileName = root.source?.input.file;
      if (sourceFileName?.includes('/node_modules') || !sourceFileName?.endsWith('.module.scss')) {
        return;
      }
      root.walkRules((rule: Rule) => {
        if (!rule.selectors) {
          return;
        }

        // eslint-disable-next-line no-param-reassign
        rule.selectors = rule.selectors.map((selector: string) => {
          if (selector.includes('#root') || selector.includes('.App')) {
            return selector;
          }
          return `:global(#root .App) ${selector}`;
        });
      });
    },
  };
};
postcssIncreaseSpecificity.postcss = true;
