export function promiseMajority<T>(tasks: Promise<T>[], check: (data: T) => Boolean) {
  const okResults = [];
  const koResults = [];

  return new Promise((resolve, reject) => {
    function onResolve(data: T) {
      const isOk = check(data);
      if (isOk) {
        okResults.push(data);
      } else {
        koResults.push(data);
      }
      maybeHandleMajority();
    }
    function onReject() {
      koResults.push(false);
      maybeHandleMajority();
    }
    function maybeHandleMajority() {
      if (okResults.length > tasks.length / 2) {
        return resolve(true);
      }
      if (koResults.length > tasks.length / 2) {
        return resolve(false);
      }
      return;
    }
    tasks.forEach((task) => task.then(onResolve).catch(onReject));
  });
}
