type ActionNameFormat<S extends string, A extends string> = [`[${S}] ${A}`, `[${S}] ${A} success`, `[${S}] ${A} fail`];

export function actionNameCreator<S extends string>(
  state: S,
): {
  actionName: <A extends string>(action: A) => ActionNameFormat<S, A>[0];
  asyncActionNames: <A extends string>(action: A) => ActionNameFormat<S, A>;
} {
  return {
    actionName: <A extends string>(action: A) => `[${state}] ${action}`,
    asyncActionNames: <A extends string>(action: A) => {
      const request = `[${state}] ${action}`;
      const success = `[${state}] ${action} success`;
      const fail = `[${state}] ${action} fail`;
      return [request, success, fail] as ActionNameFormat<S, A>;
    },
  };
}
