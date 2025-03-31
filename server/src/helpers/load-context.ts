import { isTesting } from './is-testing';

const loadContext = async () => {
  if (isTesting()) {
    // disable console in testing mode
    console.log = () => {};
    console.error = () => {};
    console.warn = () => {};
    console.info = () => {};
  }
};

export { loadContext };
