// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    rules: {
      // 允许单词组件名
      'vue/multi-word-component-names': 'off',
      // 允许 console.log
      'no-console': 'off',
      // 允许未使用的变量（对于 props 等）
      '@typescript-eslint/no-unused-vars': 'warn'
    }
  }
)
