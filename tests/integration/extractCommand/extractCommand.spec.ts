import jsLogger from '@map-colonies/js-logger';
import { trace } from '@opentelemetry/api';

import { getApp } from '../../../src/app';
import { SERVICES } from '../../../src/common/constants';
import { ExtractCommandCliTrigger } from './helpers/CliTrigger';

describe('extractCommand', function () {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let cli: ExtractCommandCliTrigger;
  let consoleLogMock: jest.SpyInstance;
  let processExitMock: jest.SpyInstance;

  beforeEach(function () {
    consoleLogMock = jest.spyOn(global.console, 'log');
    consoleLogMock.mockReturnValue(undefined);
    jest.spyOn(global.console, 'error').mockReturnValue(undefined); // prevent cli error logs from messing with test log on bad path tests
    processExitMock = jest.spyOn(global.process, 'exit');
    processExitMock.mockReturnValueOnce(undefined); //prevent cli exit from killing the test

    const app = getApp({
      override: [
        { token: SERVICES.LOGGER, provider: { useValue: jsLogger({ enabled: false }) } },
        { token: SERVICES.TRACER, provider: { useValue: trace.getTracer('testTracer') } },
      ],
      useChild: true,
    });
    cli = new ExtractCommandCliTrigger(app);
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('Happy Path', function () {
    it('add tests', function () {
      expect(true).toBeTruthy();
    });
  });
});
