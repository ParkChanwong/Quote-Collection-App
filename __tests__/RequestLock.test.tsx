import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import useRequestLock from '../src/hooks/useRequestLock';
import { QueryStatus } from '../src/components/CollectionContent';

test('blocks presses before a render and releases the lock after failure', async () => {
  let lock!: ReturnType<typeof useRequestLock>;
  function Harness() {
    lock = useRequestLock();
    return null;
  }
  let renderer!: TestRenderer.ReactTestRenderer;
  await act(() => {
    renderer = TestRenderer.create(<Harness />);
  });
  let reject!: (error: Error) => void;
  const request = jest.fn(
    () =>
      new Promise<void>((_resolve, fail) => {
        reject = fail;
      }),
  );
  let result!: Promise<unknown>;
  await act(() => {
    result = lock.run(request).catch(error => error);
    lock.run(request);
  });
  expect(request).toHaveBeenCalledTimes(1);
  expect(lock.pending).toBe(true);
  await act(async () => {
    reject(new Error('failed'));
    await result;
  });
  expect(lock.pending).toBe(false);
  const retry = jest.fn().mockResolvedValue(undefined);
  await act(() => lock.run(retry));
  expect(retry).toHaveBeenCalledTimes(1);
  await act(() => renderer.unmount());
});

test('retry button disables during a request and does not cancel an existing fetch', async () => {
  let resolve!: () => void;
  const refetch = jest.fn(
    () =>
      new Promise<any>(done => {
        resolve = () => done({});
      }),
  );
  let renderer!: TestRenderer.ReactTestRenderer;
  await act(() => {
    renderer = TestRenderer.create(
      <QueryStatus
        query={{ isPending: false, isError: true, isFetching: false, refetch }}
      />,
    );
  });
  const button = () =>
    renderer.root.findAll(
      item =>
        item.props.accessibilityRole === 'button' &&
        typeof item.props.onPress === 'function',
    )[0];
  let request!: Promise<void>;
  await act(() => {
    const press = button().props.onPress;
    request = press();
    press();
  });
  expect(refetch).toHaveBeenCalledTimes(1);
  expect(refetch).toHaveBeenCalledWith({ cancelRefetch: false });
  expect(button().props.disabled).toBe(true);
  await act(async () => {
    resolve();
    await request;
  });
  expect(button().props.disabled).toBe(false);
  await act(() => renderer.unmount());
});
