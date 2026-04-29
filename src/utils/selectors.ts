export const selectors = {
  input: {
    textbox: { role: 'textbox' as const, name: '给 DeepSeek 发送消息' },
    deepThinking: { role: 'button' as const, name: '深度思考' },
    search: { role: 'button' as const, name: '智能搜索' },
  },
  mode: {
    fast: { role: 'radio' as const, name: '快速模式' },
    expert: { role: 'radio' as const, name: '专家模式' },
    radiogroup: { role: 'radiogroup' as const },
  },
  chat: {
    assistantReply: 'dslc-reply-wrapper',
    replyActions: 'button',
  },
  nav: {
    logo: 'img',
  },
  login: {
    signInPath: '/sign_in',
  },
};
