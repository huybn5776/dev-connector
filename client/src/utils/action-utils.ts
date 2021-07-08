export function actionNameCreator(state: string): {
  actionName: (action: string) => string;
  asyncActionNames: (action: string) => [string, string, string];
} {
  return {
    actionName: (action: string) => `${state} ${action}`,
    asyncActionNames: (action: string) => {
      const request = `[${state}] ${action}`;
      const success = `[${state}] ${action} success`;
      const fail = `[${state}] ${action} fail`;
      return [request, success, fail];
    },
  };
}
